const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Listing = require('./models/Listing');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-marketplace';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (optional, but good for fresh start)
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing users and listings.');

    // 1. Create a sample user (seller)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      password: hashedPassword,
      university: 'State University',
      major: 'Computer Science',
      graduationYear: 2027,
      isVerified: true
    });
    console.log('Sample user created:', user.email);

    // 2. Create sample listings
    const listings = [
      {
        title: 'Introduction to Algorithms, 3rd Edition',
        description: 'Excellent condition textbook, required for CS101. No highlights or marks.',
        price: 45,
        category: 'textbooks',
        condition: 'like-new',
        images: [{ 
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', 
            public_id: 'sample_id_1' 
        }],
        seller: user._id,
        location: {
          campus: 'Main Campus',
          building: 'Science Hall',
          meetingPreference: 'library'
        },
        academic: {
          courseCode: 'CS101',
          courseName: 'Algorithms'
        },
        status: 'active'
      },
      {
        title: 'Ergonomic Desk Chair',
        description: 'Adjustable mesh office chair, used for only one semester. Very comfortable.',
        price: 80,
        category: 'furniture',
        condition: 'good',
        images: [{ 
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', 
            public_id: 'sample_id_2' 
        }],
        seller: user._id,
        location: {
          campus: 'North Campus',
          building: 'Dorm Block A',
          meetingPreference: 'dorm'
        },
        status: 'active'
      },
      {
        title: 'Sony Noise Canceling Headphones',
        description: 'WH-1000XM4. Like new, includes all original accessories and case.',
        price: 150,
        category: 'electronics',
        condition: 'like-new',
        images: [{ 
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', 
            public_id: 'sample_id_3' 
        }],
        seller: user._id,
        location: {
          campus: 'Main Campus',
          building: 'Student Union',
          meetingPreference: 'flexible'
        },
        status: 'active'
      },
      {
        title: 'Wilson Basketball',
        description: 'Official size basketball, great grip. Barely used.',
        price: 20,
        category: 'sports-equipment',
        condition: 'good',
        images: [{ 
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', 
            public_id: 'sample_id_4' 
        }],
        seller: user._id,
        location: {
          campus: 'Main Campus',
          building: 'The Gym',
          meetingPreference: 'campus-only'
        },
        status: 'active'
      },
      {
        title: 'Organic Chemistry Lab Coat',
        description: 'White lab coat, size Medium. Required for Organic Chem labs.',
        price: 15,
        category: 'lab-equipment',
        condition: 'fair',
        images: [{ 
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', 
            public_id: 'sample_id_5' 
        }],
        seller: user._id,
        location: {
          campus: 'West Campus',
          building: 'Chemistry Lab',
          meetingPreference: 'flexible'
        },
        academic: {
          courseCode: 'CHEM201'
        },
        status: 'active'
      }
    ];

    const createdListings = await Listing.insertMany(listings);
    console.log(`Successfully inserted ${createdListings.length} listings.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
