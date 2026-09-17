import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailMutedText,
} from "#/lib/resend/email-layout";

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
    <EmailLayout
      previewText={`${inviterName} invited you to join ${organizationName} on Mai Tan`}
    >
      <EmailHeading>You've been invited to {organizationName}</EmailHeading>
      <p style={{ margin: "0 0 16px" }}>
        {inviterName} invited you to join <strong>{organizationName}</strong> on
        Mai Tan.
      </p>
      <EmailButton href={url}>Accept invitation</EmailButton>
      <EmailMutedText>
        This invitation expires in 48 hours. If you weren't expecting it, you
        can safely ignore this email — nothing happens until you accept.
      </EmailMutedText>
    </EmailLayout>
  );
}
