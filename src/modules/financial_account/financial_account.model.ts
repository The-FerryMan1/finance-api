import { t } from "elysia";
import {FinancialAccountType} from "../../database/schema"

export namespace FinancialAccountModel {

    export const FinancialAccountBody = t.Object({
        userID: t.String(),
        accountName: t.String(),
        accountType: t.Enum(FinancialAccountType),
        institution: t.String(),
        currentBalance: t.Numeric(),
    })

    export type FinancialAccountBody = typeof FinancialAccountBody.static

    export const FinancialAccountParams = t.Object({
        FinancialAccountID: t.Number()
    })

    export type FinancialAccountParams = typeof FinancialAccountParams.static

    export const FinancialAccountResponse = t.Object({
        id: t.Number(),
        userID: t.String(),
        accountName: t.String(),
        accountType: t.Enum(FinancialAccountType),
        institution: t.String(),
        currentBalance: t.Numeric(),
        lastSynced: t.String()
    })

    export type FinancialAccountResponse = typeof FinancialAccountResponse.static
    
    export const FinancialAccountInvalid = t.Literal("Unable to create a financial account")
    
    export type FinancialAccountInvalid = typeof FinancialAccountInvalid.static
}