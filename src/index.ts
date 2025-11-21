import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi'
import { betterAuth } from "./middleware/betterAuth";
import cors from "@elysiajs/cors";
import { FinancialAccountHandler } from "./modules/financial_account/financial_account.handler";


const app = new Elysia({prefix: `/api/${Bun.env.API_VERSION as string}`})
.use(
    cors({
      origin: ["http://localhost:3000", Bun.env.CLIENT_DOMAIN as string],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(openapi())
  .use(FinancialAccountHandler)
  .listen(Bun.env.PORT as string || 3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
