import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const mongoUrl = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}?retryWrites=true&w=majority&appName=Cluster0`;

    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URL:', mongoUrl.replace(/:[^:]+@/, ':****@')); // Hide password in logs

    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connection successful!');

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
