import { ElysiaCustomStatusResponse, status } from "elysia";
import { auth } from "../../lib/auth";
import { type AuthModel } from "./model";

export async function signUp({ email, name, rememberMe, password }: AuthModel.signUpBody) {
    try {
        const data = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
                rememberMe
            }
        })

        if (!data) throw status(400, "Bad Request")

        return data
    } catch (error) {
        if (error instanceof ElysiaCustomStatusResponse) {
            return status(error.code, error.response)
        }

        if (error instanceof Error) {
            return status(500, error.message)
        }

        return status(500, "Internal Server Error")
    }
}

export async function signIn({ email, password }: AuthModel.signInBody) {
    try {
        const data = await auth.api.signInEmail({
            body: {
                email,
                password,
                rememberMe: true,
            }
        })

        if(!data) throw status(400, "Bad Request")
        
        return {message: "login success", data}
    } catch (error) {
        if (error instanceof ElysiaCustomStatusResponse) {
            return status(error.code, error.response)
        }

        if (error instanceof Error) {
            return status(500, error.message)
        }

        return status(500, "Internal Server Error")
    }
}