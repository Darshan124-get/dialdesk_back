import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: 'dialdesk' });
  console.log('Connected to MongoDB');
}


