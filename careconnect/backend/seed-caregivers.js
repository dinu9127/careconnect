#!/usr/bin/env node

/**
 * Seed Data Initialization Script
 * Run this after updating the Caregiver model to populate test data
 * 
 * Usage: node seed-caregivers.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCaregivers } from './src/seeds/caregiverSeeds.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    await connectDB();
    console.log('Starting caregiver seeding...');
    await seedCaregivers();
    console.log('✓ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

main();
