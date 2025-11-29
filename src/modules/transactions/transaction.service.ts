import { and, eq, gt, lte, sql } from "drizzle-orm";
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
      financialID,
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
        .where(
          and(
            eq(FinancialAccount.userID, userID),
            eq(FinancialAccount.id, financialID)
          )
        );

      if (amount < 0 && financial.currentBalance + amount < 0) {
        throw status(400, "Transaction Failed: Insufficient balance.");
      }

      //budget check
      if (budgetID) {
        const [budget] = await tx
          .select({
            id: Budgets.id,
            budgetedAmount: Budgets.budgetedAmount,
            spentAmount: Budgets.spentAmount,
          })
          .from(Budgets)
          .where(
            and(
              eq(Budgets.userID, userID),
              eq(Budgets.id, budgetID),
              eq(Budgets.categoryID, categoryID),
              lte(Budgets.startDate, new Date(date).toISOString().split("T")[0])
            )
          )
          .limit(1);
        console.log(budget);
        if (!budget)
          throw status(400, "Budget does not exists or access denied.");
        //check if the transaction is expense and exceed budget

        if (amount < 0 && budget.spentAmount - amount > budget.budgetedAmount) {
          throw status(400, "Budget exeeded.");
        }

        //update budget
        console.log(`${budget.spentAmount} - ${amount}`);
        await tx
          .update(Budgets)
          .set({
            spentAmount: sql`${Budgets.spentAmount} - ${amount}`,
          })
          .where(eq(Budgets.id, budget.id));
      }

      //create transaction
      const [trasanction] = await tx
        .insert(Transactions)
        .values({
          amount,
          date: new Date(date).toISOString().split("T")[0],
          status: trasanctionStatus,
          description,
          userID,
          financialID: financial.id,
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
      financialID,
    }: TransactionModel.TransactionBody,
    { userID }: TransactionModel.TransactionUserID
  ) {
    if (amount <= 0) throw status(400, "Amount shouldn't below 0 or negative");

    const incomeTransac = await db.transaction(async (tx) => {
      const [financial] = await db
        .select({ id: FinancialAccount.id })
        .from(FinancialAccount)
        .where(
          and(
            eq(FinancialAccount.id, Number(financialID)),
            eq(FinancialAccount.userID, userID)
          )
        );

      const [incomeTransac] = await tx
        .insert(Transactions)
        .values({
          amount,
          categoryID,
          date: String(date),
          description,
          status: trasanctionStatus,
          financialID: financial.id,
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
            eq(FinancialAccount.id, Number(financialID)),
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
    { transactionID }: TransactionModel.TrasanctionParams,
    { userID }: TransactionModel.TransactionUserID
  ) {
    const trasanctionIDInt = Number(transactionID);
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
    { transactionID }: TransactionModel.TrasanctionParams,
    { userID }: TransactionModel.TransactionUserID
  ) {
    const trasanctionIDInt = Number(transactionID);
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
        .where(
          and(
            eq(FinancialAccount.userID, userID),
            eq(FinancialAccount.id, selectedTransac.financialID)
          )
        );

      if (selectedTransac.categoryID) {
        await tx.update(Budgets).set({
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
      message: `Trasanction:${transactionID} is reverted.`,
    };
  }

  export async function UpdateTransaction(
    { description }: TransactionModel.TransactionUpdateBody,
    { transactionID }: TransactionModel.TrasanctionParams,
    { userID }: TransactionModel.TransactionUserID
  ) {
    const trasanctionIDInt = Number(transactionID);
    if (isNaN(trasanctionIDInt))
      throw status(400, "Access denied or invalid ID parameter.");

    const [UpdatedTransaction] = await db
      .update(Transactions)
      .set({ description })
      .where(
        and(
          eq(Transactions.id, trasanctionIDInt),
          eq(Transactions.userID, userID)
        )
      )
      .returning();

    if (!UpdatedTransaction)
      throw status(400, "DB: Failed to retrieve update record.");

    return UpdatedTransaction;
  }
}
