import { t } from "elysia";

import { balance } from '../../database/schema'

export type BalanceType = typeof balance.$inferInsert

export namespace BalanceModel {


    export const balanceBody = t.Object({
        current_balance: t.Number(),
        balance_type: t.String()
    })

    export type balanceBody = typeof balanceBody.static

    export const balanceRespone = t.Object({
        id: t.Number(),
        user_id: t.String(),
        current_balance: t.Number(),
        balance_type: t.Optional(t.String()),
        created_at: t.Date()
    })

    export type balanceRespone = typeof balanceRespone.static

    export const balanceBodyInvalid = t.Literal("Bad Request")

    export type balanceBodyInvalid = typeof balanceBodyInvalid.static

    export const getBalanceResponse= t.Object({
        id: t.Number(),
        current_balance: t.Number(),
        balance_type: t.Nullable(t.String()),
        created_at: t.Nullable(t.Date())
    })

    export const getBalanceReponseArray = t.Array(getBalanceResponse)
    export type getBalanceReponseArray = typeof getBalanceResponse.static

    export type getBalanceResponse = typeof getBalanceResponse.static
    
    export const getBalanceParam = t.Object({
        id:t.Number()
    })
    export type getBalanceParam = typeof getBalanceParam.static

    export const getBalanceByIdInvalid = t.Literal('Not Found')
    
    export type getBalanceByIdInvalid = typeof getBalanceByIdInvalid.static

    export const deleteBalanceBody = t.Object({
        id: t.Number()
    })

    export type deleteBalancebody = typeof deleteBalanceBody.static

    export const deleteBalanceRespone = t.Literal("Balance Deleted successfully")

    export type deleteBalanceRespone = typeof deleteBalanceRespone.static

    export const deleteBalanceInvalid = t.Literal("Invalid ID")

    export type deleteBalanceInvalid = typeof deleteBalanceInvalid.static

}