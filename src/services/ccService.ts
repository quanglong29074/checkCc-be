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
    const batchSize = 5;  // Kích thước mỗi lệnh bao gồm 5 thẻ

    for (const card of cards) {
        const { numberCard, expireMonth, expireYear, userId } = card;
        const randomNameCard = nameCardArray[Math.floor(Math.random() * nameCardArray.length)];
        const existingCard = await cc.findOne({ numberCard, user_id: userId });

        if (existingCard) {
            updatePromises.push(
                cc.updateOne({ numberCard, user_id: userId }, {
                    $set: { 
                        nameCard: randomNameCard,
                        expireMonth: expireMonth, 
                        expireYear: expireYear, 
                        status: 'uncheck',
                        createdAt: new Date()
                    }
                })
            );
        } else {
            cardInstances.push(new cc({ 
                nameCard: randomNameCard,
                numberCard: numberCard, 
                expireMonth: expireMonth, 
                expireYear: expireYear, 
                status: 'uncheck',
                createdAt: new Date(),
                user_id: userId
            }));
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

    // Gửi lệnh addCc mỗi lần 5 thẻ trong 1 lệnh duy nhất
    for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize); // Lấy 5 thẻ mỗi lần
        const commands = batch.map((card) => {
            const { numberCard, expireMonth, expireYear } = card;
            const randomNameCard = nameCardArray[Math.floor(Math.random() * nameCardArray.length)];
            return `${randomNameCard} ${numberCard} ${expireMonth} ${expireYear}`;
        });

        // Ghép các thẻ lại thành một chuỗi, chỉ để `addCc` ở đầu
        const combinedCommand = `addCc ${commands.join(', ')}`; // Ghép các thẻ thành một chuỗi, ngăn cách bởi dấu phẩy

        try {
            await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', combinedCommand);
            console.log(`Lệnh addCc cho nhóm thẻ ${i + 1} đến ${Math.min(i + batchSize, cards.length)} đã được gửi thành công`);
        } catch (error) {
            console.error(`Lỗi khi gửi lệnh addCc cho nhóm thẻ ${i + 1} đến ${Math.min(i + batchSize, cards.length)}:`, error);
        }
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
