import type { User } from "#/features/auth/types";

export function VerificationEmailTemplate({
  user,
  url,
  token,
}: {
  user: User;
  url: string;
  token: string;
}) {
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

export function VerificationEmailOTPTemplate({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ color: "#333" }}>Verify Your Email</h1>
      <p>Enter this code to finish creating your account for {email}:</p>
      <p
        style={{
          fontFamily: "monospace",
          fontSize: "32px",
          fontWeight: "bold",
          letterSpacing: "8px",
          color: "#333",
        }}
      >
        {otp}
      </p>
      <p>This code expires in 10 minutes.</p>
      <p>
        If you didn't request it, you can safely ignore this email — no account
        will be created.
      </p>
    </div>
  );
}
