import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { createBalance } from "./service";
import { BalanceModel } from "./model";

export const balanceRoute = new Elysia()
    .use(betterAuth)
    .post('/balances', async({body, set, user})=>{
        
        const newRecord = await createBalance(body, String(user.id))
        set.status = 201
        return newRecord
    },{
        auth: true,
        body: BalanceModel.balanceBody,
        response: {
            201: BalanceModel.balanceRespone,
            400: BalanceModel.balanceBodyInvalid
        }
    })