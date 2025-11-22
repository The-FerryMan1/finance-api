import { status } from "elysia";
import { db } from "../../database";
import { Categories } from "../../database/schema";
import { CategoriesModel } from "./categories.model";
import { and, eq } from "drizzle-orm";

export namespace CategoriesService {
  export async function CreateCategory(
    { categoryType, categoryName, parentID }: CategoriesModel.CategoriesBody,
    { userID }: CategoriesModel.userIDModel
  ) {
    const [row] = await db
      .insert(Categories)
      .values({ categoryName, categoryType, parentID, userID })
      .returning();

    if (!row)
      throw status(400, "Unable to retrieve the newly created category.");
    return row;
  }

  export async function ReadCategories({
    userID,
  }: CategoriesModel.userIDModel) {
    const row = await db
      .select()
      .from(Categories)
      .where(eq(Categories.userID, userID));

    return row;
  }

  export async function ReadCategoriesByID(
    { categoryID }: CategoriesModel.CategoriesParams,
    { userID }: CategoriesModel.userIDModel
  ) {
    const categoryIDInt = parseInt(categoryID);

    if (isNaN(categoryIDInt))
      throw status(
        400,
        "Parameter is required and should be numeric." satisfies CategoriesModel.CategoriesParamsInvalid
      );

    const [row] = await db
      .select()
      .from(Categories)
      .where(
        and(eq(Categories.id, categoryIDInt), eq(Categories.userID, userID))
      )
      .limit(1);

    return row;
  }

  export async function UpdateCategory(
    { categoryName, categoryType, parentID }: CategoriesModel.CategoriesBody,
    { categoryID }: CategoriesModel.CategoriesParams,
    { userID }: CategoriesModel.userIDModel
  ) {
    const categoryIDInt = parseInt(categoryID);

    if (isNaN(categoryIDInt))
      throw status(
        400,
        "Parameter is required and should be numeric." satisfies CategoriesModel.CategoriesParamsInvalid
      );

    const rowCheck = await db.$count(
      Categories,
      and(eq(Categories.id, categoryIDInt), eq(Categories.userID, userID))
    );

    if (rowCheck === 0)
      throw status(404, "Category does not exists or access denied");

    const [row] = await db
      .update(Categories)
      .set({ categoryName, categoryType, parentID })
      .where(
        and(eq(Categories.id, categoryIDInt), eq(Categories.userID, userID))
      )
      .returning();

    if (!row) throw status(500, "DB: Failed to retrieve updated record");

    return row;
  }

  export async function DeleteCategory(
    { categoryID }: CategoriesModel.CategoriesParams,
    { userID }: CategoriesModel.userIDModel
  ) {
    const categoryIDInt = parseInt(categoryID);

    if (isNaN(categoryIDInt))
      throw status(
        400,
        "Parameter is required and should be numeric." satisfies CategoriesModel.CategoriesParamsInvalid
      );

    const [row] = await db
      .delete(Categories)
      .where(
        and(eq(Categories.id, categoryIDInt), eq(Categories.userID, userID))
      )
      .returning({ id: Categories.id });

    if (!row.id) throw status(404, "Category does not exists or access denied");
  }
}
