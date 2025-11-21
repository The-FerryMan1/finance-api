import { status } from "elysia";
import { db } from "../../database";
import { FinancialAccount } from "../../database/schema";
import { FinancialAccountModel } from "./financial_account.model";
import { t } from "elysia";
import { and, eq } from "drizzle-orm";

const userIDModel = t.Object({
    userID: t.String()
})

type userIDModel = typeof userIDModel.static

export namespace FinancialAccountService {
    export async function FinancialAccountOnboard({ accountName, accountType, currentBalance, institution, userID }: FinancialAccountModel.FinancialAccountBody) {

        const [row] = await db
            .insert(FinancialAccount)
            .values(
                {
                    accountName,
                    userID,
                    accountType,
                    currentBalance,
                    institution,
                }
            )
            .returning()

        if (!row) throw status(400, "Unable to create a financial account" satisfies FinancialAccountModel.FinancialAccountInvalid)

        return row

    }

    export async function ReadFinancialAccount({ userID }: userIDModel) {

        const row = await db
            .select()
            .from(FinancialAccount)
            .where(
                eq(FinancialAccount.userID, userID)
            )

        return row
    }

    export async function ReadFinancialAccountById({ FinancialAccountID }: FinancialAccountModel.FinancialAccountParams, { userID }: userIDModel) {


        const [row] = await db
            .select()
            .from(FinancialAccount)
            .where(
                and(
                    eq(FinancialAccount.userID, userID),
                    eq(FinancialAccount.id, FinancialAccountID)
                )
            )
            .limit(1)

        return row
    }

    export async function ModifyFinancialAccount({ accountName, accountType, currentBalance, institution, userID }: FinancialAccountModel.FinancialAccountBody, { FinancialAccountID }: FinancialAccountModel.FinancialAccountParams) {

        const checkRow = await db
            .$count(FinancialAccount,
                and(
                    eq(FinancialAccount.id, FinancialAccountID),
                    eq(FinancialAccount.userID, userID))
            )

        if (checkRow === 0) throw status(404, "Financial account does not exists or access denied.")

        const [row] = await db
            .update(FinancialAccount)
            .set(
                {
                    accountName,
                    accountType,
                    currentBalance,
                    institution,
                }
            )
            .where(
                and(
                    eq(FinancialAccount.id, FinancialAccountID),
                    eq(FinancialAccount.userID, userID)
                )
            )
            .returning()

        if (!row) throw status(500, "Database error: Faild to retrieve updated record.")

        return row

    }

    export async function DeleteFinancialAccount({ userID }: userIDModel, { FinancialAccountID }: FinancialAccountModel.FinancialAccountParams) {

       const row = await db
        .delete(FinancialAccount)
        .where(
             and(
                    eq(FinancialAccount.id, FinancialAccountID),
                    eq(FinancialAccount.userID, userID)
                )
        ).returning(
            {
                id:FinancialAccount.id
            }
        )

        if(row.length === 0) throw status(404, "Financial account does not exists or access denied.")

        return {status: 200, message:`Account ${FinancialAccountID} deleted.`}
    }
}