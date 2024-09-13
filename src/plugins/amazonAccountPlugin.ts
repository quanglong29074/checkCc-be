import { Elysia, t } from 'elysia'
import * as amazonAccountService from '../services/amazonAccountService'
import { isAuthenticated } from '../middleware/auth';
import XLSX from 'xlsx';


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
              .post("/uploadExcelAmz", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                
                if (!body.file) {
                    throw new Error('No file uploaded');
                }

                const file = body.file;
                const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet, {
                    header: ['email', 'password'],
                    range: 1 
                });
                
                const accountsWithUserId = data.map((account: any) => ({
                    email: account.email,
                    password: account.password,
                    userId: loggedUser.id,
                }));

                // Xử lý từng tài khoản trong danh sách
                const results = await Promise.all(
                    accountsWithUserId.map(async (account) => {
                        try {
                            return await amazonAccountService.loginAmazon(account.email, account.password, account.userId);
                        } catch (error) {
                            console.error(`Error processing account ${account.email}:`, error);
                            return null;
                        }
                    })
                );

                return { message: 'Accounts processed', results };
            }, {
                detail: {
                    tags: ['amazonAccount'],
                    security: [{ JwtAuth: [] }],
                },
                body: t.Object({
                    file: t.File({
                        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                        maxSize: '5m'
                    })
                })
            })
    )

export default amazonAccountPlugin;