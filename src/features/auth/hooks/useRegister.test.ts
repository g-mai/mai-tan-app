import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNavigate, mockSignUpEmail, mockToastSuccess, mockToastError } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockSignUpEmail: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  }));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate }),
}));

vi.mock("#/features/auth/lib/auth-client", () => ({
  signUp: { email: mockSignUpEmail },
}));

vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

import { useRegister } from "./useRegister";

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
}

function fillValidForm(form: ReturnType<typeof useRegister>["form"]) {
  form.setFieldValue("firstName", "Ada");
  form.setFieldValue("lastName", "Lovelace");
  form.setFieldValue("email", "ada@example.com");
  form.setFieldValue("password", "password123");
  form.setFieldValue("confirmPassword", "password123");
}

describe("useRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not call signUp.email when the form is invalid", async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    result.current.form.setFieldValue("firstName", "");
    result.current.form.setFieldValue("lastName", "L");
    result.current.form.setFieldValue("email", "not-an-email");
    result.current.form.setFieldValue("password", "short");
    result.current.form.setFieldValue("confirmPassword", "short");
    await result.current.form.handleSubmit();

    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it("registers and navigates to /dashboard on success", async () => {
    mockSignUpEmail.mockResolvedValue({
      data: { user: { id: "1" } },
      error: null,
    });
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    fillValidForm(result.current.form);
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSignUpEmail).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
      firstName: "Ada",
      lastName: "Lovelace",
      name: "Ada Lovelace",
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it("shows an error toast and does not navigate when sign-up fails", async () => {
    mockSignUpEmail.mockResolvedValue({
      data: null,
      error: { message: "Email already in use" },
    });
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    fillValidForm(result.current.form);
    await result.current.form.handleSubmit();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Email already in use",
      expect.objectContaining({ duration: 5000 }),
    );
  });
});
