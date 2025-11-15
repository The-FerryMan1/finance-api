import { and, eq, sql, aliasedTable, exists } from "drizzle-orm";
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
  // const revertedTransaction = aliasedTable(transaction, "revertedTransaction");
  const [transactionRow] = await db
    .select(
      {
        trasanctionDetails: transaction,
        alreadyReverted: exists(
          db.select({id: transaction.id})
            .from(transaction)
            .where(eq(transaction.revertedID, transactionID))
        )
      }
    )
    .from(transaction)
    .where(
      and(eq(transaction.id, transactionID), eq(transaction.userID, userID)),
    );

    console.log(transactionRow)
  if(!transactionRow || !transactionRow?.trasanctionDetails) throw status(404, 'Not Found')

  const {alreadyReverted,trasanctionDetails} = transactionRow

  if(alreadyReverted) throw status(400, 'The original transaction has been reverted already')

  if(trasanctionDetails.type === TransactionType.REVERT) throw status(400, "Cannot revert a transaction that is already a revert type")


  const newRevertTransaction = {
      amount: transactionRow?.trasanctionDetails.amount,
      revertedID: transactionRow?.trasanctionDetails.id,
      balanceID: transactionRow?.trasanctionDetails.balanceID,
      userID: transactionRow?.trasanctionDetails.userID,
      categoryID: transactionRow?.trasanctionDetails.categoryID,
      description: `REVERT: ${transactionRow?.trasanctionDetails.description}`,
      type: "revert" as TransactionType.REVERT,
    }

  await db.transaction(async (tx) => {
    await tx.insert(transaction).values(newRevertTransaction);

    await tx.update(balance).set({
      currentBalance: sql`${balance.currentBalance} + ${transactionRow?.trasanctionDetails.amount}`,
    });
  });

  return;
}
