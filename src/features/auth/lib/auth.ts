import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import {
  customSession,
  organization as organizationPlugin,
} from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
import { db } from "#/lib/db";
import { authSchema, member, organization } from "#/lib/db/schema";
import { sendResetPasswordEmail, sendVerifyEmail } from "#/lib/resend/emails";

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
      favouriteOrganization: {
        type: "string",
        required: false,
        defaultValue: "",
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
      if (process.env.SKIP_VERIFICATION_EMAIL === "true") {
        // Skipping verification email (seed mode)
        return;
      }
      console.log("Preparing to send verification email to:", user.email);
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

    tanstackStartCookies(),
  ],
} satisfies BetterAuthOptions;

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "pg",
//     schema: authSchema,
//   }),
//   session: {
//     cookieCache: {
//       enabled: true,
//       maxAge: 5 * 60,
//     },
//   },
//   user: {
//     additionalFields: {
//       firstName: {
//         type: "string",
//         required: false,
//         defaultValue: "",
//       },
//       lastName: {
//         type: "string",
//         required: false,
//         defaultValue: "",
//       },
//       favouriteOrganization: {
//         type: "string",
//         required: false,
//         defaultValue: "",
//       },
//     },
//     changeEmail: {
//       enabled: true,
//       sendChangeEmailVerification: async (
//         {
//           user,
//           url,
//           token,
//         }: { user: { email: string }; url: string; token: string },
//         request: unknown,
//       ) => {
//         console.log("Sending change email verification email to", user.email);
//         // await sendVerifyEmail({ user, url, token });
//       },
//     },
//   },
//   emailAndPassword: {
//     enabled: true,
//     requireEmailVerification: true,
//     sendResetPassword: async ({ user, url, token }, request) => {
//       console.log("Preparing to send reset password email to:", user.email);
//       await sendResetPasswordEmail({
//         user: user as Parameters<typeof sendResetPasswordEmail>[0]["user"],
//         url,
//         token,
//       });
//     },
//     onPasswordReset: async ({ user }, request) => {
//       console.log(`Password reset successful for user: ${user.email}`);
//     },
//   },
//   emailVerification: {
//     sendVerificationEmail: async ({ user, url, token }, request) => {
//       if (process.env.SKIP_VERIFICATION_EMAIL === "true") {
//         // Skipping verification email (seed mode)
//         return;
//       }
//       console.log("Preparing to send verification email to:", user.email);
//       await sendVerifyEmail({
//         user: user as Parameters<typeof sendVerifyEmail>[0]["user"],
//         url,
//         token,
//       });
//     },
//     autoSignInAfterVerification: true,
//   },
//   plugins: [
//     organizationPlugin({
//       schema: {
//         organization: {
//           additionalFields: {
//             description: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//             website: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//             address: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//             postCode: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//             country: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//             phone: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//           },
//         },
//         team: {
//           additionalFields: {
//             description: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//             color: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "#17967f",
//             },
//             logo: {
//               type: "string",
//               input: true,
//               required: false,
//               defaultValue: "",
//             },
//           },
//         },
//       },
//       teams: {
//         enabled: true,
//       },
//     }),

//     ...(options.plugins ?? []),
//     customSession(async ({ user, session }) => {
//       const rows = await db
//         .select()
//         .from(organization)
//         .innerJoin(member, eq(member.organizationId, organization.id))
//         .where(eq(member.userId, user.id));

//       return { user, session, orgs: rows.map((r) => r.organization) };
//     }),
//     tanstackStartCookies(),
//   ],
// });

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const rows = await db
        .select()
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(eq(member.userId, user.id));

      return { user, session, orgs: rows.map((r) => r.organization) };
    }, options),
  ],
});
