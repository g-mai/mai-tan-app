import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockNavigate,
  mockInvalidate,
  mockSetInitialPassword,
  mockUpdateUser,
  mockToastError,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockInvalidate: vi.fn().mockResolvedValue(undefined),
  mockSetInitialPassword: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate, invalidate: mockInvalidate }),
}));

vi.mock("#/features/auth/lib/auth.functions", () => ({
  setInitialPassword: mockSetInitialPassword,
}));

vi.mock("#/features/auth/lib/auth-client", () => ({
  updateUser: mockUpdateUser,
}));

vi.mock("sonner", () => ({
  toast: { error: mockToastError },
}));

import { useSetInitialPassword } from "./useSetInitialPassword";

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
}

describe("useSetInitialPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not submit when the passwords do not match", async () => {
    const { result } = renderHook(() => useSetInitialPassword(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("password", "password123");
    result.current.form.setFieldValue("confirmPassword", "different123");
    await result.current.form.handleSubmit();

    expect(mockSetInitialPassword).not.toHaveBeenCalled();
  });

  it("sets the password, advances the step, and navigates to profile", async () => {
    mockSetInitialPassword.mockResolvedValue({ success: true });
    mockUpdateUser.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useSetInitialPassword(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("password", "password123");
    result.current.form.setFieldValue("confirmPassword", "password123");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetInitialPassword).toHaveBeenCalledWith({
      data: { password: "password123" },
    });
    expect(mockUpdateUser).toHaveBeenCalledWith({ onboardingStep: "profile" });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/onboarding/profile" });
  });

  it("shows an error toast and does not navigate when the server rejects", async () => {
    mockSetInitialPassword.mockRejectedValue({
      message: "Password already set",
    });
    const { result } = renderHook(() => useSetInitialPassword(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("password", "password123");
    result.current.form.setFieldValue("confirmPassword", "password123");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Password already set",
      expect.objectContaining({ duration: 5000 }),
    );
  });
});
