import { t } from "elysia";
import { TrasanctionStatusType } from "../../database/schema";

export namespace TransactionModel {
  export const TransactionBody = t.Object({
    categoryID: t.Number(),
    budgetID: t.Optional(t.Number()),
    financialID: t.Number(),
    amount: t.Numeric(),
    date: t.Date(),
    description: t.String(),
    status: t.Enum(TrasanctionStatusType),
  });
  export type TransactionBody = typeof TransactionBody.static;

  export const TrasanctionIncomeBody = t.Object({
    amount: t.Numeric(),
  });

  export type TrasanctionIncomeBody = typeof TrasanctionIncomeBody.static;

  export const TrasanctionParams = t.Object({
    transactionID: t.String(),
  });

  export type TrasanctionParams = typeof TrasanctionParams.static;

  export const TransactionParamsInvalid = t.Literal(
    "Trasanction parameter is required is it must be numeric."
  );

  export type TransactionParamsInvalid = typeof TransactionParamsInvalid.static;

  export const TransactionResponse = t.Object({
    id: t.Number(),
    userID: t.String(),
    categoryID: t.Number(),
    financialID: t.Number(),
    date: t.String(),
    amount: t.Numeric(),
    description: t.String(),
    status: t.Enum(TrasanctionStatusType),
    originalCurrency: t.Optional(t.Union([t.String(), t.Null()])),
    receiptURL: t.Optional(t.Union([t.String(), t.Null()])),
    isDeleted: t.Boolean(),
  });

  export type TransactionResponse = typeof TransactionResponse.static;

  export const TransactionResponseArray = t.Array(TransactionResponse);

  export type TransactionResponseArray = typeof TransactionResponseArray.static;

  export const TransactionUserID = t.Object({
    userID: t.String(),
  });

  export type TransactionUserID = typeof TransactionUserID.static;

  export const TransactionUpdateBody = t.Object({
    description: t.String(),
  });

  export type TransactionUpdateBody = typeof TransactionUpdateBody.static;
}
