import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi'
import { betterAuth } from "./middleware/betterAuth";
import cors from "@elysiajs/cors";


const app = new Elysia({prefix: "/api"})
.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(openapi())
  .use(betterAuth)
  .get('/user', ({ user }) => user, {
    auth: true,
    
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
