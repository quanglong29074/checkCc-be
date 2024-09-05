import mongoose from 'mongoose';
const connectDb = () => {
    mongoose.connect('mongodb://localhost:27017/checkCc')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));
} 
export default connectDb;