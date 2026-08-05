import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNavigate, mockSignInEmail, mockToastSuccess, mockToastError } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockSignInEmail: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  }));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate }),
}));

vi.mock("#/features/auth/lib/auth-client", () => ({
  signIn: { email: mockSignInEmail },
}));

vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

import { useLogin } from "./useLogin";

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
}

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not call signIn.email when the form is invalid", async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("email", "not-an-email");
    result.current.form.setFieldValue("password", "short");
    await result.current.form.handleSubmit();

    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it("signs in and navigates to /dashboard on success", async () => {
    mockSignInEmail.mockResolvedValue({
      data: { user: { id: "1" } },
      error: null,
    });
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("email", "test@example.com");
    result.current.form.setFieldValue("password", "password123");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it("shows an error toast and does not navigate when sign-in fails", async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: "Invalid credentials" },
    });
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("email", "test@example.com");
    result.current.form.setFieldValue("password", "password123");
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Invalid credentials",
      expect.objectContaining({ duration: 5000 }),
    );
  });
});
