import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "../../database";
import {
  Budgets,
  FinancialAccount,
  Transactions,
  TrasanctionStatusType,
} from "../../database/schema";
import { TransactionModel } from "./transaction.model";
import { status } from "elysia";
import { FinancialAccountModel } from "../financial_account/financial_account.model";

export namespace TransactionService {
  export async function CreateExpenseTransanction(
    {
      categoryID,
      date,
      description,
      status: trasanctionStatus,
      budgetID,
      amount,
    }: TransactionModel.TransactionBody,
    { userID }: TransactionModel.TransactionUserID
  ) {
    const newTrasanction = await db.transaction(async (tx) => {
      //check balance
      const [financial] = await tx
        .select({
          currentBalance: FinancialAccount.currentBalance,
          id: FinancialAccount.id,
        })
        .from(FinancialAccount)
        .where(eq(FinancialAccount.userID, userID));

      if (amount < 0 && financial.currentBalance + amount < 0) {
        throw status(400, "Transaction Failed: Insufficient balance.");
      }

      //budget check
      if (budgetID) {
        const [budget] = await tx
          .select({
            budgetedAmount: Budgets.budgetedAmount,
            spentAmount: Budgets.spentAmount,
          })
          .from(Budgets)
          .where(eq(Budgets.userID, userID));

        //check if the transaction is expense and exceed budget

        if (amount < 0 && budget.spentAmount - amount > budget.budgetedAmount) {
          throw status(400, "Budget exeeded.");
        }

        //update budget

        await tx
          .update(Budgets)
          .set({
            spentAmount: sql`${budget.spentAmount} - ${amount}`,
          })
          .where(and(eq(Budgets.userID, userID), eq(Budgets.id, budgetID)));
      }

      //create transaction
      const [trasanction] = await tx
        .insert(Transactions)
        .values({
          amount,
          date: String(date),
          status: trasanctionStatus,
          description,
          userID,
          categoryID,
        })
        .returning();

      //update balance

      await tx
        .update(FinancialAccount)
        .set({
          currentBalance: sql`${FinancialAccount.currentBalance} + ${trasanction.amount}`,
        })
        .where(
          and(
            eq(FinancialAccount.userID, userID),
            eq(FinancialAccount.id, financial.id)
          )
        );

      return trasanction;
    });

    return newTrasanction;
  }

  export async function CreateIncomeTransantion(
    {
      amount,
      categoryID,
      date,
      description,
      status: trasanctionStatus,
    }: TransactionModel.TransactionBody,
    { FinancialAccountID }: FinancialAccountModel.FinancialAccountParams,
    { userID }: TransactionModel.TransactionUserID
  ) {
    if (amount <= 0) throw status(400, "Amount shouldn't below 0 or negative");

    const incomeTransac = await db.transaction(async (tx) => {
      const [incomeTransac] = await tx
        .insert(Transactions)
        .values({
          amount,
          categoryID,
          date: String(date),
          description,
          status: trasanctionStatus,
          userID,
        })
        .returning();

      await tx
        .update(FinancialAccount)
        .set({
          currentBalance: sql`${FinancialAccount.currentBalance} + ${incomeTransac.amount}`,
        })
        .where(
          and(
            eq(FinancialAccount.id, Number(FinancialAccountID)),
            eq(FinancialAccount.userID, userID)
          )
        );

      return incomeTransac;
    });

    return incomeTransac;
  }

  export async function ReadTransaction({
    userID,
  }: TransactionModel.TransactionUserID) {
    const transactions = await db
      .select()
      .from(Transactions)
      .where(eq(Transactions.userID, userID));
    return transactions;
  }

  export async function ReadTransactionByID(
    { trasanctionID }: TransactionModel.TrasanctionParams,
    { userID }: TransactionModel.TransactionUserID
  ) {
    const trasanctionIDInt = Number(trasanctionID);
    if (isNaN(trasanctionIDInt))
      throw status(400, "Access denied or invalid ID parameter.");
    const [trasanction] = await db
      .select()
      .from(Transactions)
      .where(
        and(
          eq(Transactions.id, trasanctionIDInt),
          eq(Transactions.userID, userID)
        )
      )
      .limit(1);
    return trasanction;
  }

  export async function RevertTransaction(
    { trasanctionID }: TransactionModel.TrasanctionParams,
    { userID }: TransactionModel.TransactionUserID
  ) {
    const trasanctionIDInt = Number(trasanctionID);
    if (isNaN(trasanctionIDInt))
      throw status(400, "Access denied or invalid ID parameter.");

    await db.transaction(async (tx) => {
      //find the transaction to be reverted
      const [selectedTransac] = await tx
        .select()
        .from(Transactions)
        .where(
          and(
            eq(Transactions.id, trasanctionIDInt),
            eq(Transactions.userID, userID)
          )
        )
        .limit(1);

      if (!selectedTransac)
        throw status(404, "Transaction does not exist or Acess denied.");

      if (selectedTransac.status === TrasanctionStatusType.Reverted)
        throw status(400, "Transaction is already reverted.");

      await tx
        .update(FinancialAccount)
        .set({
          currentBalance: sql`${FinancialAccount.currentBalance} + ${selectedTransac.amount}`,
        })
        .where(eq(FinancialAccount.userID, userID));

      if (selectedTransac.categoryID) {
        await tx
          .update(Budgets)
          .set({
            spentAmount: sql`${FinancialAccount.currentBalance} + ${selectedTransac.amount}`,
          });
      }

      await tx
        .update(Transactions)
        .set({ status: TrasanctionStatusType.Reverted, isDeleted: true })
        .where(
          and(
            eq(Transactions.id, selectedTransac.id),
            eq(Transactions.userID, userID)
          )
        );
    });

    return {
      status: 200,
      message: `Trasanction:${trasanctionID} is reverted.`,
    };
  }

  // export async
}
