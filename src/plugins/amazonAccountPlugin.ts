import { Elysia, t } from 'elysia'
import * as amazonAccountService from '../services/amazonAccountService'
import { isAuthenticated } from '../middleware/auth';


const amazonAccountPlugin = new Elysia()
    .group("/amazonAccount", (group) =>
        group
            .post("/login", async ({headers, body }) => {  
              const token = headers.authorization;
              const loggedUser = isAuthenticated(token);
                const {email, password } = body;
                return await amazonAccountService.loginAmazon(email, password, loggedUser.id);
              }, {
                detail: {
                  tags: ['amazonAccount'],
                  security: [
                    { JwtAuth: [] }
                  ],
                },
                body: t.Object({
                  email: t.String(),
                  password: t.String(),

                })  
                
              })
    )

export default amazonAccountPlugin;