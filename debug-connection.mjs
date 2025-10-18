import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}/?retryWrites=true&w=majority`;

  console.log('Testing MongoDB connection...');
  console.log('Connection URI:', uri.replace(/:[^:]+@/, ':****@'));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    // Test a simple operation
    const db = client.db('test');
    const collection = db.collection('test');
    await collection.insertOne({ test: 'connection successful', timestamp: new Date() });
    console.log('✅ Successfully inserted test document!');

    await client.close();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error codeName:', error.codeName);
  }
}

testConnection();
