import mongoose from 'mongoose';

async function listAllDbs() {
    const localUri = "mongodb://127.0.0.1:27017";
    try {
        await mongoose.connect(localUri);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("All Databases:", dbs.databases.map(db => db.name));

        for (const dbInfo of dbs.databases) {
            const db = mongoose.connection.useDb(dbInfo.name);
            const collections = await db.db.listCollections().toArray();
            console.log(`Database: ${dbInfo.name}`);
            for (const col of collections) {
                const count = await db.db.collection(col.name).countDocuments();
                if (count > 0) {
                    console.log(`  - ${col.name}: ${count} docs`);
                }
            }
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
listAllDbs();
