import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://esdalyUser:esdaly123@cluster0.aqhjfqt.mongodb.net/?retryWrites=true&w=majority";

async function testAtlas() {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    try {
        console.log("Connecting to Atlas...");
        await client.connect();
        console.log("SUCCESS: Connected to Atlas");
        const dbs = await client.db().admin().listDatabases();
        console.log("Databases:", dbs.databases.map(db => db.name));

        for (const dbInfo of dbs.databases) {
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            console.log(`- Database: ${dbInfo.name}, Collections:`, collections.map(c => c.name));
        }
    } catch (err) {
        console.error("Atlas Error Details:", err);
    } finally {
        await client.close();
    }
}

testAtlas();
