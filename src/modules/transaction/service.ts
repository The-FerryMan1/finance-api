import { and, eq, sql } from "drizzle-orm";
import { db } from "../../database";
import {
  balance,
  category,
  transaction,
  TransactionType,
} from "../../database/schema";
import { TransactionModel } from "./model";
import { status } from "elysia";

export async function createTransaction(
  { id: category_id }: TransactionModel.transactionParams,
  { amount, balance_id, description }: TransactionModel.transactionBody,
  user_id: string,
) {
  const row = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(transaction)
      .values({
        amount,
        categoryID: category_id,
        balanceID: balance_id,
        description,
        userID: user_id,
        date: new Date(Date.now()),
      })
      .returning({
        id: transaction.id,
        category_id: transaction.categoryID,
        balance_id: transaction.balanceID,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      });

    if (!row)
      throw status(
        400,
        "Unable to create new transaction" satisfies TransactionModel.transactionBodyInvalid,
      );

    const [currentBalance] = await tx
      .select({ balance: balance.currentBalance })
      .from(balance)
      .where(and(eq(balance.id, balance_id), eq(balance.userID, user_id)));

    if (!currentBalance)
      throw status(404, "Unable to create new transaction, balance not found");

    if (currentBalance.balance < amount) {
      throw status(403, "insufficient balance");
    }

    await tx
      .update(balance)
      .set({ currentBalance: sql`${balance.currentBalance} - ${amount}` })
      .where(and(eq(balance.id, balance_id), eq(balance.userID, user_id)));

    return row;
  });

  return row;
}

export async function readTrasaction(
  { id: category_id }: TransactionModel.transactionParams,
  user_id: string,
) {
  const checkCategoryRow = await db.$count(
    category,
    and(eq(category.id, category_id), eq(category.userID, user_id)),
  );

  if (!checkCategoryRow) throw status(404, "Category does not exists");

  const row = await db
    .select({
      id: transaction.id,
      category_id: transaction.categoryID,
      balance_id: transaction.balanceID,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.categoryID, category_id),
        eq(transaction.userID, user_id),
      ),
    );

  return row;
}

export async function readTrasanctionHistory(userID: string) {
  const row = await db
    .select({
      id: transaction.id,
      category_id: transaction.categoryID,
      balance_id: transaction.balanceID,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
    })
    .from(transaction)
    .where(eq(transaction.userID, userID));

  return row;
}

export async function softDeleteTransanction(
  { id: transactionID }: TransactionModel.transactionParams,
  userID: string,
) {
  const rowCheck = await db.$count(
    transaction,
    and(eq(transaction.id, transactionID), eq(transaction.userID, userID)),
  );

  if (!rowCheck) throw status(404, "Not Found");

  await db
    .update(transaction)
    .set({
      trash: true,
    })
    .where(
      and(eq(transaction.id, transactionID), eq(transaction.userID, userID)),
    );

  return;
}

export async function HardDeleteTransanction(
  { id: transactionID }: TransactionModel.transactionParams,
  userID: string,
) {
  const rowCheck = await db.$count(
    transaction,
    and(eq(transaction.id, transactionID), eq(transaction.userID, userID)),
  );

  if (!rowCheck) throw status(404, "Not Found");

  await db
    .delete(transaction)
    .where(
      and(eq(transaction.id, transactionID), eq(transaction.userID, userID)),
    );

  return;
}

export async function revertTransaction(
  { id: transactionID }: TransactionModel.transactionParams,
  userID: string,
) {
  const [transactionRow] = await db
    .select()
    .from(transaction)
    .where(
      and(eq(transaction.id, transactionID), eq(transaction.userID, userID)),
    );

  if (!transactionRow) throw status(404, "Not Found");

  await db.transaction(async (tx) => {
    await tx.insert(transaction).values({
      amount: transactionRow.amount,
      balanceID: transactionRow.balanceID,
      userID: transactionRow.userID,
      categoryID: transactionRow.categoryID,
      description: `REVERT: ${transactionRow.description}`,
      type: "revert" as TransactionType.REVERT,
    });

    await tx.update(balance).set({
      currentBalance: sql`${balance.currentBalance} + ${transactionRow.amount}`,
    });
  });

  return;
}
