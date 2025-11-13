import { t } from "elysia";

export namespace TransactionModel {

    export const transactionParams = t.Object({
        id: t.Number()
    })

    export type transactionParams = typeof transactionParams.static

    export const transactionBody = t.Object({
        balance_id: t.Number(),
        amount: t.Number(),
        description: t.String()
    })

    export type transactionBody = typeof transactionBody.static

    export const transactionResponse = t.Object({
        id: t.Number(),
        category_id: t.Number(),
        balance_id: t.Number(),
        amount: t.Number(),
        description: t.Nullable(t.String()),
        date: t.Nullable(t.Date())
    })

    export const transactionResponseArray = t.Array(transactionResponse)
    export type transactionResponseArray = typeof transactionResponseArray.static
    export type transactionResponse = typeof transactionResponse.static

    export const transactionBodyInvalid = t.Literal('Unable to create new transaction')
    export type transactionBodyInvalid = typeof transactionBodyInvalid.static
}