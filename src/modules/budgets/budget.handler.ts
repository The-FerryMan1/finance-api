import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { BudgetModel } from "./budget.model";
import { BudgetService } from "./budget.service";

export const BundgetHandler = new Elysia({ prefix: "budgets" })
  .use(betterAuth)
  .post(
    "/",
    async ({ user, body, set }) => {
      const response = await BudgetService.CreateBudget(body, {
        userID: user.id,
      });
      set.status = 201;
      return response;
    },
    {
      auth: true,
      body: BudgetModel.BudgetBody,
      response: {
        201: BudgetModel.BudgetResponse,
      },
    }
  )
  .get(
    "/",
    async ({ user, set }) => {
      const response = await BudgetService.ReadBudget({ userID: user.id });
      set.status = 200;
      return response;
    },
    {
      auth: true,
      response: {
        200: BudgetModel.BudgetResponseArray,
      },
    }
  )
  .get(
    "/:budgetID",
    async ({ user, set, params: { budgetID } }) => {
      const response = await BudgetService.ReadBudgetById(
        { budgetID },
        { userID: user.id }
      );
      set.status = 200;
      return response;
    },
    {
      auth: true,
      params: BudgetModel.BudgetIDParams,
      response: {
        200: BudgetModel.BudgetResponse,
      },
    }
  )
  .put(
    "/:budgetID",
    async ({ user, set, body, params: { budgetID } }) => {
      const response = await BudgetService.UpdateBudget(
        body,
        { budgetID },
        { userID: user.id }
      );
      set.status = 200;
      return response;
    },
    {
      auth: true,
      params: BudgetModel.BudgetIDParams,
      body: BudgetModel.BudgetBody,
      response: {
        200: BudgetModel.BudgetResponse,
      },
    }
  )
  .delete(
    "/:budgetID",
    async ({ user, set, params: { budgetID } }) => {
      const response = await BudgetService.DeleteBudget(
        { budgetID },
        { userID: user.id }
      );
    },
    {
      auth: true,
      params: BudgetModel.BudgetIDParams,
    }
  );
