import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "../../database";
import { Budgets, FinancialAccount, Transactions } from "../../database/schema";
import { TransactionModel } from "./transaction.model";
import { status } from "elysia";

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
}
