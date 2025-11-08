import {t} from 'elysia'
import { auth } from '../../lib/auth'

export namespace AuthModel {

    export const signUpBody = t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
        rememberMe: t.Optional(t.Boolean())
    })
    export type signUpBody = typeof signUpBody.static

    

    export const signUpInvalid = t.Literal('Bad Request')
    export type signUpInvalid = typeof signUpInvalid.static


    export const signInBody = t.Object({
        email: t.String(),
        password: t.String()
    })

    export type signInBody = typeof signInBody.static

    export const signInInvalid = t.Literal('Bad Request')
    export type signInInvalid = typeof signInInvalid.static
}


