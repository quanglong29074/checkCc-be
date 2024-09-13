import mongoose from 'mongoose';
console.log(process.env.DB_URL);

const connectDb = () => {
    mongoose.connect(process.env.DB_URL ?? "")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));
}
export default connectDb;
