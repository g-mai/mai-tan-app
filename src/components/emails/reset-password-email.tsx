import type { User } from "@/types/auth-types";

interface EmailTemplateProps {
  user: User;
  url: string;
  token: string;
}

export function ResetPasswordEmailTemplate({
  user,
  url,
  token,
}: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ color: "#333" }}>Reset Your Password</h1>
      <p>Hello {user.name},</p>
      <p>
        Click the link to reset your password:
        <a href={url}>Reset Password</a>
      </p>
      <p>Thank you!</p>
      <pre className="bg-muted rounded-xl p-2 text-left text-xs break-all whitespace-pre-wrap max-w-sm m-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
