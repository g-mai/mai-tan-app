/** How long a passwordless registration is kept before it's considered dead. */
export const ABANDONED_AFTER_MS = 48 * 60 * 60 * 1000;

type CandidateUser = {
  createdAt: Date;
  accounts: { providerId: string }[];
  members: { id: string }[];
};

/**
 * Registration created a user row (the email OTP does that on verification) and
 * then stopped before a password was ever set.
 *
 * The **member condition is load-bearing, not belt-and-braces.** Fake teammates
 * and users created by an invitation are passwordless too, and without it they
 * would silently vanish 48 hours after the organization was built. Org
 * membership is the signal that a passwordless user was deliberately created by
 * someone else; an abandoned registration can never have it, because joining or
 * creating an organization only happens after the password step.
 */
export function isAbandonedRegistration(
  user: CandidateUser,
  now = new Date(),
): boolean {
  const hasPassword = user.accounts.some(
    (account) => account.providerId === "credential",
  );
  if (hasPassword) return false;

  if (user.members.length > 0) return false;

  return now.getTime() - user.createdAt.getTime() >= ABANDONED_AFTER_MS;
}
