import { HttpBadRequest } from "@httpx/exception";
import { z } from "zod";
import { createAccountInRepository } from "./account.repository";

const AccountSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number(), // float allowed
});

export async function createAccount(data) {
  const result = AccountSchema.safeParse(data);

  if (!result.success) {
    throw new HttpBadRequest(result.error);
  }

  const { userId, amount } = result.data;

  if (amount < 0) {
    throw new HttpBadRequest("Amount must be greater than or equal to 0.");
  }

  return createAccountInRepository({ userId, amount });
}

import { getAccountsFromRepository, deleteAccountInRepository } from "./account.repository";

const UserIdSchema = z.number().int().positive();
const DeleteSchema = z.object({
  userId: z.number().int().positive(),
  accountId: z.number().int().positive(),
});


export async function getAccounts(userId) {
  const parsed = UserIdSchema.safeParse(userId);
  if (!parsed.success) {
    throw new HttpBadRequest(parsed.error);
  }
  return getAccountsFromRepository({ userId: parsed.data });
}

export async function deleteAccount(userId, accountId) {
  const result = DeleteSchema.safeParse({ userId, accountId });
  if (!result.success) {
    throw new HttpBadRequest(result.error);
  }
  return deleteAccountInRepository(result.data);
}
