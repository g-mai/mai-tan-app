import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import {
  customSession,
  emailOTP,
  organization as organizationPlugin,
} from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { asc, eq } from "drizzle-orm";
import {
  findSoleOwnedOrgs,
  pickActiveOrganizationId,
} from "#/features/organizations/lib/org";
import { db } from "#/lib/db";
import {
  authSchema,
  member,
  organization,
  session as sessionTable,
} from "#/lib/db/schema";
import {
  sendInvitationEmail,
  sendResetPasswordEmail,
  sendVerificationOtpEmail,
  sendVerifyEmail,
} from "#/lib/resend/emails";

const options = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    session: {
      create: {
        // Sets an active organization at sign-in
        before: async (session) => {
          const rows = await db
            .select({ organizationId: member.organizationId })
            .from(member)
            .where(eq(member.userId, session.userId))
            .orderBy(asc(member.createdAt));

          return {
            data: {
              ...session,
              activeOrganizationId: pickActiveOrganizationId(
                rows.map((row) => row.organizationId),
              ),
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      lastName: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      onboardingStep: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
    deleteUser: {
      enabled: true,
      // Delete the orgs that would be with no owner if this user disappeared.
      beforeDelete: async (user) => {
        const memberships = await db.query.member.findMany({
          where: (member, { eq }) => eq(member.userId, user.id),
          with: {
            organization: {
              with: { members: { columns: { userId: true, role: true } } },
            },
          },
        });

        const orgs = findSoleOwnedOrgs(
          memberships.map((membership) => membership.organization),
          user.id,
        );

        for (const org of orgs) {
          // Teams, members and invitations cascade on organization.id.
          await db.delete(organization).where(eq(organization.id, org.id));
        }
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async (
        {
          user,
          url,
          token,
        }: { user: { email: string }; url: string; token: string },
        request: unknown,
      ) => {
        console.log("Sending change email verification email to", user.email);
        // await sendVerifyEmail({ user, url, token });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log("Preparing to send reset password email to:", user.email);
      await sendResetPasswordEmail({
        user: user as Parameters<typeof sendResetPasswordEmail>[0]["user"],
        url,
        token,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password reset successful for user: ${user.email}`);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendVerifyEmail({
        user: user as Parameters<typeof sendVerifyEmail>[0]["user"],
        url,
        token,
      });
    },
    autoSignInAfterVerification: true,
  },
  plugins: [
    organizationPlugin({
      membershipLimit: 100, // TODO: dynamic based on plan
      sendInvitationEmail: async (data) => {
        await sendInvitationEmail({
          email: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name || data.inviter.user.email,
          url: `${process.env.BETTER_AUTH_URL}/invite/${data.id}`,
        });
      },
      schema: {
        organization: {
          additionalFields: {
            description: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
            website: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
            address: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
            postCode: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
            country: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
            phone: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
          },
        },
        team: {
          additionalFields: {
            description: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
            color: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "#17967f",
            },
            logo: {
              type: "string",
              input: true,
              required: false,
              defaultValue: "",
            },
          },
        },
      },
      teams: {
        enabled: true,
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendVerificationOtpEmail({
            email,
            otp,
          });
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
      expiresIn: 10 * 60, // 10 minutes
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const rows = await db
        .select({ organization })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(eq(member.userId, user.id))
        .orderBy(asc(member.createdAt));

      const orgs = rows.map((r) => r.organization);

      // Make sure activeOrganizationId is always set and valid
      // (covering for deleted memberships and other org changes).
      const activeOrganizationId = pickActiveOrganizationId(
        orgs.map((org) => org.id),
        session.activeOrganizationId,
      );

      if (activeOrganizationId !== session.activeOrganizationId) {
        await db
          .update(sessionTable)
          .set({ activeOrganizationId })
          .where(eq(sessionTable.id, session.id));
      }

      return {
        user,
        session: { ...session, activeOrganizationId },
        orgs,
      };
    }, options),

    // Cookies' plugin must always stay last
    tanstackStartCookies(),
  ],
});
