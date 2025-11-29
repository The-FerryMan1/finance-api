import { and, eq } from "drizzle-orm";
import { db } from "../../database";
import { Budgets, Categories, FinancialAccount } from "../../database/schema";
import { BudgetModel } from "./budget.model";
import { status } from "elysia";

export namespace BudgetService {
  export async function CreateBudget(
    { budgetedAmount, categoryID, cycle, startDate }: BudgetModel.BudgetBody,
    { userID }: BudgetModel.UserIDParams
  ) {
    // 1. Explicitly cast categoryID to a Number for safety in query functions
    const categoryIDInt = Number(categoryID);

    // 2. Perform the category existence check
    const categoryExists = await db.$count(
      Categories,
      and(
        eq(Categories.id, categoryIDInt), // Use the explicit integer
        eq(Categories.userID, userID) // This should now bind correctly
      )
    );

    if (categoryExists === 0) throw status(400, "Category doesn't exists.");

    const [financialAccount] = await db
      .select({ id: FinancialAccount.id })
      .from(FinancialAccount)
      .where(eq(FinancialAccount.userID, userID));

    // 3. Perform the insertion (Also using the integer and fixing the date)
    const [newBudget] = await db
      .insert(Budgets)
      .values({
        budgetedAmount: budgetedAmount, // Always format NUMERIC
        cycle,
        startDate: startDate.toISOString().split("T")[0], // Fix date format
        categoryID: categoryIDInt, // Use the explicit integer
        userID: userID.trim(), // Use trimmed user ID for safety
        financialID: financialAccount.id,
      })
      .returning();

    return newBudget;
  }

  export async function ReadBudget({ userID }: BudgetModel.UserIDParams) {
    const budgetRow = await db
      .select()
      .from(Budgets)
      .where(eq(Budgets.userID, userID));

    return budgetRow;
  }

  export async function ReadBudgetById(
    { budgetID }: BudgetModel.BudgetIDParams,
    { userID }: BudgetModel.UserIDParams
  ) {
    const budgetIDInt = parseInt(budgetID);
    if (isNaN(budgetIDInt)) throw status(400, "Parameter should be numeric.");

    const [selectedRow] = await db
      .select()
      .from(Budgets)
      .where(and(eq(Budgets.id, budgetIDInt), eq(Budgets.userID, userID)))
      .limit(1);

    return selectedRow;
  }

  export async function UpdateBudget(
    { budgetedAmount, categoryID, cycle }: BudgetModel.BudgetBody,
    { budgetID }: BudgetModel.BudgetIDParams,
    { userID }: BudgetModel.UserIDParams
  ) {
    const budgetIDInt = parseInt(budgetID);
    if (isNaN(budgetIDInt))
      throw status(400, "Parameter should be numeric or access denied.");

    const [UpdatedRow] = await db
      .update(Budgets)
      .set({ budgetedAmount, cycle })
      .where(and(eq(Budgets.id, budgetIDInt), eq(Budgets.userID, userID)))
      .returning();

    if (!UpdateBudget)
      throw status(400, "DB:Failed to retrieve updated record.");
    return UpdatedRow;
  }

  export async function DeleteBudget(
    { budgetID }: BudgetModel.BudgetIDParams,
    { userID }: BudgetModel.UserIDParams
  ) {
    const budgetIDInt = parseInt(budgetID);
    if (isNaN(budgetIDInt))
      throw status(400, "Parameter should be numeric or access denied.");

    const deletedRowId = await db
      .delete(Budgets)
      .where(and(eq(Budgets.id, budgetIDInt), eq(Budgets.userID, userID)))
      .returning({ id: Budgets.id });

    if (deletedRowId.length === 0)
      throw status(400, "Record doesn't exists or access denied.");
    return {
      status: 200,
      message: `Budget with an ID of ${budgetIDInt} was deleted`,
    };
  }
}
