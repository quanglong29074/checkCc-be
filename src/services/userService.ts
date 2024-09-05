import bcrypt from 'bcrypt';
import { User } from '../entity/user';
import jwt from 'jsonwebtoken';

export const login = async ({ email, password }: { email: string, password: string }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid Password");
  }

  const token = jwt.sign({ id: user._id, username: user.email }, 'your_jwt_secret', { expiresIn: '4h' });
  return { token };
};

