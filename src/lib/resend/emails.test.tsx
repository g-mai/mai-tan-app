import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

vi.mock("#/lib/env.server", () => ({
  env: {
    RESEND_API_KEY: "test-key",
    FROM_ADDRESS_EMAIL: "Mai Tan <hello@example.com>",
    SKIP_VERIFICATION_EMAIL: false,
  },
}));

import { sendChangeEmailConfirmationEmail, sendVerifyEmail } from "./emails";

const user = { name: "Ada", email: "old@example.com" };
const url = "https://example.com/approve-change";

describe("change-email delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends an actionable approval email to the current address", async () => {
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    await sendChangeEmailConfirmationEmail({
      user,
      newEmail: "new@example.com",
      url,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Mai Tan <hello@example.com>",
        to: ["old@example.com"],
        subject: "Approve Your Email Change",
      }),
    );
    const html = renderToStaticMarkup(mockSend.mock.calls[0][0].react);
    expect(html).toContain("new@example.com");
    expect(html).toContain(url);
    expect(html).toContain("Approve email change");
  });

  it("propagates a failed send instead of reporting success", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Delivery rejected" },
    });

    await expect(
      sendChangeEmailConfirmationEmail({
        user,
        newEmail: "new@example.com",
        url,
      }),
    ).rejects.toThrow(
      "Failed to send change email confirmation: Delivery rejected",
    );
  });

  it("uses a verification email suitable for the new address", async () => {
    mockSend.mockResolvedValue({ data: { id: "email-2" }, error: null });

    await sendVerifyEmail({
      user: { ...user, email: "new@example.com" } as Parameters<
        typeof sendVerifyEmail
      >[0]["user"],
      url: "https://example.com/verify-new-email",
      token: "token",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["new@example.com"] }),
    );
    const html = renderToStaticMarkup(mockSend.mock.calls[0][0].react);
    expect(html).toContain("https://example.com/verify-new-email");
    expect(html).toContain("Please confirm this email address");
    expect(html).not.toContain("Thanks for signing up");
  });
});
