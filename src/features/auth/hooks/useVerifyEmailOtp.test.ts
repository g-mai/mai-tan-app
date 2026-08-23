import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockNavigate,
  mockInvalidate,
  mockSignInEmailOtp,
  mockSendVerificationOtp,
  mockToastSuccess,
  mockToastError,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockInvalidate: vi.fn().mockResolvedValue(undefined),
  mockSignInEmailOtp: vi.fn(),
  mockSendVerificationOtp: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate, invalidate: mockInvalidate }),
}));

vi.mock("#/features/auth/lib/auth-client", () => ({
  signIn: { emailOtp: mockSignInEmailOtp },
  emailOtp: { sendVerificationOtp: mockSendVerificationOtp },
}));

vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

import { useVerifyEmailOtp } from "./useVerifyEmailOtp";

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
}

describe("useVerifyEmailOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies the code and navigates to the password step", async () => {
    mockSignInEmailOtp.mockResolvedValue({
      data: { user: { id: "1" } },
      error: null,
    });
    const { result } = renderHook(() => useVerifyEmailOtp("ada@example.com"), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("otp", "123456");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

    expect(mockSignInEmailOtp).toHaveBeenCalledWith({
      email: "ada@example.com",
      otp: "123456",
      onboardingStep: "password",
    });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/register/password" });
  });

  it("surfaces a wrong code as a field error and does not navigate", async () => {
    mockSignInEmailOtp.mockResolvedValue({
      data: null,
      error: { code: "INVALID_OTP", message: "Invalid OTP" },
    });
    const { result } = renderHook(() => useVerifyEmailOtp("ada@example.com"), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("otp", "000000");
    await result.current.form.handleSubmit();

    await waitFor(() =>
      expect(result.current.error).toBe(
        "That code isn't right. Check it and try again.",
      ),
    );

    expect(result.current.needsNewCode).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("treats TOO_MANY_ATTEMPTS as requiring a new code", async () => {
    mockSignInEmailOtp.mockResolvedValue({
      data: null,
      error: { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts" },
    });
    const { result } = renderHook(() => useVerifyEmailOtp("ada@example.com"), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("otp", "000000");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.needsNewCode).toBe(true));

    expect(result.current.error).toBe("Too many attempts. Request a new code.");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("treats a 429 status the same as too many attempts", async () => {
    mockSignInEmailOtp.mockResolvedValue({
      data: null,
      error: { status: 429, message: "Rate limited" },
    });
    const { result } = renderHook(() => useVerifyEmailOtp("ada@example.com"), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("otp", "000000");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.needsNewCode).toBe(true));

    expect(result.current.error).toBe(
      "Too many attempts. Wait a minute, then request a new code.",
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("resends the code and shows a success toast", async () => {
    mockSendVerificationOtp.mockResolvedValue({
      data: { success: true },
      error: null,
    });
    const { result } = renderHook(() => useVerifyEmailOtp("ada@example.com"), {
      wrapper: createWrapper(),
    });

    result.current.resend();

    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());

    expect(mockSendVerificationOtp).toHaveBeenCalledWith({
      email: "ada@example.com",
      type: "sign-in",
    });
  });

  it("shows an error toast when resending fails", async () => {
    mockSendVerificationOtp.mockResolvedValue({
      data: null,
      error: { message: "Could not send email" },
    });
    const { result } = renderHook(() => useVerifyEmailOtp("ada@example.com"), {
      wrapper: createWrapper(),
    });

    result.current.resend();

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not send email",
        expect.objectContaining({ duration: 5000 }),
      ),
    );
  });
});
