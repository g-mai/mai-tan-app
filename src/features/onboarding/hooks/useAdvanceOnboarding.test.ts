import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNavigate, mockInvalidate, mockUpdateUser, mockToastError } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockInvalidate: vi.fn().mockResolvedValue(undefined),
    mockUpdateUser: vi.fn(),
    mockToastError: vi.fn(),
  }));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: mockNavigate, invalidate: mockInvalidate }),
}));

vi.mock("#/features/auth/lib/auth-client", () => ({
  updateUser: mockUpdateUser,
}));

vi.mock("sonner", () => ({
  toast: { error: mockToastError },
}));

import { useAdvanceOnboarding } from "./useAdvanceOnboarding";

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children });
}

describe("useAdvanceOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the user and navigates to the next step's route", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAdvanceOnboarding(), {
      wrapper: createWrapper(),
    });

    result.current.advance({
      onboardingStep: "organization",
      favouriteOrganization: "org-1",
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

    expect(mockUpdateUser).toHaveBeenCalledWith({
      onboardingStep: "organization",
      favouriteOrganization: "org-1",
    });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/onboarding/organization",
    });
  });

  it('navigates to /dashboard when the step is "done"', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAdvanceOnboarding(), {
      wrapper: createWrapper(),
    });

    result.current.advance({ onboardingStep: "done" });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" }),
    );
  });

  it("shows an error toast and does not navigate when updateUser fails", async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: "Could not save" },
    });
    const { result } = renderHook(() => useAdvanceOnboarding(), {
      wrapper: createWrapper(),
    });

    result.current.advance({ onboardingStep: "team" });

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Could not save",
      expect.objectContaining({ duration: 5000 }),
    );
  });
});
