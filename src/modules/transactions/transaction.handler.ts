import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { TransactionModel } from "./transaction.model";
import { TransactionService } from "./transaction.service";

export const TransationHandler = new Elysia({ prefix: "transactions" })
  .use(betterAuth)
  .post(
    "/income",
    async ({ user, body, set }) => {
      const response = await TransactionService.CreateIncomeTransantion(body, {
        userID: user.id,
      });
      set.status = 201;
      return response;
    },
    {
      auth: true,
      body: TransactionModel.TransactionBody,
      response: {
        201: TransactionModel.TransactionResponse,
      },
    }
  )
  .post(
    "/expense",
    async ({ user, body, set }) => {
      const response = await TransactionService.CreateExpenseTransanction(
        body,
        { userID: user.id }
      );

      set.status = 201;
      return response;
    },
    {
      auth: true,
      body: TransactionModel.TransactionBody,
      response: {
        201: TransactionModel.TransactionResponse,
      },
    }
  )
  .get(
    "/",
    async ({ user, set }) => {
      const response = await TransactionService.ReadTransaction({
        userID: user.id,
      });
      set.status = 200;
      return response;
    },
    {
      auth: true,
      response: {
        200: TransactionModel.TransactionResponseArray,
      },
    }
  )
  .get(
    "/:transactionID",
    async ({ user, body, set, params: { transactionID } }) => {
      const response = await TransactionService.ReadTransactionByID(
        { transactionID },
        { userID: user.id }
      );
      set.status = 200;
      return response;
    },
    {
      auth: true,
      params: TransactionModel.TrasanctionParams,
      response: {
        200: TransactionModel.TransactionResponse,
      },
    }
  )
  .delete(
    "/revert/:transactionID",
    async ({ user, set, params: { transactionID } }) => {
      const response = await TransactionService.RevertTransaction(
        { transactionID },
        { userID: user.id }
      );
      set.status = 200;
      return response;
    },
    {
      auth: true,
      params: TransactionModel.TrasanctionParams,
    }
  )
  .put(
    "/:transactionID",
    async ({ user, set, body, params: { transactionID } }) => {
      const response = await TransactionService.UpdateTransaction(
        body,
        { transactionID },
        { userID: user.id }
      );
      set.status = 200;
      return response;
    },
    {
      auth: true,
      params: TransactionModel.TrasanctionParams,
      body: TransactionModel.TransactionUpdateBody,
      response: {
        200: TransactionModel.TransactionResponse,
      },
    }
  );
