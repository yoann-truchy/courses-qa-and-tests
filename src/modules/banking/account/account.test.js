import { describe, it, vi, afterEach, expect } from "vitest";
import { createAccount, getAccounts, deleteAccount } from "./account.service";

// --- Mock repository layer only ---
vi.mock("./account.repository", async (importOriginal) => ({
  ...(await importOriginal().catch(() => ({ default: {} }))),
  createAccountInRepository: vi.fn((data) => ({
    id: 123,
    userId: data.userId,
    amount: data.amount ?? 0,
  })),
  getAccountsFromRepository: vi.fn(({ userId }) => [
    { id: 1, userId, amount: 2000 },
    { id: 2, userId, amount: 5000 },
  ]),
  deleteAccountInRepository: vi.fn(({ userId, accountId }) => {
    if (userId === 10 && accountId === 1) return true;
    const err = new Error("Account not found");
    err.name = "HttpNotFound";
    err.statusCode = 404;
    throw err;
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("Exercise 2: Bank Accounts (service tests)", () => {
  // createAccount succeeds
  it("createAccount succeeds", async () => {
    const payload = { userId: 10, amount: 1000 };
    const result = await createAccount(payload);

    const repo = await import("./account.repository");
    expect(repo.createAccountInRepository).toHaveBeenCalledOnce();
    expect(repo.createAccountInRepository).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: 123, userId: 10, amount: 1000 });
  });

  // createAccount fails with invalid parameters
  it("createAccount fails with invalid parameters", async () => {
    try {
      await createAccount({ userId: -1, amount: -50 });
      throw new Error("createAccount should throw with invalid parameters.");
    } catch (e) {
      expect(e.name).toBe("HttpBadRequest");
      expect(e.statusCode ?? 400).toBe(400);
      const repo = await import("./account.repository");
      expect(repo.createAccountInRepository).not.toHaveBeenCalled();
    }
  });

  // getAccounts succeeds and validates each item
  it("getAccounts succeeds and validates each item", async () => {
    const userId = 10;
    const accounts = await getAccounts(userId);

    const repo = await import("./account.repository");
    expect(repo.getAccountsFromRepository).toHaveBeenCalledOnce();
    expect(repo.getAccountsFromRepository).toHaveBeenCalledWith({ userId });
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(0);

    for (const acc of accounts) {
      expect(typeof acc.id).toBe("number");
      expect(acc.userId).toBe(userId);
      expect(typeof acc.amount).toBe("number");
      expect(acc.amount).toBeGreaterThanOrEqual(0);
    }
  });

  // getAccounts fails with invalid userId
  it("getAccounts fails with invalid userId", async () => {
    try {
      // invalid string should trigger validation error
      await getAccounts("abc");
      throw new Error("getAccounts should throw for an invalid userId.");
    } catch (e) {
      expect(e.name).toBe("HttpBadRequest");
      expect(e.statusCode ?? 400).toBe(400);
      const repo = await import("./account.repository");
      expect(repo.getAccountsFromRepository).not.toHaveBeenCalled();
    }
  });

  // deleteAccount succeeds
  it("deleteAccount succeeds", async () => {
    const result = await deleteAccount(10, 1);

    const repo = await import("./account.repository");
    expect(repo.deleteAccountInRepository).toHaveBeenCalledOnce();
    expect(repo.deleteAccountInRepository).toHaveBeenCalledWith({
      userId: 10,
      accountId: 1,
    });
    expect(result).toBe(true);
  });

  // deleteAccount fails with a bad account id
  it("deleteAccount fails with a bad account id", async () => {
    try {
      await deleteAccount(10, 999);
      throw new Error("deleteAccount should throw for an invalid account id.");
    } catch (e) {
      expect(e.name).toBe("HttpNotFound");
      expect(e.statusCode).toBe(404);
    }
  });

  // deleteAccount fails with invalid parameters (validation)
  it("deleteAccount fails with invalid parameters (validation)", async () => {
    try {
      // non-integer userId and negative accountId
      await deleteAccount(3.14, -2);
      throw new Error("deleteAccount should throw for invalid parameters.");
    } catch (e) {
      expect(e.name).toBe("HttpBadRequest");
      expect(e.statusCode ?? 400).toBe(400);
      const repo = await import("./account.repository");
      expect(repo.deleteAccountInRepository).not.toHaveBeenCalled();
    }
  });
});
