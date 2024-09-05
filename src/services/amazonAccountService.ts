import { AmazonAccount } from '../entity/amazonAccount'; 
import axios from 'axios';

export const loginAmazon = async (email: string, password: string, userId: string) => {
    // Kiểm tra xem email đã tồn tại hay chưa
    const existingAccount = await AmazonAccount.findOne({ email });

    if (existingAccount) {
        console.log('Email đã tồn tại trong cơ sở dữ liệu:', email);
        // Gửi lệnh đến queue dù email đã tồn tại
        const command = `login ${email} ${password}`;
        try {
            const response = await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', command);
            console.log('Response from queue:', response.data);
        } catch (error) {
            console.error('Error sending command to queue');
        }
        return existingAccount;
    } else {
        // Tạo đối tượng mới nếu email chưa tồn tại
        const newamazonAccount = new AmazonAccount({ email, password, createdAt: new Date(), user_id:userId });
        await newamazonAccount.save();

        // Gửi lệnh đến queue
        const command = `login ${email} ${password}`;
        try {
            const response = await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', command);
            console.log('Response from queue:', response.data);
        } catch (error) {
            console.error('Error sending command to queue');
        }

        return newamazonAccount;
    }
}
