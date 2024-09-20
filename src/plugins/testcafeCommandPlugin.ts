import { Elysia, t } from 'elysia'
import * as testcafeCommandService from '../services/testcafeCommandService'
import { isAuthenticated } from '../middleware/auth';


const testcafeCommandPlugin = new Elysia()
    .group("/testcafeCommand", (group) =>
        group
            .get("/getTestcafeCommandbyUserId/:id", async ({headers }) => {     
              const token = headers.authorization;
                const loggedUser = isAuthenticated(token);          
                return await testcafeCommandService.getTestcafeCommandbyUserId(loggedUser.id);
              }, {
                detail: {
                  tags: ['TestCafeCommand'],
                  security: [
                    { JwtAuth: [] }
                  ],
                },
              })
    )

export default testcafeCommandPlugin;