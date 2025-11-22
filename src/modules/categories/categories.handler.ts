import Elysia from "elysia";
import { betterAuth } from "../../middleware/betterAuth";

export const CategoriesHandler = new Elysia({ prefix: "categories" }).use(
  betterAuth
);
