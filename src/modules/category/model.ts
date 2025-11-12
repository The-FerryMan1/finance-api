import { t } from "elysia";
import { CategoryType } from "../../database/schema";


export namespace CategoryModel {
    export const categoryEnumType = t.Enum(CategoryType) 
    export const categoryBody = t.Object({
        name: t.String(),
        type: categoryEnumType
    })
    
    export type categoryBody = typeof categoryBody.static

    export const categoryBodyResponse = t.Object({
        id: t.Number(),
        name: t.String(),
        type: categoryEnumType
    })

    export const categoryBodyResponseArray = t.Array(categoryBodyResponse)
    export type categoryBodyResponseArray = typeof categoryBodyResponseArray.static

    export type categoryBodyResponse = typeof categoryBodyResponse.static

    export const categoryBodyResponseInvalid = t.Literal("Bad Request, Cannot create a new category")
    export type categoryBodyResponseInvalid = typeof categoryBodyResponseInvalid.static

    export const categoryParamID = t.Object({
        id: t.Number()
    })
    export type categoryParamID = typeof categoryParamID.static


    export const deletedResponse = t.Literal('Category deleted successfully')
    export type deletedResponse = typeof deletedResponse.static
}