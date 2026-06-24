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
    geoLocation: { type: 'Point', coordinates: [79.8612, 6.9271] },
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
    reviewCount: 127,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [80.6366, 7.2906] },
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
    reviewCount: 143,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [80.2170, 6.0328] },
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
    reviewCount: 98,
    verificationStatus: 'verified'
  },
  {
    name: 'Nimal De Silva',
    email: 'nimal.ds@careconnect.lk',
    phone: '+94 74 567 8901',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Disability Support',
    experience: 7,
    location: 'Gampaha',
    geoLocation: { type: 'Point', coordinates: [79.8358, 7.2008] },
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
    reviewCount: 156,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [79.8800, 6.9000] },
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
    reviewCount: 189,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [80.0088, 9.6615] },
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
    reviewCount: 134,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [80.6500, 7.3000] },
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
    reviewCount: 112,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [81.0550, 6.9847] },
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
    reviewCount: 89,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [80.5483, 5.9549] },
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
    reviewCount: 76,
    verificationStatus: 'verified'
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
    geoLocation: { type: 'Point', coordinates: [80.2000, 6.0500] },
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
    reviewCount: 145,
    verificationStatus: 'verified'
  },
  {
    name: 'Saman Kumara',
    email: 'saman.k@careconnect.lk',
    phone: '+94 71 111 2222',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Elderly Care',
    experience: 12,
    location: 'Colombo',
    geoLocation: { type: 'Point', coordinates: [79.8650, 6.9300] },
    serviceTypes: ['Elderly Care'],
    hourlyRate: 1600,
    bio: 'Highly experienced professional specializing in advanced elderly care.',
    availability: [{ day: 'Monday', startTime: '08:00', endTime: '16:00' }],
    rating: 4.9,
    reviewCount: 210,
    verificationStatus: 'verified'
  },
  {
    name: 'Kasun Rathnayake',
    email: 'kasun.r@careconnect.lk',
    phone: '+94 72 222 3333',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Disability Support',
    experience: 5,
    location: 'Kandy',
    geoLocation: { type: 'Point', coordinates: [80.6400, 7.2950] },
    serviceTypes: ['Disability Support', 'Hospital Companion Care'],
    hourlyRate: 1300,
    bio: 'Empathetic support worker with strong skills in physical therapy assistance.',
    availability: [{ day: 'Tuesday', startTime: '09:00', endTime: '17:00' }],
    rating: 4.7,
    reviewCount: 85,
    verificationStatus: 'verified'
  },
  {
    name: 'Dilini Fernando',
    email: 'dilini.f@careconnect.lk',
    phone: '+94 73 333 4444',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Childcare',
    experience: 8,
    location: 'Gampaha',
    geoLocation: { type: 'Point', coordinates: [79.9941, 7.0873] },
    serviceTypes: ['Childcare'],
    hourlyRate: 1400,
    bio: 'Loving and attentive childcare provider with a background in early education.',
    availability: [{ day: 'Wednesday', startTime: '07:00', endTime: '18:00' }],
    rating: 4.8,
    reviewCount: 150,
    verificationStatus: 'verified'
  },
  {
    name: 'Ruwan Senanayake',
    email: 'ruwan.s@careconnect.lk',
    phone: '+94 74 444 5555',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Hospital Companion Care',
    experience: 15,
    location: 'Kurunegala',
    geoLocation: { type: 'Point', coordinates: [80.3647, 7.4818] },
    serviceTypes: ['Hospital Companion Care', 'Elderly Care'],
    hourlyRate: 1800,
    bio: 'Former nurse transitioning to personalized hospital companion care.',
    availability: [{ day: 'Thursday', startTime: '06:00', endTime: '14:00' }],
    rating: 5.0,
    reviewCount: 320,
    verificationStatus: 'verified'
  },
  {
    name: 'Ayesha Perera',
    email: 'ayesha.p@careconnect.lk',
    phone: '+94 75 555 6666',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Elderly Care',
    experience: 6,
    location: 'Kalutara',
    geoLocation: { type: 'Point', coordinates: [79.9599, 6.5854] },
    serviceTypes: ['Elderly Care', 'Childcare'],
    hourlyRate: 1250,
    bio: 'Dedicated caregiver focusing on creating a safe and comfortable environment.',
    availability: [{ day: 'Friday', startTime: '08:00', endTime: '17:00' }],
    rating: 4.6,
    reviewCount: 92,
    verificationStatus: 'verified'
  },
  {
    name: 'Chamari Silva',
    email: 'chamari.s@careconnect.lk',
    phone: '+94 76 666 7777',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Disability Support',
    experience: 10,
    location: 'Galle',
    geoLocation: { type: 'Point', coordinates: [80.2250, 6.0400] },
    serviceTypes: ['Disability Support'],
    hourlyRate: 1550,
    bio: 'Specialist in supporting adults with developmental disabilities.',
    availability: [{ day: 'Saturday', startTime: '09:00', endTime: '15:00' }],
    rating: 4.9,
    reviewCount: 175,
    verificationStatus: 'verified'
  },
  {
    name: 'Nuwan Dissanayake',
    email: 'nuwan.d@careconnect.lk',
    phone: '+94 77 777 8888',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Hospital Companion Care',
    experience: 4,
    location: 'Matara',
    geoLocation: { type: 'Point', coordinates: [80.5500, 5.9600] },
    serviceTypes: ['Hospital Companion Care'],
    hourlyRate: 1100,
    bio: 'Friendly and supportive companion for hospital visits and post-op care.',
    availability: [{ day: 'Sunday', startTime: '08:00', endTime: '16:00' }],
    rating: 4.5,
    reviewCount: 45,
    verificationStatus: 'verified'
  },
  {
    name: 'Tharushi Weerasinghe',
    email: 'tharushi.w@careconnect.lk',
    phone: '+94 78 888 9999',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Childcare',
    experience: 7,
    location: 'Kegalle',
    geoLocation: { type: 'Point', coordinates: [80.3462, 7.2513] },
    serviceTypes: ['Childcare', 'Disability Support'],
    hourlyRate: 1350,
    bio: 'Energetic caregiver who loves engaging children in educational activities.',
    availability: [{ day: 'Monday', startTime: '07:30', endTime: '17:30' }],
    rating: 4.8,
    reviewCount: 112,
    verificationStatus: 'verified'
  },
  {
    name: 'Lasith Malinga (Mock)',
    email: 'lasith.m@careconnect.lk',
    phone: '+94 79 999 0000',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Elderly Care',
    experience: 9,
    location: 'Colombo',
    geoLocation: { type: 'Point', coordinates: [79.8700, 6.9400] },
    serviceTypes: ['Elderly Care', 'Hospital Companion Care'],
    hourlyRate: 1700,
    bio: 'Reliable and strong caregiver, excellent at mobility assistance.',
    availability: [{ day: 'Tuesday', startTime: '08:00', endTime: '18:00' }],
    rating: 4.7,
    reviewCount: 198,
    verificationStatus: 'verified'
  },
  {
    name: 'Nayana Kumari',
    email: 'nayana.k@careconnect.lk',
    phone: '+94 70 000 1111',
    password: 'password123',
    role: 'caregiver',
    specialization: 'Disability Support',
    experience: 11,
    location: 'Nuwara Eliya',
    geoLocation: { type: 'Point', coordinates: [80.7829, 6.9497] },
    serviceTypes: ['Disability Support', 'Elderly Care'],
    hourlyRate: 1650,
    bio: 'Compassionate caregiver with specialized training in dementia care.',
    availability: [{ day: 'Wednesday', startTime: '09:00', endTime: '17:00' }],
    rating: 4.9,
    reviewCount: 245,
    verificationStatus: 'verified'
  }
];

export const seedCaregivers = async () => {
  try {
    console.log('Adding mock caregivers (without deleting your existing ones)...');
    
    for (const caregiverData of caregiverSeeds) {
      // Check if user already exists to prevent duplicate key errors and keep your manual data safe
      const existingUser = await User.findOne({ email: caregiverData.email });
      if (existingUser) {
        console.log(`Skipping ${caregiverData.email} - already exists`);
        continue;
      }

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
        geoLocation: caregiverData.geoLocation,
        serviceTypes: caregiverData.serviceTypes,
        hourlyRate: caregiverData.hourlyRate,
        bio: caregiverData.bio,
        availability: caregiverData.availability,
        rating: caregiverData.rating,
        reviewCount: caregiverData.reviewCount,
        verificationStatus: caregiverData.verificationStatus || 'pending'
      });
      
      await caregiver.save();
    }
    
    console.log('Caregiver seeds created successfully!');
  } catch (error) {
    console.error('Error seeding caregivers:', error);
  }
};
