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
        created_at: t.Optional(t.String())
    })

    export type balanceRespone = typeof balanceRespone.static

    export const balanceBodyInvalid = t.Literal("Bad Request")

    export type balanceBodyInvalid = typeof balanceBodyInvalid.static

}