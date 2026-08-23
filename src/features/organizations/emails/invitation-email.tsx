export function InvitationEmailTemplate({
  organizationName,
  inviterName,
  url,
}: {
  organizationName: string;
  inviterName: string;
  url: string;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ color: "#333" }}>
        You've been invited to {organizationName}
      </h1>
      <p>
        {inviterName} invited you to join <strong>{organizationName}</strong> on
        Mai Tan App.
      </p>
      <p>
        <a href={url}>Accept the invitation</a>
      </p>
      <p>This invitation expires in 48 hours.</p>
      <p>
        If you weren't expecting it, you can safely ignore this email — nothing
        happens until you accept.
      </p>
    </div>
  );
}
