import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const wipeDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/esdaly';
    console.log(`⏳ Connecting to MongoDB at: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    console.log('🗑️  Wiping all data from database...');
    for (let collection of collections) {
      await collection.drop();
      console.log(`   - Dropped ${collection.collectionName}`);
    }

    console.log('✅ Database is completely clean!');
    
    // Disconnect
    await mongoose.disconnect();
    
    // Now trigger the seed admin script so the user still has an admin user on the clean DB
    console.log('\n🔄 Re-creating Admin User...');
    
  } catch (error) {
    if (error.code === 26 || error.message.includes('ns not found')) {
      // Collection already dropped or empty, ignore
      console.log('   - Some collections were already empty.');
    } else {
      console.error('❌ Error wiping database:', error);
    }
  } finally {
    process.exit(0);
  }
};

wipeDatabase();
