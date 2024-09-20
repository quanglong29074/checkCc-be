import { Elysia, t } from 'elysia';
import * as ccService from '../services/ccService';
import { isAuthenticated } from '../middleware/auth';
import XLSX from 'xlsx';

const ccPlugin = new Elysia()
    .group("/cc", (group) =>
        group
            .post("/addCc", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                const cardsWithUserId = body.cards.map((card) => ({
                    ...card,
                    userId: loggedUser.id,
                }));

                return await ccService.addCc(cardsWithUserId, loggedUser.id);
            }, {
                detail: {
                    tags: ['cc'],
                    security: [
                        { JwtAuth: [] }
                    ],
                },
                body: t.Object({
                    cards: t.Array(t.Object({
                        numberCard: t.String(),
                        expireMonth: t.String(),
                        expireYear: t.String(),
                        userId: t.Optional(t.String())
                    }))
                })
            })
            .post("/uploadExcel", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                
                if (!body.file) {
                    throw new Error('No file uploaded');
                }

                const file = body.file;
                const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet, {
                    header: ['numberCard', 'expireMonth', 'expireYear'],
                    range: 1 
                });
                
                const cardsWithUserId = data.map((card: any) => ({
                    ...card,
                    userId: loggedUser.id,
                }));

                return await ccService.addCc(cardsWithUserId, loggedUser.id);
            }, {
                detail: {
                    tags: ['cc'],
                    security: [{ JwtAuth: [] }],
                },
                body: t.Object({
                    file: t.File({
                        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                        maxSize: '5m'
                    })
                })
            })

            .get("/getCcByUserId/:id", async ({ headers, params }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                const { id } = params;
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
