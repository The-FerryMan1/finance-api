import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { TransactionModel } from "./model";
import { createTransaction, readTrasaction } from "./service";

export const transactionRoute = new Elysia()
    .use(betterAuth)
    .post('/category/:id/transaction', async({user, body, set, params:{id}})=>{
        const response = await createTransaction({id}, body, user.id)
        set.status = 201
        return response
    },{
        auth:true,
        params: TransactionModel.transactionParams,
        body: TransactionModel.transactionBody,
    })
    .get('/category/:id/transaction', async({params:{id}, user})=>{
        const response = await readTrasaction({id}, user.id)
        return response
    },{
        auth:true,
        params: TransactionModel.transactionParams,
        response:{
            200:TransactionModel.transactionResponseArray
        }
    })