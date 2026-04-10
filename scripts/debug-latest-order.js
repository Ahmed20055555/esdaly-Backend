import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/esdaly';
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;
        const orders = await db.collection('orders').find().sort({ _id: -1 }).limit(1).toArray();
        console.log("Latest Order:");
        console.log(JSON.stringify(orders[0], null, 2));
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
