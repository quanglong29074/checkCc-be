import { Elysia, t } from 'elysia'
import * as addressService from '../services/addressService'
import { isAuthenticated } from '../middleware/auth';


const addressPlugin = new Elysia()
    .group("/address", (group) =>
        group
            .post("/addAddress", async ({headers, body }) => {     
              const token = headers.authorization;
                const loggedUser = isAuthenticated(token);          
                const {full_name, phone, address } = body;
                return await addressService.addAdress(full_name, phone, address,loggedUser.id);
              }, {
                detail: {
                  tags: ['Address'],
                  security: [
                    { JwtAuth: [] }
                  ],
                },
                body: t.Object({
                  full_name: t.String(),
                  phone: t.String(),
                  address: t.String(),
                })  
                
              })
    )

export default addressPlugin;