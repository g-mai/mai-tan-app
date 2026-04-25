import * as auth from "./auth-schema";

export const user = auth.user;
export const account = auth.account;
export const session = auth.session;
export const verification = auth.verification;

export const schema = { user, account, session, verification };
export default schema;
