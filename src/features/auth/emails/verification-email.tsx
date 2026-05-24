import type { User } from "#/features/auth/types";

interface EmailTemplateProps {
  user: User;
  url: string;
  token: string;
}

export function VerificationEmailTemplate({
  user,
  url,
  token,
}: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ color: "#333" }}>Verify Your Email</h1>
      <p>Hello {user.name},</p>
      <p>
        Please verify your email address by clicking the link below:
        <a href={url}>Verify Email</a>
      </p>
      <p>Thank you!</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
