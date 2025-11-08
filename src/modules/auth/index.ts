import Elysia, { status } from "elysia";
import { signIn, signUp } from "./service";
import { AuthModel } from "./model";
import { auth } from "../../lib/auth";


export const authHandler = new Elysia()
    .post('/signUp', async ({ body }) => {
        try {
            const response = await signUp(body)

            return response
        } catch (error) {
            throw status(500, error)
        }
    }, {
        body: AuthModel.signUpBody,
        response: {
            400: AuthModel.signUpInvalid
        }
    }
    )
    .post('/signIn', async({body})=>{
        try {
            const response = await signIn(body)
             return response
        } catch (error) {
               throw status(500, error)
        }
    },{
        body: AuthModel.signInBody
    }
)