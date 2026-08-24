import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { emailOtp, signIn } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";
import { sendNotificationToAdmin } from "#/lib/resend/emails";

type OtpError = { code?: string; message?: string; status?: number };

/**
 * The plugin invalidates the code after 3 wrong attempts, and rate-limits every
 * email-otp endpoint to 3 requests / 60s — so a burst of wrong codes can come
 * back as a 429 instead of TOO_MANY_ATTEMPTS. Both mean the same thing to the
 * user: this code is dead, ask for another one.
 */
function needsNewCode(error: OtpError) {
  return (
    error.status === 429 ||
    error.code === "OTP_EXPIRED" ||
    error.code === "TOO_MANY_ATTEMPTS"
  );
}

function verifyErrorMessage(error: OtpError) {
  if (error.status === 429) {
    return "Too many attempts. Wait a minute, then request a new code.";
  }
  switch (error.code) {
    case "INVALID_OTP":
      return "That code isn't right. Check it and try again.";
    case "OTP_EXPIRED":
      return "That code has expired. Request a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many attempts. Request a new code.";
    default:
      return error.message || "Could not verify the code.";
  }
}

export function useVerifyEmailOtp(email: string) {
  const router = useRouter();
  const verifyFormSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
  });

  type VerifyFormData = z.infer<typeof verifyFormSchema>;

  const verify = useMutation({
    mutationFn: async (values: VerifyFormData) => {
      const { data, error } = await signIn.emailOtp({
        email,
        otp: values.otp,
        onboardingStep: "password",
      });

      if (error) throw error;

      return data;
    },
    onSuccess: async () => {
      sendNotificationToAdmin({
        subject: "New user registered",
        message: `A new user has registered with the email: ${email}`,
      });
      toast.success("Email verified!");
      await router.invalidate();
      router.navigate({ to: "/register/password" });
    },
  });

  const resend = useMutation({
    mutationFn: async () => {
      const { error } = await emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      verify.reset();
      toast.success("A new code is on its way.");
    },
    onError: (error) => {
      console.error("Resend code error:", error);
      toast.error(error.message || "Could not send a new code.", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: verifyFormSchema,
    },
    onSubmit: async ({ value }) => {
      verify.mutate(value);
    },
  });

  const error = verify.error as OtpError | null;

  return {
    form,
    isPending: verify.isPending,
    error: error ? verifyErrorMessage(error) : null,
    needsNewCode: error ? needsNewCode(error) : false,
    resend: resend.mutate,
    isResending: resend.isPending,
  };
}
