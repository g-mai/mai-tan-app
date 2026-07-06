import { createAuthClient } from "better-auth/client";
import {
  anonymousClient,
  customSessionClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";

import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
      teams: {
        enabled: true,
      },
    }),
    anonymousClient(),
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  listSessions,
  sendVerificationEmail,
  changeEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateUser,
  revokeSession,
  revokeOtherSessions,
  organization,
} = authClient;
