import type { User } from "#/features/auth/types";
import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailMutedText,
} from "#/lib/resend/email-layout";

export function VerificationEmailTemplate({
  user,
  url,
}: {
  user: User;
  url: string;
  token: string;
}) {
  return (
    <EmailLayout previewText="Verify your email for Mai Tan">
      <EmailHeading>Verify your email</EmailHeading>
      <p style={{ margin: "0 0 16px" }}>Hi {user.name},</p>
      <p style={{ margin: "0 0 16px" }}>
        Please confirm this email address for your account.
      </p>
      <EmailButton href={url}>Verify email</EmailButton>
      <EmailMutedText>
        If you didn't request this email, you can safely ignore it.
      </EmailMutedText>
    </EmailLayout>
  );
}

export function VerificationEmailOTPTemplate({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  return (
    <EmailLayout previewText={`Your Mai Tan verification code is ${otp}`}>
      <EmailHeading>Verify your email</EmailHeading>
      <p style={{ margin: "0 0 16px" }}>
        Enter this code to finish creating your account for {email}:
      </p>
      <p
        style={{
          fontFamily:
            "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "8px",
          color: "#1f2937",
          margin: "0 0 16px",
        }}
      >
        {otp}
      </p>
      <EmailMutedText>
        This code expires in 10 minutes. If you didn't request it, you can
        safely ignore this email — no account will be created.
      </EmailMutedText>
    </EmailLayout>
  );
}
