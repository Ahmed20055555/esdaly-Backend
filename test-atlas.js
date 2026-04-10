import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = "mongodb+srv://esdalyUser:esdaly123@cluster0.aqhjfqt.mongodb.net/?appName=Cluster0";

async function test() {
    console.log("Testing connection to:", uri.replace(/:([^@]+)@/, ":****@"));
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("SUCCESS: Connected to MongoDB Atlas");
        const databases = await mongoose.connection.db.admin().listDatabases();
        console.log("Databases found:", databases.databases.map(db => db.name));
        await mongoose.connection.close();
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

test();
