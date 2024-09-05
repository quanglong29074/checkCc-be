import mongoose from 'mongoose';
import { User } from './user';
const addressSchema = new mongoose.Schema({
  full_name: {
    type: String
  },
  phone: {
    type: String,
  },
  address: {
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

export const Address = mongoose.model('Address', addressSchema);

