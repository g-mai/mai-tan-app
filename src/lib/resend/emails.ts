import { Resend } from "resend";
import { ResetPasswordEmailTemplate } from "#/components/emails/reset-password-email";
import { VerificationEmailTemplate } from "#/components/emails/verification-email";
import type { User } from "@/types/auth-types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerifyEmail(
  { user, url, token }: { user: User; url: string; token: string },
  request?: unknown,
) {
  console.log("Sending verification email to:", user.email);
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_ADDRESS_EMAIL || "From Email <from@email.com>",
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
      from: process.env.FROM_ADDRESS_EMAIL || "From Email <from@email.com>",
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
