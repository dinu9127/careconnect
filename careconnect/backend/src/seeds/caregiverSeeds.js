import mongoose from 'mongoose';
import Caregiver from '../models/Caregiver.js';
import User from '../models/User.js';

const caregiverSeeds = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@careconnect.lk',
    phone: '+94 71 234 5678',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Elderly Care',
    experience: 8,
    location: 'Colombo',
    serviceTypes: ['Elderly Care', 'Hospital Companion Care'],
    hourlyRate: 1500,
    bio: 'Experienced caregiver with 8 years of expertise in elderly care and hospital companionship.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '18:00' },
      { day: 'Friday', startTime: '08:00', endTime: '18:00' }
    ],
    rating: 4.8,
    reviewCount: 127
  },
  {
    name: 'Priya Jayawardana',
    email: 'priya.jay@careconnect.lk',
    phone: '+94 72 345 6789',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Childcare',
    experience: 6,
    location: 'Kandy',
    serviceTypes: ['Childcare', 'Disability Support'],
    hourlyRate: 1200,
    bio: 'Dedicated childcare professional with 6 years of experience in early childhood development.',
    availability: [
      { day: 'Monday', startTime: '07:00', endTime: '19:00' },
      { day: 'Tuesday', startTime: '07:00', endTime: '19:00' },
      { day: 'Wednesday', startTime: '07:00', endTime: '19:00' },
      { day: 'Thursday', startTime: '07:00', endTime: '19:00' },
      { day: 'Friday', startTime: '07:00', endTime: '19:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '17:00' }
    ],
    rating: 4.9,
    reviewCount: 143
  },
  {
    name: 'Kumari Perera',
    email: 'kumari.p@careconnect.lk',
    phone: '+94 73 456 7890',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Hospital Companion Care',
    experience: 10,
    location: 'Galle',
    serviceTypes: ['Hospital Companion Care', 'Elderly Care'],
    hourlyRate: 1800,
    bio: 'Senior caregiver with 10 years of hospital and medical care experience.',
    availability: [
      { day: 'Monday', startTime: '06:00', endTime: '20:00' },
      { day: 'Tuesday', startTime: '06:00', endTime: '20:00' },
      { day: 'Wednesday', startTime: '06:00', endTime: '20:00' },
      { day: 'Thursday', startTime: '06:00', endTime: '20:00' },
      { day: 'Friday', startTime: '06:00', endTime: '20:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '18:00' },
      { day: 'Sunday', startTime: '10:00', endTime: '18:00' }
    ],
    rating: 5.0,
    reviewCount: 98
  },
  {
    name: 'Nimal De Silva',
    email: 'nimal.ds@careconnect.lk',
    phone: '+94 74 567 8901',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Disability Support',
    experience: 7,
    location: 'Negombo',
    serviceTypes: ['Disability Support', 'Childcare'],
    hourlyRate: 1350,
    bio: 'Compassionate caregiver specializing in disability support and inclusive care.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '17:00' },
      { day: 'Friday', startTime: '08:00', endTime: '17:00' }
    ],
    rating: 4.6,
    reviewCount: 156
  },
  {
    name: 'Anura Wijesuriya',
    email: 'anura.w@careconnect.lk',
    phone: '+94 75 678 9012',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Elderly Care',
    experience: 9,
    location: 'Colombo',
    serviceTypes: ['Elderly Care', 'Hospital Companion Care', 'Disability Support'],
    hourlyRate: 1600,
    bio: 'Multi-skilled caregiver with expertise in elderly care and medical support.',
    availability: [
      { day: 'Monday', startTime: '07:00', endTime: '19:00' },
      { day: 'Tuesday', startTime: '07:00', endTime: '19:00' },
      { day: 'Wednesday', startTime: '07:00', endTime: '19:00' },
      { day: 'Thursday', startTime: '07:00', endTime: '19:00' },
      { day: 'Friday', startTime: '07:00', endTime: '19:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '17:00' }
    ],
    rating: 4.9,
    reviewCount: 189
  },
  {
    name: 'Lakshmi Fernando',
    email: 'lakshmi.f@careconnect.lk',
    phone: '+94 76 789 0123',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Childcare',
    experience: 5,
    location: 'Jaffna',
    serviceTypes: ['Childcare', 'Disability Support'],
    hourlyRate: 1100,
    bio: 'Passionate childcare specialist with training in special needs support.',
    availability: [
      { day: 'Monday', startTime: '07:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '07:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '07:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '07:00', endTime: '18:00' },
      { day: 'Friday', startTime: '07:00', endTime: '18:00' }
    ],
    rating: 4.7,
    reviewCount: 134
  },
  {
    name: 'Sanjay Menon',
    email: 'sanjay.m@careconnect.lk',
    phone: '+94 77 890 1234',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Hospital Companion Care',
    experience: 8,
    location: 'Kandy',
    serviceTypes: ['Hospital Companion Care', 'Elderly Care'],
    hourlyRate: 1700,
    bio: 'Experienced medical care companion with strong patient communication skills.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '20:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '20:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '20:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '20:00' },
      { day: 'Friday', startTime: '08:00', endTime: '20:00' }
    ],
    rating: 4.8,
    reviewCount: 112
  },
  {
    name: 'Chaminda Jayasinghe',
    email: 'chaminda.j@careconnect.lk',
    phone: '+94 78 901 2345',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Disability Support',
    experience: 6,
    location: 'Badulla',
    serviceTypes: ['Disability Support', 'Elderly Care'],
    hourlyRate: 1400,
    bio: 'Trained disability support specialist with patient-centered approach.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '18:00' },
      { day: 'Friday', startTime: '08:00', endTime: '18:00' }
    ],
    rating: 4.5,
    reviewCount: 89
  },
  {
    name: 'Malini Bandara',
    email: 'malini.b@careconnect.lk',
    phone: '+94 79 012 3456',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Childcare',
    experience: 4,
    location: 'Matara',
    serviceTypes: ['Childcare'],
    hourlyRate: 1000,
    bio: 'Certified childcare provider with focus on early childhood education.',
    availability: [
      { day: 'Monday', startTime: '07:30', endTime: '17:30' },
      { day: 'Tuesday', startTime: '07:30', endTime: '17:30' },
      { day: 'Wednesday', startTime: '07:30', endTime: '17:30' },
      { day: 'Thursday', startTime: '07:30', endTime: '17:30' },
      { day: 'Friday', startTime: '07:30', endTime: '17:30' },
      { day: 'Saturday', startTime: '09:00', endTime: '15:00' }
    ],
    rating: 4.6,
    reviewCount: 76
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.s@careconnect.lk',
    phone: '+94 70 123 4567',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Elderly Care',
    experience: 7,
    location: 'Galle',
    serviceTypes: ['Elderly Care'],
    hourlyRate: 1450,
    bio: 'Dedicated elderly care specialist with geriatric training.',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '18:00' },
      { day: 'Friday', startTime: '08:00', endTime: '18:00' }
    ],
    rating: 4.7,
    reviewCount: 145
  }
];

export const seedCaregivers = async () => {
  try {
    // Clear existing caregivers and their users
    await Caregiver.deleteMany({});
    await User.deleteMany({ role: 'caregiver' });
    
    console.log('Creating caregivers...');
    
    for (const caregiverData of caregiverSeeds) {
      // Create user
      const user = new User({
        name: caregiverData.name,
        email: caregiverData.email,
        phone: caregiverData.phone,
        password: caregiverData.password,
        role: caregiverData.role
      });
      
      await user.save();
      console.log(`Created user: ${user.email}`);
      
      // Create caregiver profile
      const caregiver = new Caregiver({
        user: user._id,
        specialization: caregiverData.specialization,
        experience: caregiverData.experience,
        location: caregiverData.location,
        serviceTypes: caregiverData.serviceTypes,
        hourlyRate: caregiverData.hourlyRate,
        bio: caregiverData.bio,
        availability: caregiverData.availability,
        rating: caregiverData.rating,
        reviewCount: caregiverData.reviewCount
      });
      
      await caregiver.save();
    }
    
    console.log('Caregiver seeds created successfully!');
  } catch (error) {
    console.error('Error seeding caregivers:', error);
  }
};
