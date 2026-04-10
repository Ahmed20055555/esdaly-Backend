import mongoose from 'mongoose';

async function checkCounts() {
    const localUri = "mongodb://127.0.0.1:27017/esdaly";
    try {
        await mongoose.connect(localUri);
        const collections = ['products', 'users', 'orders'];
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col).countDocuments();
            console.log(`Local Collection '${col}' count: ${count}`);
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error("Local Check Error:", err.message);
    }
}

checkCounts();
