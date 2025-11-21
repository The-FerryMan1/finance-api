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
    export async function FinancialAccountOnboard({ accountName, accountType, currentBalance, institution}: FinancialAccountModel.FinancialAccountBody, {userID}:userIDModel ) {

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

        const FinancialAccountIDConverted = parseInt(FinancialAccountID)

        if (isNaN(FinancialAccountIDConverted)) throw status(400, "Parameter should be numeric" satisfies FinancialAccountModel.FinancialAccountParamsInvalid)

        const [row] = await db
            .select()
            .from(FinancialAccount)
            .where(
                and(
                    eq(FinancialAccount.userID, userID),
                    eq(FinancialAccount.id, FinancialAccountIDConverted)
                )
            )
            .limit(1)


        if(!row) throw status(404, 'Not Found')

        return row
    }

    export async function ModifyFinancialAccount({ accountName, accountType, currentBalance, institution}: FinancialAccountModel.FinancialAccountBody,{userID}:userIDModel, { FinancialAccountID }: FinancialAccountModel.FinancialAccountParams) {

        const FinancialAccountIDConverted = parseInt(FinancialAccountID)

        if (isNaN(FinancialAccountIDConverted)) throw status(400, "Parameter should be numeric" satisfies FinancialAccountModel.FinancialAccountParamsInvalid)
        const checkRow = await db
            .$count(FinancialAccount,
                and(
                    eq(FinancialAccount.id, FinancialAccountIDConverted),
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
                    eq(FinancialAccount.id, FinancialAccountIDConverted),
                    eq(FinancialAccount.userID, userID)
                )
            )
            .returning()

        if (!row) throw status(500, "Database error: Faild to retrieve updated record.")

        return row

    }

    export async function DeleteFinancialAccount({ userID }: userIDModel, { FinancialAccountID }: FinancialAccountModel.FinancialAccountParams) {

        const FinancialAccountIDConverted = parseInt(FinancialAccountID)

        if (isNaN(FinancialAccountIDConverted)) throw status(400, "Parameter should be numeric" satisfies FinancialAccountModel.FinancialAccountParamsInvalid)

        const row = await db
            .delete(FinancialAccount)
            .where(
                and(
                    eq(FinancialAccount.id, FinancialAccountIDConverted),
                    eq(FinancialAccount.userID, userID)
                )
            ).returning(
                {
                    id: FinancialAccount.id
                }
            )

        if (row.length === 0) throw status(404, "Financial account does not exists or access denied.")

        return { status: 200, message: `Account ${FinancialAccountID} deleted.` }
    }
}