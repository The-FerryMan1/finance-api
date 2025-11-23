import { t } from "elysia";
import { TrasanctionStatusType } from "../../database/schema";

export namespace TransactionModel {
  export const TransactionBody = t.Object({
    categoryID: t.Number(),
    budgetID: t.Optional(t.Number()),
    amount: t.Numeric(),
    date: t.Date(),
    description: t.String(),
    status: t.Enum(TrasanctionStatusType),
  });
  export type TransactionBody = typeof TransactionBody.static;

  export const TrasanctionParams = t.Object({
    trasanctionID: t.String(),
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
    date: t.Date(),
    amount: t.Numeric(),
    description: t.String(),
    status: t.Enum(TrasanctionStatusType),
    originalCurrency: t.Optional(t.String()),
    receiptURL: t.Optional(t.String()),
  });

  export type TransactionResponse = typeof TransactionResponse.static;

  export const TransactionResponseArray = t.Array(TransactionResponse);

  export type TransactionResponseArray = typeof TransactionResponseArray.static;

  export const TransactionUserID = t.Object({
    userID: t.String(),
  });

  export type TransactionUserID = typeof TransactionUserID.static;
}
