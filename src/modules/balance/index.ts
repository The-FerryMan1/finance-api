import Elysia, { status } from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { createBalance, deleteBalance, readBalance, readBalanceById, updateBalance } from "./service";
import { BalanceModel } from "./model";

export const balanceRoute = new Elysia()
    .onError(({ error }) => {
        return new Response(error.toString())
    })
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
    .get('/balances', async({user, set})=>{
        const response = await readBalance(user.id)
        set.status = 200
        return response
    },{
        auth:true, 
        response:{
            200: BalanceModel.getBalanceReponseArray}
        }
    )
    .get('/balances/:id', async({user, params:{id}, set})=>{
        const response = await readBalanceById({id},user.id)
        set.status = 200
        return response
    },  
    {
        auth:true,
        params: BalanceModel.getBalanceParam,
        response:{
            200: BalanceModel.getBalanceResponse
        }
    }
    )
    .put('/balances/:id', async({params:{id}, body, user})=>{
        const response = await updateBalance({id}, body, user.id)
        return response
    },
    {
        auth: true,
        params: BalanceModel.getBalanceParam,
        body: BalanceModel.balanceBody,
        response:{
            200: BalanceModel.getBalanceResponse
        }
    }
    )
    .delete('/balances/:id', async({params:{id}, user, set})=>{
            const deleteBalanceRes = await deleteBalance({id}, user.id)
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