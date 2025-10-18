import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

async function debugConnection() {
  const host = process.env.MONGOHOST;
  console.log('🔍 Debugging MongoDB connection...');
  console.log('Cluster:', host);

  // Test 1: DNS Resolution
  console.log('\n1️⃣ Testing DNS resolution...');
  try {
    const result = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
    console.log('✅ DNS resolution successful');
    console.log('Found hosts:', result.map(r => `${r.name}:${r.port}`));
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    return;
  }

  // Test 2: Basic connectivity
  console.log('\n2️⃣ Testing basic connectivity...');
  const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${host}/?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });

  try {
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    await client.close();
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Error code:', error.code);
  }
}

debugConnection();
