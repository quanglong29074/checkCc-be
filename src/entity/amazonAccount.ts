import mongoose from 'mongoose';
import { User } from './user';
const amazonAccountSchema  = new mongoose.Schema({
  email: {
    type: String
  },
  password: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  }
});

export const AmazonAccount = mongoose.model('amazonAccount', amazonAccountSchema, 'amazonAccount');

