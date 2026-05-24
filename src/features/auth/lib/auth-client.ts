import { createAuthClient } from "better-auth/client";
import {
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";

import type { auth } from "./auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
      teams: {
        enabled: true,
      },
    }),
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
