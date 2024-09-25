import { Elysia, t } from 'elysia'
import * as testcafeCommandService from '../services/testcafeCommandService'
import { isAuthenticated } from '../middleware/auth';


const testcafeCommandPlugin = new Elysia()
    .group("/testcafeCommand", (group) =>
        group
            .get("/getTestcafeCommandbyUserId", async ({headers }) => {           
                return await testcafeCommandService.getTestcafeCommandbyUserId();
              }, {
                detail: {
                  tags: ['TestCafeCommand'],           
                },
              })
    )

export default testcafeCommandPlugin;