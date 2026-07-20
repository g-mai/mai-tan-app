import { Resend } from "resend";
import { ResetPasswordEmailTemplate } from "#/features/auth/emails/reset-password-email";
import { VerificationEmailTemplate } from "#/features/auth/emails/verification-email";
import { env } from "#/lib/env";
import type { User } from "@/features/auth/types";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerifyEmail(
  { user, url, token }: { user: User; url: string; token: string },
  request?: unknown,
) {
  console.log("Sending verification email to:", user.email);
  try {
    const { data, error } = await resend.emails.send({
      from: env.FROM_ADDRESS_EMAIL,
      to: [user.email],
      subject: "Verify Your Email Address",
      react: VerificationEmailTemplate({ user, url, token }),
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    console.log("Verification email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error; // Re-throw so Better Auth knows it failed
  }
}

export async function sendResetPasswordEmail(
  { user, url, token }: { user: User; url: string; token: string },
  request?: unknown,
) {
  console.log("Sending reset password email to:", user.email);
  try {
    const { data, error } = await resend.emails.send({
      from: env.FROM_ADDRESS_EMAIL,
      to: [user.email],
      subject: "Reset Your Password",
      react: ResetPasswordEmailTemplate({ user, url, token }),
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(
        `Failed to send reset password email email: ${error.message}`,
      );
    }

    console.log("Reset password email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    throw error; // Re-throw so Better Auth knows it failed
  }
}

export async function sendNotificationToAdmin(
  { subject, message }: { subject: string; message: string },
  request?: unknown,
) {
  if (!process.env.ADMIN_EMAIL) {
    console.warn(
      "ADMIN_EMAIL is not set in environment variables. Skipping notification email.",
    );
    return { success: false, message: "ADMIN_EMAIL not set" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: env.FROM_ADDRESS_EMAIL,
      to: [process.env.ADMIN_EMAIL],
      subject,
      text: message,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(
        `Failed to send notification email to admin: ${error.message}`,
      );
    }

    console.log("Notification email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send notification email to admin:", error);
    throw error; // Re-throw so Better Auth knows it failed
  }
}
