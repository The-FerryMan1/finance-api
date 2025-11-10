import Elysia, { status } from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { createBalance, deleteBalance } from "./service";
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
    .delete('/balances/:id', async({params:{id}, user, set})=>{
            const deleteBalanceRes = await deleteBalance({id: id}, user.id)
            set.status = "No Content"
    },{
        auth: true,
        params: BalanceModel.deleteBalanceBody,
        response: {
            204: BalanceModel.deleteBalanceRespone,
            400: BalanceModel.deleteBalanceInvalid
        }
    }
)