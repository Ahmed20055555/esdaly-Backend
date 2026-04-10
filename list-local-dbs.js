import mongoose from 'mongoose';

async function listLocalDatabases() {
    const localUri = "mongodb://127.0.0.1:27017";
    try {
        console.log("Checking local MongoDB...");
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("Local Databases:", dbs.databases.map(db => db.name));

        for (const dbInfo of dbs.databases) {
            if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') continue;
            const db = mongoose.connection.useDb(dbInfo.name);
            const collections = await db.db.listCollections().toArray();
            console.log(`- Database: ${dbInfo.name}, Collections:`, collections.map(c => c.name));
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error("Local MongoDB Error:", err.message);
    }
}

listLocalDatabases();
