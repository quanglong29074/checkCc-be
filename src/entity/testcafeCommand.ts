import mongoose from 'mongoose';
import { User } from './user';
const testcafeCommandSchema  = new mongoose.Schema({
    testcafe_Command: {
    type: String
  },
  
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  }
});

export const TestcafeCommand = mongoose.model('testcafeCommand', testcafeCommandSchema, 'testcafeCommand');

