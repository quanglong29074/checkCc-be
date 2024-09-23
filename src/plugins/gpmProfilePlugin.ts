import { Elysia, t } from 'elysia'
import * as gpmProfile from '../services/gpmProfile'
import { isAuthenticated } from '../middleware/auth';
import XLSX from 'xlsx';

const gpmProfilePlugin = new Elysia()
    .group("/gpmProfile", (group) =>
        group
            .post("/addBrowserIds", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                const { browser_ids } = body;

                // Thêm nhiều browser_id cho user
                const results = await gpmProfile.addBrowserIds(browser_ids, loggedUser.id);

                return { message: 'Browser IDs added', results };
            }, {
                detail: {
                    tags: ['GPM Profile'],
                    security: [
                        { JwtAuth: [] }
                    ],
                },
                body: t.Object({
                    browser_ids: t.Array(t.String()), // Nhận danh sách browser_id
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
                    header: ['browserId'], // Đọc dữ liệu từ file Excel
                    range: 1 
                });
                
                const browserIds = data.map((gpm_Profile: any) => gpm_Profile.browserId); // Tạo danh sách browserId từ Excel
            
                // Gọi hàm thêm nhiều browserId vào DB
                const results = await gpmProfile.addBrowserIds(browserIds, loggedUser.id);
            
                return { message: 'Browser IDs from Excel processed', results };
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
            .post("/addProxy", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                const { Proxys } = body;

                // Thêm nhiều browser_id cho user
                const results = await gpmProfile.addProxy(Proxys, loggedUser.id);

                return { message: 'Browser IDs added', results };
            }, {
                detail: {
                    tags: ['GPM Profile'],
                    security: [
                        { JwtAuth: [] }
                    ],
                },
                body: t.Object({
                    Proxys: t.Array(t.String()), // Nhận danh sách browser_id
                })
            })

            .post("/uploadExcelProxy", async ({ headers, body }) => {
                const token = headers.authorization;
                const loggedUser = isAuthenticated(token);
                
                if (!body.file) {
                    throw new Error('No file uploaded');
                }
            
                const file = body.file;
                const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet, {
                    header: ['proxy'], // Đọc dữ liệu từ file Excel
                    range: 1 
                });
                
                const Proxys = data.map((proxy: any) => proxy.proxy); // Tạo danh sách browserId từ Excel
            
                // Gọi hàm thêm nhiều browserId vào DB
                const results = await gpmProfile.addProxy(Proxys, loggedUser.id);
            
                return { message: 'Browser IDs from Excel processed', results };
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