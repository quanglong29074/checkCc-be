import mongoose from 'mongoose';
import { User } from './user';
const proxySchema  = new mongoose.Schema({
    proxy: {
    type: String
  },
 
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  }
});

export const Proxy = mongoose.model('Proxy', proxySchema, 'Proxy');

