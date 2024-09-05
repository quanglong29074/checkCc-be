import mongoose from 'mongoose';
import { User } from './user';
const ccSchema  = new mongoose.Schema({
  nameCard: {
    type: String
  },
  numberCard: {
    type: String,
  },
  expireMonth: {
    type: String
  },
  expireYear: {
    type: String,
  },
  status: {
    type: String
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

export const cc = mongoose.model('cc', ccSchema, 'cc');

