import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { organization as organizationPlugin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "#/db";
import { authSchema } from "#/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
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
    // changeEmail: {
    //   enabled: true,
    //   sendChangeEmailVerification: async ({ user, url, token }, request) => {
    //     console.log('Sending change email verification email to', user.email)
    //     // await sendVerifyEmail({ user, url, token });
    //   }
    // }
  },
  emailAndPassword: {
    enabled: true,
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
          },
        },
      },
      teams: {
        enabled: true,
      },
    }),
    tanstackStartCookies(),
  ],
});
