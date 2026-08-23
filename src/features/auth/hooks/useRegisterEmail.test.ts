import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNavigate, mockSendVerificationOtp, mockToastError } = vi.hoisted(
  () => ({
    mockNavigate: vi.fn(),
    mockSendVerificationOtp: vi.fn(),
    mockToastError: vi.fn(),
  }),
);

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate }),
}));

vi.mock("#/features/auth/lib/auth-client", () => ({
  emailOtp: { sendVerificationOtp: mockSendVerificationOtp },
}));

vi.mock("sonner", () => ({
  toast: { error: mockToastError },
}));

import { useRegisterEmail } from "./useRegisterEmail";

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
}

describe("useRegisterEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not send a code when the email is invalid", async () => {
    const { result } = renderHook(() => useRegisterEmail(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("email", "not-an-email");
    await result.current.form.handleSubmit();

    expect(mockSendVerificationOtp).not.toHaveBeenCalled();
  });

  it("sends a sign-in code and navigates to the verify step", async () => {
    mockSendVerificationOtp.mockResolvedValue({
      data: { success: true },
      error: null,
    });
    const { result } = renderHook(() => useRegisterEmail(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("email", "ada@example.com");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSendVerificationOtp).toHaveBeenCalledWith({
      email: "ada@example.com",
      type: "sign-in",
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/register/verify",
      search: { email: "ada@example.com" },
    });
  });

  it("shows an error toast and does not navigate when sending fails", async () => {
    mockSendVerificationOtp.mockResolvedValue({
      data: null,
      error: { message: "Failed to send email" },
    });
    const { result } = renderHook(() => useRegisterEmail(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("email", "ada@example.com");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Failed to send email",
      expect.objectContaining({ duration: 5000 }),
    );
  });
});
