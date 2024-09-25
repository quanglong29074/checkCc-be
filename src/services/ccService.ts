import { cc } from '../entity/cc'; 
import axios from 'axios';
import mongoose from 'mongoose';
import { GpmProfile } from '../entity/gpmProfile'; // Nhập mô hình GpmProfile
import { TestcafeCommand } from '../entity/testcafeCommand';
import fs from 'fs';
const nameCardArray = [
    'John', 'Emily', 'Michael', 'Sarah', 'David',
    'Sophia', 'James', 'Emma', 'Daniel', 'Olivia',
    'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas',
    'Mia', 'Henry', 'Amelia', 'Alexander', 'Charlotte'
];

interface Card {
    numberCard: string;
    expireMonth: string;
    expireYear: string;
    userId: string;
}

export const addCc = async (cards: Card[], userId: string) => {
    const cardInstances = [];
    const updatePromises = [];
    const processedCards = new Set<string>(); 
    const batchSize = 5; 
    
    // Kiểm tra và phân loại thẻ
    for (const card of cards) {
        const { numberCard, expireMonth, expireYear, userId } = card;
        const cardKey = `${numberCard}-${userId}`; 

        if (processedCards.has(cardKey)) {
            continue; 
        }

        processedCards.add(cardKey); 
        const randomNameCard = nameCardArray[Math.floor(Math.random() * nameCardArray.length)];
        const existingCard = await cc.findOne({ numberCard, user_id: userId });

        if (existingCard) {
            updatePromises.push(
                cc.updateOne({ numberCard, user_id: userId }, {
                    $set: { 
                        nameCard: randomNameCard,
                        expireMonth, 
                        expireYear, 
                        status: 'uncheck',
                        createdAt: new Date()
                    }
                })
            );
        } else {
            cardInstances.push(new cc({ 
                nameCard: randomNameCard,
                numberCard, 
                expireMonth, 
                expireYear, 
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

    try {
        await TestcafeCommand.deleteMany({});
        console.log('Đã xóa tất cả các bản ghi cũ trong TestcafeCommand.');
    } catch (error) {
        console.error('Lỗi khi xóa các bản ghi cũ trong TestcafeCommand:', error);
    }


    // Tạo các lệnh cho addCc
    const allUniqueCommands = Array.from(processedCards).map((cardKey) => {
        const [numberCard, userId] = cardKey.split('-');
        const card = cards.find(c => c.numberCard === numberCard && c.userId === userId);

        if (!card) {
            console.error(`Thẻ với numberCard: ${numberCard} và userId: ${userId} không được tìm thấy`);
            return null;
        }

        const { expireMonth, expireYear } = card;
        const randomNameCard = nameCardArray[Math.floor(Math.random() * nameCardArray.length)];
        return `${randomNameCard} ${numberCard} ${expireMonth} ${expireYear}`;
    }).filter(command => command !== null);

    // Lấy các browser ID
    const profiles = await GpmProfile.find({});
    const browserIds = profiles.map(profile => profile.browser_id);
    let browserIndex = 0;

    // Tạo lệnh TestCafe
    for (let i = 0; i < allUniqueCommands.length; i += batchSize) {
        const batch = allUniqueCommands.slice(i, i + batchSize);
        const combinedCommand = `addCc ${batch.join(', ')}`; 

        const browserId = browserIds[browserIndex];

        try {
            await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', combinedCommand);
            console.log(`Lệnh addCc cho nhóm thẻ ${i + 1} đến ${Math.min(i + batchSize, allUniqueCommands.length)} đã được gửi thành công`);

            const testCafeCommand = `testcafe "chrome:E:\\GpmLoin\\gpm_browser\\gpm_browser_chromium_core_127\\chrome.exe" --browser-id "${browserId}" .\\main.js`;
            console.log(`Lệnh TestCafe đã tạo: ${testCafeCommand}\n`);
            
            const newTestcafeCommand = new TestcafeCommand({testcafe_Command: testCafeCommand, user_id: userId});
            await newTestcafeCommand.save();
            browserIndex++;
        } catch (error) {
            console.error(`Lỗi khi gửi lệnh addCc cho nhóm thẻ ${i + 1} đến ${Math.min(i + batchSize, allUniqueCommands.length)}:`, error);
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
