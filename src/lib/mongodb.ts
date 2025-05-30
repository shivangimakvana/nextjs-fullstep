import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string; // Your MongoDB URI
const options = {};

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!uri) throw new Error('Please define the MONGODB_URI environment variable.');

  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(); // Use default DB from URI
  }

  return { client, db };
}
