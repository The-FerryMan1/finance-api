import Elysia, { ElysiaCustomStatusResponse, t } from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { createCategory, deleteCategory, readCategory, readCategoryByID, updateCategory } from "./service";
import { CategoryModel } from "./model";


export const categoryRoute = new Elysia()
    .onError(({ error, set }) => {
        if(error instanceof ElysiaCustomStatusResponse){
            set.status = error.code
            return new Response(error.response)
        }
        set.status = 500
         return new Response("internal service error" + error)
        
    })
    .use(betterAuth)
    .post('/category', async ({ body, set, user }) => {
        const response = await createCategory(body, user.id)
        set.status = 201
        return response
    }, {
        auth: true,
        body: CategoryModel.categoryBody,
        response: {
            201: CategoryModel.categoryBodyResponse,
            400: CategoryModel.categoryBodyResponseInvalid
        }
    })
    .get('/category', async({user, set})=>{
        const response = await readCategory(user.id)
        set.status = 200
        return response
    },{
        auth:true,
        response:{
            200: CategoryModel.categoryBodyResponseArray
        }
    })
    .get('/category/:id', async({params:{id}, user, set})=>{
        const response = await readCategoryByID({id}, user.id)
        set.status = 200
        return response
    },{
        auth:true,
        params: CategoryModel.categoryParamID,
        response: {
            200:CategoryModel.categoryBodyResponse
        }
    })
    .put('/category/:id', async({params:{id}, body, user, set})=>{
        const response = await updateCategory({id}, body, user.id)
        set.status = 201
        return response
    },{
        auth:true,
        params: CategoryModel.categoryParamID,
        body: CategoryModel.categoryBody,
        response:{
            201: CategoryModel.categoryBodyResponse
        }
    })
    .delete('/category/:id', async({params:{id}, user, set})=>{

        await deleteCategory({id}, user.id)
        set.status = 204
        return 
    },{
        auth: true,
        params: CategoryModel.categoryParamID,
    })
    