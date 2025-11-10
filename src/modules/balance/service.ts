import { db } from "../../database";
import { balance } from "../../database/schema";
import type { BalanceModel } from "./model";


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