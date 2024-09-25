import { TestcafeCommand } from '../entity/testcafeCommand';

export const getTestcafeCommandbyUserId = async () => {
    try {
        const testcafeCommandbyUserId = await TestcafeCommand.find();
        return testcafeCommandbyUserId;
    } catch (error) {
        console.error('Error fetching credit cards by userId:', error);
        throw error; 
    }
}