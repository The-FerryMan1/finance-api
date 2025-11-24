import { db } from "../../database";
import { Budgets } from "../../database/schema";
import { BudgetModel } from "./budget.model";

export namespace BudgetService {
  export async function CreateBudget(
    { budgetedAmount, categoryID, cycle, stateDate }: BudgetModel.BudgetBody,
    { userID }: BudgetModel.UserIDParams
  ) {
    const [newBudget] = await db
      .insert(Budgets)
      .values({
        budgetedAmount,
        cycle,
        stateDate: String(stateDate),
        userID,
        categoryID,
      })
      .returning();
  }
}
