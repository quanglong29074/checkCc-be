import { cc } from '../entity/cc'; 
import axios from 'axios';

const nameCardArray = [
    'John', 
    'Emily', 
    'Michael', 
    'Sarah', 
    'David', 
    'Sophia', 
    'James', 
    'Emma', 
    'Daniel', 
    'Olivia', 
    'William', 
    'Ava', 
    'Benjamin', 
    'Isabella', 
    'Lucas', 
    'Mia', 
    'Henry', 
    'Amelia', 
    'Alexander', 
    'Charlotte'
];

export const addCc = async (cards: Array<{ numberCard: string, expireMonth: string, expireYear: string, userId: string }>) => {
    const cardInstances = [];
    const updatePromises = [];

    for (const card of cards) {
        const { numberCard, expireMonth, expireYear, userId } = card;

        // Lấy ngẫu nhiên một nameCard từ mảng
        const randomNameCard = nameCardArray[Math.floor(Math.random() * nameCardArray.length)];

        const existingCard = await cc.findOne({ numberCard, user_id: userId });

        if (existingCard) {
            // Cập nhật thẻ nếu đã tồn tại
            updatePromises.push(
                cc.updateOne({ numberCard, user_id: userId }, {
                    $set: { 
                        nameCard: randomNameCard, // Sử dụng nameCard ngẫu nhiên
                        expireMonth: expireMonth, 
                        expireYear: expireYear, 
                        status: 'uncheck',
                        createdAt: new Date()
                    }
                })
            );
        } else {
            // Tạo mới thẻ nếu chưa tồn tại
            cardInstances.push(new cc({ 
                nameCard: randomNameCard, // Sử dụng nameCard ngẫu nhiên
                numberCard: numberCard, 
                expireMonth: expireMonth, 
                expireYear: expireYear, 
                status: 'uncheck',
                createdAt: new Date(),
                user_id: userId
            }));
        }

        // Gửi lệnh addCc cho từng thẻ
        const command = `addCc ${randomNameCard} ${numberCard} ${expireMonth} ${expireYear}`;
        
        try {
            await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', command);
            console.log(`Lệnh addCc cho thẻ ${numberCard} đã được gửi thành công`);
        } catch (error) {
            console.error(`Lỗi khi gửi lệnh addCc cho thẻ ${numberCard}:`, error);
        }
    }

    // Chèn thẻ mới vào cơ sở dữ liệu nếu có
    if (cardInstances.length > 0) {
        await cc.insertMany(cardInstances);
    }

    // Cập nhật các thẻ đã tồn tại nếu có
    if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
    }

    return cardInstances;
};



export const updateCcStatus = async (numberCard: string, status: string) => {
    try {
        const result = await cc.updateMany(
            { numberCard: numberCard }, // Điều kiện tìm kiếm
            { $set: { status: status } } // Cập nhật trạng thái
        );

        if (result.matchedCount === 0) {
            throw new Error(`No cards found with number: ${numberCard}`);
        }

        return result; // Trả về kết quả cập nhật
    } catch (error) {
        console.error('Error updating credit card status:', error);
        throw error;
    }
}

export const getCcByUserId = async (userId: string) => {
    try {
        const cards = await cc.find({ user_id: userId });
        return cards;
    } catch (error) {
        console.error('Error fetching credit cards by userId:', error);
        throw error; 
    }
}
