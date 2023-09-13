import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

import routes from "./app/Controllers/routes";

export const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(routes())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
