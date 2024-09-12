import { cc } from '../entity/cc'; 
import axios from 'axios';

export const addCc = async (cards: Array<{ nameCard: string, numberCard: string, expireMonth: string, expireYear: string, userId: string }>) => {
    const cardInstances = [];
    const cardCommands = new Map(); 
    const updatePromises = [];

    for (const card of cards) {
        const { numberCard, userId } = card;
        const existingCard = await cc.findOne({ numberCard, user_id: userId });

        if (existingCard) {
            updatePromises.push(
                cc.updateOne({ numberCard, user_id: userId }, {
                    $set: { 
                        nameCard: card.nameCard, 
                        expireMonth: card.expireMonth, 
                        expireYear: card.expireYear, 
                        status: 'uncheck',
                        createdAt: new Date()
                    }
                })
            );
        } else {
            cardInstances.push(new cc({ 
                nameCard: card.nameCard, 
                numberCard: card.numberCard, 
                expireMonth: card.expireMonth, 
                expireYear: card.expireYear, 
                status: 'uncheck',
                createdAt: new Date(),
                user_id: card.userId
            }));
        }

        if (!cardCommands.has(numberCard)) {
            cardCommands.set(numberCard, `${card.nameCard} ${card.numberCard} ${card.expireMonth} ${card.expireYear}`);
        }
    }

    if (cardInstances.length > 0) {
        await cc.insertMany(cardInstances);
    }

    if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
    }

    const uniqueCommands = Array.from(cardCommands.values());
    if (uniqueCommands.length > 0) {
        const command = "addCc " + uniqueCommands.join(', ');

        try {
            const response = await axios.post('https://httpsns.appspot.com/queue?name=check-aws-cc', command);
            console.log('Response from queue:', response.data);
        } catch (error) {
            console.error('Error sending command to queue:', error);
        }
    }

    return cardInstances;
}

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
