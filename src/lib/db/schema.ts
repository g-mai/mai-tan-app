import * as authSchema from "./auth-schema";

// import * as appSchema from "./app-schema";

export { authSchema };

export const {
  user,
  session,
  account,
  verification,
  organization,
  member,
  team,
  teamMember,
  invitation,
} = authSchema;

export const schema = {
  ...authSchema,
  // ...appSchema,
} as const;
