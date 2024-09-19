import mongoose from 'mongoose';
import { User } from './user';
const gpmProfileSchema  = new mongoose.Schema({
    browser_id: {
    type: String
  },
 
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  }
});

export const GpmProfile = mongoose.model('gpmProfile', gpmProfileSchema, 'gpmProfile');

