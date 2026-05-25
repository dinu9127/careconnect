#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import User from './src/models/User.js';

dotenv.config();

const rl = readline.createInterface({ input, output });

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect');
};

const main = async () => {
  try {
    const emailInput = (await rl.question('Admin email (default admin@careconnect.lk): ')).trim();
    const newPassword = (await rl.question('New password: ')).trim();

    if (!newPassword) {
      console.error('Password is required.');
      process.exit(1);
    }

    await connectDB();

    const query = emailInput ? { email: emailInput } : { role: 'admin' };
    const adminUser = await User.findOne(query).select('+password');

    if (!adminUser) {
      console.error('Admin user not found.');
      process.exit(1);
    }

    adminUser.password = newPassword;
    await adminUser.save();

    console.log('Admin password updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update admin password:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
};

main();
