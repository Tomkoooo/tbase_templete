import { ClientConnection } from "./socket";
const connectionInfo = {
    url: process.env.NEXT_PUBLIC_MONGO_URL,
    dbName: process.env.NEXT_PUBLIC_MONGO_DB,
}

export const databaseClient = new ClientConnection();

databaseClient.initialize("mongodb", connectionInfo).then(() => {
    console.log("MongoDB client initialized from bundler");
  }).catch((err) => {
    console.error("Failed to initialize MongoDB client:", err);
  });