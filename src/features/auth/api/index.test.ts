import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_ERROR_NETWORK, AUTH_ERROR_UNKNOWN } from "../lib/auth-error";

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("#shared/api", () => ({
  createBrowserClient: () => ({ auth }),
}));

const { authApi } = await import("./index");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authApi", () => {
  it("reports an unreachable server instead of rejecting", async () => {
    auth.signInWithPassword.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(authApi.signIn("a@b.co", "secret")).resolves.toEqual({
      data: null,
      errorCode: AUTH_ERROR_NETWORK,
    });
  });

  it("keeps the network code off requests the server did answer", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "invalid_credentials" },
    });

    const { errorCode } = await authApi.signIn("a@b.co", "wrong");

    expect(errorCode).toBe("invalid_credentials");
  });

  it("falls back to the unknown code when the server error carries none", async () => {
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: {},
    });

    const { errorCode } = await authApi.signUp("a@b.co", "secret", "A B");

    expect(errorCode).toBe(AUTH_ERROR_UNKNOWN);
  });

  it("guards sign-up the same way", async () => {
    auth.signUp.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(authApi.signUp("a@b.co", "secret", "A B")).resolves.toEqual({
      data: null,
      errorCode: AUTH_ERROR_NETWORK,
    });
  });
});
