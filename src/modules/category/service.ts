import { status } from "elysia";
import { db } from "../../database";
import { balance, category } from "../../database/schema";
import { CategoryModel } from "./model";
import { and, eq } from "drizzle-orm";

export async function createCategory({ name, type }: CategoryModel.categoryBody, user_id: string) {

    const [row] = await db
        .insert(category)
        .values(
            {
                userID: user_id,
                name,
                type
            }
        )
        .returning(
            {
                id: category.id,
                name: category.name,
                type: category.type
            }
        )

    if (!row) throw status(400, "Bad Request, Cannot create a new category" satisfies CategoryModel.categoryBodyResponseInvalid)

    return row

}

export async function readCategory(user_id: string) {
    const row = await db
        .select({
            id: category.id,
            name: category.name,
            type: category.type
        })
        .from(category)
        .where(
            eq(category.userID, user_id)
        )

    if (!row) throw status(404, 'Not Found')

    return row
}

export async function readCategoryByID({ id }: CategoryModel.categoryParamID, user_id: string) {

    const rowCheck = await db
        .$count(category,
            and(
                eq(category.id, id),
                eq(category.userID, user_id)
            ))

    if (!rowCheck) throw status(404, 'Not Found')

    const [row] = await db
        .select(
            {
                id: category.id,
                name: category.name,
                type: category.type
            }
        )
        .from(category)
        .where(
            and(
                eq(category.id, id),
                eq(category.userID, user_id)
            )
        )
        .limit(1)

    return row

}

export async function updateCategory({ id }: CategoryModel.categoryParamID, { name, type }: CategoryModel.categoryBody, user_id: string) {

    const checkRow = await db
        .$count(category,
            and(
                eq(category.id, id),
                eq(category.userID, user_id)
            )
        )

    if (!checkRow) throw status(404, 'Not Found')

    const [row] = await db
        .update(category)
        .set({
            name,
            type
        })
        .where(
            and(
                eq(category.id, id),
                eq(category.userID, user_id)
            )
        )
        .returning({
            id: category.id,
            name: category.name,
            type: category.type
        })

    if (!row) throw status(400, 'Bad Request')

    return row
}

export async function deleteCategory({ id }: CategoryModel.categoryParamID, user_id: string) {

    const checkRow = await db
        .$count(category,
            and(
                eq(category.id, id),
                eq(category.userID, user_id)
            )
        )
    console.log(checkRow)
    if (!checkRow) throw status(404, 'Not Found')

    await db
        .delete(category)
        .where(
            and(
                eq(category.id, id),
                eq(category.userID, user_id)
            )
        )

    return 'Category deleted successfully'
}