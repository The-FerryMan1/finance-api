import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";
import { CategoriesModel } from "./categories.model";
import { CategoriesService } from "./categories.service";

export const CategoriesHandler = new Elysia({ prefix: "categories" })
  .use(betterAuth)
  .post(
    "/",
    async ({ user, body, set }) => {
      const response = await CategoriesService.CreateCategory(body, {
        userID: user.id,
      });
      set.status = 201;
      return response;
    },
    {
      auth: true,
      body: CategoriesModel.CategoriesBody,
      response: {
        201: CategoriesModel.CategoriesResponse,
        400: CategoriesModel.CategoriesInvalid,
      },
    }
  )
  .get(
    "/",
    async ({ set, user }) => {
      const response = await CategoriesService.ReadCategories({
        userID: user.id,
      });
      set.status = 200;
      return response;
    },
    {
      auth: true,
      response: {
        200: CategoriesModel.CategoriesResponseArray,
        400: CategoriesModel.CategoriesInvalid,
      },
    }
  )
  .get(
    "/:categoryID",
    async ({ user, set, params: { categoryID } }) => {
      const response = await CategoriesService.ReadCategoriesByID(
        { categoryID },
        { userID: user.id }
      );

      set.status = 200;

      return response;
    },
    {
      auth: true,
      params: CategoriesModel.CategoriesParams,
      response: {
        200: CategoriesModel.CategoriesResponse,
      },
    }
  )
  .put(
    "/:categoryID",
    async ({ body, user, set, params: { categoryID } }) => {
      const response = await CategoriesService.UpdateCategory(
        body,
        { categoryID },
        { userID: user.id }
      );

      set.status = 200;

      return response;
    },
    {
      auth: true,
      params: CategoriesModel.CategoriesParams,
      body: CategoriesModel.CategoriesBody,
      response: {
        200: CategoriesModel.CategoriesResponse,
      },
    }
  )
  .delete(
    "/:categoryID",
    async ({ user, set, params: { categoryID } }) => {
      const response = await CategoriesService.DeleteCategory(
        { categoryID },
        { userID: user.id }
      );

      set.status = 200;

      return response;
    },
    {
      auth: true,
      params: CategoriesModel.CategoriesParams,
    }
  );
