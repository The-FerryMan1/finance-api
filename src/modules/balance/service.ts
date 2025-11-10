import { and, eq } from "drizzle-orm";
import { db } from "../../database";
import { balance } from "../../database/schema";
import type { BalanceModel } from "./model";
import { status } from "elysia";


export async function createBalance({ balance_type, current_balance }: BalanceModel.balanceBody, user_id: string) {
    try {
        const [newBalance] = await db.insert(balance)
            .values({ userID: user_id, balanceType: balance_type, currentBalance: current_balance })
            .returning({ id: balance.id, user_id: balance.userID, current_balance: balance.currentBalance, balance_type: balance.balanceType, created_at: balance.createdAT })

        if (!newBalance) throw new Error('failed to retrieve the newly balance record')
        return newBalance
    } catch (error) {
        console.log(error)
        throw error
    }
}


export async function deleteBalance({id}:BalanceModel.deleteBalancebody, user_id:string) {
    try {
        const foundBalance = await db.$count(balance, and(eq(balance.id, id), eq(balance.userID, user_id)))
        if(!foundBalance) throw new Error("Balance not found")
        await db.delete(balance).where(and(eq(balance.id, id), eq(balance.userID, user_id)))
        return "Balance Deleted successfully"
    } catch (error) {
        if(error instanceof Error){
           if(error.message === 'Balance not found'){
            throw status(404, 'Not Found')
           }
        }
          console.log(error)
        throw status(500, 'Internal Server Error')
    }
}