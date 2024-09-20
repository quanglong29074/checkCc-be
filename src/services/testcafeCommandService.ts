import { TestcafeCommand } from '../entity/testcafeCommand';

export const getTestcafeCommandbyUserId = async (userId:string) => {
    try {
        const testcafeCommandbyUserId = await TestcafeCommand.find({ user_id: userId });
        return testcafeCommandbyUserId;
    } catch (error) {
        console.error('Error fetching credit cards by userId:', error);
        throw error; 
    }
}