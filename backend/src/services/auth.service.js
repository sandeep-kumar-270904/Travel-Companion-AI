import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (data) => {
  const { name, email, password } = data;

  const userExists = await User.findOne({ email });

  if (userExists) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    };
  } else {
    const error = new Error('Invalid user data');
    error.statusCode = 400;
    throw error;
  }
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    };
  } else {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
};
