import { t } from "elysia";
import { BudgetsCycleType } from "../../database/schema";

export namespace BudgetModel {
  export const UserIDParams = t.Object({
    userID: t.String(),
  });

  export type UserIDParams = typeof UserIDParams.static;

  export const BudgetBody = t.Object({
    categoryID: t.Number(),
    cycle: t.Enum(BudgetsCycleType),
    startDate: t.Date(),
    budgetedAmount: t.Numeric(),
  });

  export type BudgetBody = typeof BudgetBody.static;

  export const BudgetResponse = t.Object({
    id: t.Number(),
    userID: t.String(),
    categoryID: t.Number(),
    cycle: t.Enum(BudgetsCycleType),
    startDate: t.String(),
    budgetedAmount: t.Numeric(),
    spentAmount: t.Numeric(),
  });

  export type BudgetResponse = typeof BudgetResponse.static;

  export const BudgetResponseArray = t.Array(BudgetResponse);

  export type BudgetResponseArray = typeof BudgetResponseArray.static;

  export const BudgetIDParams = t.Object({
    budgetID: t.String(),
  });

  export type BudgetIDParams = typeof BudgetIDParams.static;
}
