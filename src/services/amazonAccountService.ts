import { AmazonAccount } from '../entity/amazonAccount'; 
import axios from 'axios';

export const loginAmazon = async (email: string, password: string, secret:string, userId: string) => {
    // Kiểm tra xem email đã tồn tại hay chưa
    const existingAccount = await AmazonAccount.findOne({ email, user_id: userId});
    const userAccounts = await AmazonAccount.find({ user_id: userId });
    const allAccountsNotAvailable = userAccounts.every(account => account.statusQueue === 'Not available');

    if (existingAccount) {
        console.log('Email đã tồn tại trong cơ sở dữ liệu:', email);
        if (allAccountsNotAvailable) {

        const command = `login ${email} ${password} ${secret}`;
        console.log(command);
        
        try {
            const response = await axios.post('https://httpsns.appspot.com/queue?name=add-amz-acc', command);
            console.log('Response from queue:', response.data);
            await updateStatusQueue(email, 'available'); 

        } catch (error) {
            console.error('Error sending command to queue');
        }
    }
        return existingAccount;
    } else {
        // Tạo đối tượng mới nếu email chưa tồn tại
        const newamazonAccount = new AmazonAccount({ email, password, statusQueue:'Not available', createdAt: new Date(), user_id:userId });
        await newamazonAccount.save();
        if (allAccountsNotAvailable) {

        // Gửi lệnh đến queue
        const command = `login ${email} ${password} ${secret}`;
        console.log(command);
        
        try {
            const response = await axios.post('https://httpsns.appspot.com/queue?name=add-amz-acc', command);
            console.log('Response from queue:', response.data);
            await updateStatusQueue(email, 'available'); 

        } catch (error) {
            console.error('Error sending command to queue');
        }
    }

        return newamazonAccount;
    }
}

export const updateStatusQueue = async (email: string, statusQueue: string) => {
    try {
        // Tìm tài khoản theo email
        const account = await AmazonAccount.findOne({ email });

        if (!account) {
            throw new Error('Account not found');
        }

        // Cập nhật trường statusQueue
        account.statusQueue = statusQueue;
        await account.save();

        return account;
    } catch (error) {
        console.error('Error updating statusQueue:', error);
        throw error;
    }
};