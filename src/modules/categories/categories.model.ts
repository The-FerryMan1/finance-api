import { t } from "elysia";
import { CategoryTypeEnum } from "../../database/schema";
export namespace CategoriesModel {
  export const userIDModel = t.Object({
    userID: t.String(),
  });

  export type userIDModel = typeof userIDModel.static;

  export const CategoriesBody = t.Object({
    categoryName: t.String({ maxLength: 255 }),
    categoryType: t.Enum(CategoryTypeEnum),
    parentID: t.Nullable(t.Number()),
  });

  export type CategoriesBody = typeof CategoriesBody.static;

  export const CategoriesParams = t.Object({
    categoryID: t.String(),
  });

  export type CategoriesParams = typeof CategoriesParams.static;

  export const CategoriesParamsInvalid = t.Literal(
    "Parameter is required and should be numeric."
  );

  export type CategoriesParamsInvalid = typeof CategoriesParamsInvalid.static;

  export const CategoriesResponse = t.Object({
    id: t.Number(),
    userID: t.String(),
    categoryName: t.String(),
    categoryType: t.Enum(CategoryTypeEnum),
    parentID: t.Nullable(t.Number()),
  });
  export type CategoriesResponse = typeof CategoriesResponse.static;

  export const CategoriesResponseArray = t.Array(CategoriesResponse);

  export type CategoriesResponseArray = typeof CategoriesResponseArray.static;

  export const CategoriesInvalid = t.Literal(
    "Unable to create a category account."
  );
  export type CategoriesInvalid = typeof CategoriesInvalid.static;
}
