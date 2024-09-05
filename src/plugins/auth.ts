import { Elysia, t } from 'elysia';
import * as userService from '../services/userService';
import { isAuthenticated } from '../middleware/auth';

const authPlugin = new Elysia()
  .group("/auth", (group) =>
    group
      .post("/login", async ({ body }) => {
        return await userService.login(body);
      }, {
        detail: {
          tags: ['auth'],
        },
        body: t.Object({
          email: t.String(),
          password: t.String()
        })
      })   
  );

export default authPlugin;
