import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { TransactionModel } from "./model";
import { createTransaction } from "./service";

export const transactionRoute = new Elysia()
    .use(betterAuth)
    .post('/trasaction', async({user, body, set, params:{id}})=>{
        const response = await createTransaction(id, body, user.id)
        set.status = 201
        return response
    },{
        auth:true,
        params: TransactionModel.transactionParams,
        body: TransactionModel.transactionBody,
    })