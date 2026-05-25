import User from '../models/User.js';

export const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@careconnect.lk',
      password: 'admin123456',
      role: 'admin',
      phone: '+94 71 000 0000'
    });

    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: admin123456`);
    console.log(`  Note: Please change this password in production!`);
  } catch (error) {
    if (error.code === 11000) {
      console.log('✓ Admin email already exists');
    } else {
      throw error;
    }
  }
};
