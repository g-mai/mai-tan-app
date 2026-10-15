import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockResetPassword, mockNavigate, mockToastError, mockToastSuccess } =
  vi.hoisted(() => ({
    mockResetPassword: vi.fn(),
    mockNavigate: vi.fn(),
    mockToastError: vi.fn(),
    mockToastSuccess: vi.fn(),
  }));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate }),
  createFileRoute: () => (options: object) => ({
    options,
    useSearch: () => ({ token: "reset-token" }),
  }),
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("#/features/auth/lib/auth-client", () => ({
  resetPassword: mockResetPassword,
}));
vi.mock("sonner", () => ({
  toast: { error: mockToastError, success: mockToastSuccess },
}));

import { Route } from "#/routes/_auth/reset-password";

const ResetPasswordPage = Route.options.component as ComponentType;

function renderPage() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <ResetPasswordPage />
    </QueryClientProvider>,
  );
}

async function submitPassword() {
  fireEvent.change(screen.getByLabelText("New Password"), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByLabelText("Confirm Password"), {
    target: { value: "password123" },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
  });
}

describe("password reset recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replaces the form with a new-link action when the token is rejected", async () => {
    mockResetPassword.mockResolvedValue({
      error: { code: "INVALID_TOKEN", message: "Invalid token" },
    });
    renderPage();
    await submitPassword();

    expect(
      await screen.findByRole("heading", { name: "Invalid Reset Link" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request new link" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(screen.queryByLabelText("New Password")).not.toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("keeps the form available for errors unrelated to the token", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockResetPassword.mockResolvedValue({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Please try again" },
    });
    renderPage();
    await submitPassword();

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to login after a successful reset", async () => {
    mockResetPassword.mockResolvedValue({
      data: { status: true },
      error: null,
    });
    renderPage();
    await submitPassword();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" }),
    );
    expect(mockResetPassword).toHaveBeenCalledWith({
      newPassword: "password123",
      token: "reset-token",
    });
    expect(mockToastSuccess).toHaveBeenCalled();
  });
});
