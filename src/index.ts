import { Elysia } from "elysia";

import { openapi } from '@elysiajs/openapi'
import { betterAuth } from "./middleware/betterAuth";
import { authHandler } from "./modules/auth";
import cors from "@elysiajs/cors";


const app = new Elysia()
.use(
    cors({
      origin: "http://localhost:3001",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(openapi({
                documentation: {
                    components: {
                        securitySchemes: {
                            bearerAuth: {
                                type: 'http',
                                scheme: 'bearer',
                                bearerFormat: 'JWT'
                            }
                        }
                    }
                }
            }))
  .use(betterAuth)
  .use(authHandler)
  .get('/user', ({ user }) => user, {
    auth: true,
    
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
