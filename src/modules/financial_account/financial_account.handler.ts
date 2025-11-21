import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { FinancialAccountModel } from "./financial_account.model";
import { FinancialAccountService } from "./financial_account.service";

export const financialAccountHandler = new Elysia({ prefix: "financial" })
    .use(betterAuth)
    .post("/onboard", async ({ body, user, set }) => {
        const response = await FinancialAccountService.FinancialAccountOnboard({ ...body, userID: user.id })
        set.status = 201
        return response
    }, {
        auth: true,
        body: FinancialAccountModel.FinancialAccountBody,
        response: {
            201: FinancialAccountModel.FinancialAccountResponse
        }
    })
    .post("/", async ({ body, user, set }) => {
        const response = await FinancialAccountService.FinancialAccountOnboard({ ...body, userID: user.id })
        set.status = 201
        return response
    }, {
        auth: true,
        body: FinancialAccountModel.FinancialAccountBody,
        response: {
            201: FinancialAccountModel.FinancialAccountResponse
        }
    })
    .get("/", async ({ user, set }) => {
        const response = await FinancialAccountService.ReadFinancialAccount({ userID: user.id })
        set.status = 200
        return response
    }, {
        auth: true,
        response: {
            200: FinancialAccountModel.FinancialAccountResponseArray
        }
    })
    .get("/:id", async ({ user, set, params:{FinancialAccountID} }) => {
        const response = await FinancialAccountService.ReadFinancialAccountById({FinancialAccountID},{ userID: user.id})
        set.status = 200
        return response
    }, {
        auth: true,
        params:FinancialAccountModel.FinancialAccountParams,
        response: {
            200: FinancialAccountModel.FinancialAccountResponse
        }
    })
    .put("/", async ({body, user, set, params:{FinancialAccountID}}) => {
        const response = await FinancialAccountService.ModifyFinancialAccount({...body, userID:user.id}, {FinancialAccountID})
        set.status = 200
        return response
    },{
        auth:true,
        params:FinancialAccountModel.FinancialAccountParams,
        body:FinancialAccountModel.FinancialAccountBody,
        response: {
            200: FinancialAccountModel.FinancialAccountResponse
        }
    })
    .delete("/", async ({user, set, params:{FinancialAccountID}}) => {
        const response = await FinancialAccountService.DeleteFinancialAccount({userID: user.id}, {FinancialAccountID})
        set.status = 200
        return response
    },{
        auth:true,
        params:FinancialAccountModel.FinancialAccountParams,
    })