import { Elysia, t } from 'elysia'
import * as ccService from '../services/ccService'
import { isAuthenticated } from '../middleware/auth';

const ccPlugin = new Elysia()
    .group("/cc", (group) =>
        group
            .post("/addCc", async ({headers, body }) => {   
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);            
                const cardsWithUserId = body.cards.map((card) => ({
                    ...card,
                    userId: loggedUser.id,
                }));

                return await ccService.addCc(cardsWithUserId);
            }, {
                detail: {
                    tags: ['cc'],
                    security: [
                        { JwtAuth: [] }
                      ],
                },
                body: t.Object({
                    cards: t.Array(t.Object({
                        nameCard: t.String(),
                        numberCard: t.String(),
                        expireMonth: t.String(),
                        expireYear: t.String(),
                        userId: t.Optional(t.String()) 
                    }))
                })  
            })
            .get("/getCcByUserId/:id", async ({headers, params}) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
               const {id} = params;
                return await ccService.getCcByUserId(id);
            }, {
                detail: {
                    tags: ['cc'],
                    security: [
                        { JwtAuth: [] }
                      ],
                }
            })
            .put("/updateCcStatus", async ({ body }) => {
               
                const { numberCard, status } = body;
                return await ccService.updateCcStatus(numberCard, status);
            }, {
                detail: {
                    tags: ['cc'],
                },
                body: t.Object({
                    numberCard: t.String(),
                    status: t.String()
                })
            })
    );

export default ccPlugin;
