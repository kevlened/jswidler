import { MongoClient, Collection } from 'mongodb';
import randomString from 'crypto-random-string';

let m;
async function mongo() {
	if (!m) {
		const { CREDS } = process.env;
		if (CREDS) {
			console.log('connecting to production mongo');
			const uri = `mongodb+srv://${CREDS}@main.05ugs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
			m = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		} else {
			console.log('connecting to in-memory mongo');
			// use an in-memory database if running in development
			const { MongoMemoryServer } = await import('mongodb-memory-server');
			const server = await MongoMemoryServer.create();
			m = await MongoClient.connect(server.getUri());
		}
	}
	return m;
}

let db;
/**
 * @returns {Promise<Collection>}
 */
export async function DB() {
	if (!db) {
		const conn = await mongo();
		db = conn.db().collection('challenges');
	}
	return db;
}

export async function nextChallengeId() {
	const db = await DB();
	let result = await db.findOneAndUpdate(
    { _id: 'challengeIdCounter' },
    { $inc: { id: 1 } },
    { returnDocument: 'after', upsert: true }
  );
	return (result?.value?.id).toString();
}

export const createToken = () => randomString({
	length: 32,
	type: 'alphanumeric'
});

export const createSecret = length => randomString({
  length,
  characters: 'abcdefghijklmnopqrstuvwxyz'
});

export const isLowercase = /^[a-z]+$/;
