import type { User } from "#/features/auth/types";
import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailMutedText,
} from "#/lib/resend/email-layout";

interface EmailTemplateProps {
  user: User;
  url: string;
  token: string;
}

export function ResetPasswordEmailTemplate({ user, url }: EmailTemplateProps) {
  return (
    <EmailLayout previewText="Reset your Mai Tan password">
      <EmailHeading>Reset your password</EmailHeading>
      <p style={{ margin: "0 0 16px" }}>Hi {user.name},</p>
      <p style={{ margin: "0 0 16px" }}>
        We received a request to reset the password for your account. Click the
        button below to choose a new one.
      </p>
      <EmailButton href={url}>Reset password</EmailButton>
      <EmailMutedText>
        This link expires in 1 hour. If you didn't request a password reset, you
        can safely ignore this email — your password won't be changed.
      </EmailMutedText>
    </EmailLayout>
  );
}
