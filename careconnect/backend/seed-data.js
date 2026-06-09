#!/usr/bin/env node

/**
 * Seed Data Initialization Script
 * Run this to populate test data including admin users and caregivers
 * 
 * Usage: node seed-data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedAdminUser } from './src/seeds/adminSeeds.js';
import { seedCaregivers } from './src/seeds/caregiverSeeds.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect');
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting data seeding...\n');
    
    console.log('Seeding admin user...');
    await seedAdminUser();
    
    console.log('\nSeeding caregivers...');
    await seedCaregivers();
    
    console.log('\n✓ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

main();
