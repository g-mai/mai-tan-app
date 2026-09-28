import type { User } from "#/features/auth/types";
import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailMutedText,
} from "#/lib/resend/email-layout";

export function ChangeEmailConfirmationTemplate({
  user,
  newEmail,
  url,
}: {
  user: Pick<User, "name" | "email">;
  newEmail: string;
  url: string;
}) {
  return (
    <EmailLayout previewText="Approve your Mai Tan email change">
      <EmailHeading>Approve your email change</EmailHeading>
      <p style={{ margin: "0 0 16px" }}>Hi {user.name},</p>
      <p style={{ margin: "0 0 16px" }}>
        We received a request to change your account email from {user.email} to{" "}
        {newEmail}. Approve this request to send a verification link to your new
        address.
      </p>
      <EmailButton href={url}>Approve email change</EmailButton>
      <EmailMutedText>
        If you didn't request this change, you can ignore this email. Your
        account email won't change without verification of the new address.
      </EmailMutedText>
    </EmailLayout>
  );
}
