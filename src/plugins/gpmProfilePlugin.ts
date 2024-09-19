import { Elysia, t } from 'elysia'
import * as gpmProfile from '../services/gpmProfile'
import { isAuthenticated } from '../middleware/auth';
import XLSX from 'xlsx';

const gpmProfilePlugin = new Elysia()
    .group("/gpmProfile", (group) =>
        group
            .post("/addBrowserId", async ({headers, body }) => {     
              const token = headers.authorization;
                const loggedUser = isAuthenticated(token);          
                const {browser_id } = body;
                return await gpmProfile.addBrowserId(browser_id,loggedUser.id);
              }, {
                detail: {
                  tags: ['GPM Profile'],
                  security: [
                    { JwtAuth: [] }
                  ],
                },
                body: t.Object({
                  browser_id: t.String(),
                
                })  
                
              })
              .post("/uploadExcelBrowserId", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                
                if (!body.file) {
                    throw new Error('No file uploaded');
                }

                const file = body.file;
                const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet, {
                    header: ['browserId'],
                    range: 1 
                });
                
                const browserIdWithUserId = data.map((gpm_Profile: any) => ({
                    browserId: gpm_Profile.browserId,
                    userId: loggedUser.id,
                }));

                // Xử lý từng tài khoản trong danh sách
                const results = await Promise.all(
                    browserIdWithUserId.map(async (gpm_Profile) => {
                        try {
                            return await gpmProfile.addBrowserId(gpm_Profile.browserId, gpm_Profile.userId);
                        } catch (error) {
                            console.error(`Error processing account ${gpm_Profile.browserId}:`, error);
                            return null;
                        }
                    })
                );

                return { message: 'Accounts processed', results };
            }, {
                detail: {
                    tags: ['GPM Profile'],
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

export default gpmProfilePlugin;