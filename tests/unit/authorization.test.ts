import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isAuthorizedTenant,
  isAuthorizedUser,
  validateAuthorization,
} from "@/lib/auth/authorization";

describe("authorization", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      ALLOWED_TENANT_ID: "tenant-abc-123",
      ALLOWED_USER_OBJECT_ID: "user-def-456",
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("isAuthorizedTenant", () => {
    it("returns true for the allowed tenant", () => {
      expect(isAuthorizedTenant("tenant-abc-123")).toBe(true);
    });

    it("returns false for a different tenant", () => {
      expect(isAuthorizedTenant("wrong-tenant-id")).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isAuthorizedTenant(undefined)).toBe(false);
    });
  });

  describe("isAuthorizedUser", () => {
    it("returns true for the allowed user", () => {
      expect(isAuthorizedUser("user-def-456")).toBe(true);
    });

    it("returns false for a different user", () => {
      expect(isAuthorizedUser("wrong-user-id")).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isAuthorizedUser(undefined)).toBe(false);
    });
  });

  describe("validateAuthorization", () => {
    it("authorizes correct tenant and user", () => {
      const result = validateAuthorization("tenant-abc-123", "user-def-456");
      expect(result.authorized).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("rejects wrong tenant", () => {
      const result = validateAuthorization("wrong-tenant", "user-def-456");
      expect(result.authorized).toBe(false);
      expect(result.reason).toContain("wrong-tenant");
    });

    it("rejects correct tenant but wrong user", () => {
      const result = validateAuthorization("tenant-abc-123", "wrong-user");
      expect(result.authorized).toBe(false);
      expect(result.reason).toContain("wrong-user");
    });

    it("rejects missing tenant ID", () => {
      const result = validateAuthorization(undefined, "user-def-456");
      expect(result.authorized).toBe(false);
      expect(result.reason).toContain("Missing tenant ID");
    });

    it("rejects missing user object ID", () => {
      const result = validateAuthorization("tenant-abc-123", undefined);
      expect(result.authorized).toBe(false);
      expect(result.reason).toContain("Missing user object ID");
    });
  });
});
