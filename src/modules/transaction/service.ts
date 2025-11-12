import { and, eq, sql } from "drizzle-orm";
import { db } from "../../database";
import { balance, category, transaction } from "../../database/schema";
import { TransactionModel } from "./model";
import { status } from "elysia";

export async function createTransaction({ id: category_id}: TransactionModel.transactionParams, { amount, balance_id, description }: TransactionModel.transactionBody, user_id: string) {

    const row = await db.transaction(async (tx) => {
        const [row] = await tx
            .insert(transaction)
            .values(
                {
                    amount,
                    categoryID: category_id,
                    balanceID: balance_id,
                    description,
                    userID: user_id,
                    date: new Date(Date.now())
                }
            )
            .returning(
                {
                    id: transaction.id,
                    category_id: transaction.categoryID,
                    balance_id: transaction.balanceID,
                    amount: transaction.amount,
                    description: transaction.description,
                    date: transaction.date

                }
            )

        if (!row) throw status(400, "Unable to create new transaction" satisfies TransactionModel.transactionBodyInvalid)


        const [currentBalance] = await tx
            .select({ balance: balance.currentBalance })
            .from(balance)
            .where(
                and(
                    eq(balance.id, balance_id),
                    eq(balance.userID, user_id)
                )
            )

        if(!currentBalance) throw status(404, "Unable to create new transaction, balance not found")

        if(currentBalance.balance < amount){
                throw status(403, 'insufficient balance')
        }

        await tx
            .update(balance)
            .set({ currentBalance: sql`${balance.currentBalance} - ${amount}` })
            .where(
                and(
                    eq(balance.id, balance_id),
                    eq(balance.userID, user_id)
                )
            )

        return row

    })



    return row
}