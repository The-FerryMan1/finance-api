import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { TransactionModel } from "./model";
import { createTransaction, HardDeleteTransanction, readTrasaction, readTrasanctionHistory, softDeleteTransanction } from "./service";

export const transactionRoute = new Elysia()
    .use(betterAuth)
    .post('/category/:id/transactions', async ({ user, body, set, params: { id } }) => {
        const response = await createTransaction({ id }, body, user.id)
        set.status = 201
        return response
    }, {
        auth: true,
        params: TransactionModel.transactionParams,
        body: TransactionModel.transactionBody,
    })
    .get('/category/:id/transactions', async ({ params: { id }, user }) => {
        const response = await readTrasaction({ id }, user.id)
        return response
    }, {
        auth: true,
        params: TransactionModel.transactionParams,
        response: {
            200: TransactionModel.transactionResponseArray
        }
    })
    .get('/transactions', async ({ user, set }) => {

        const response = await readTrasanctionHistory(user.id)
        set.status = 200
        return response

    }, {
        auth: true,
        response: {
            200: TransactionModel.transactionResponseArray
        }
    })
    .patch('/transactions/:id', async ({ params: { id }, user, set }) => {
        await softDeleteTransanction({ id }, user.id)
        set.status = 204
        return
    }, {
        auth: true,
        params: TransactionModel.transactionParams
    })
    .delete('/transactions/:id', async ({ params: { id }, user, set }) => {
        await HardDeleteTransanction({ id }, user.id)
        set.status = 204
        return
    }, {
        auth: true,
        params: TransactionModel.transactionParams
    })