import { MongoDB } from '../../../server/database/mongodb';

// MongoDB inicializálása
export const database = new MongoDB();

const connectionInfo = {
  url: process.env.MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.MONGODB_DB || "mydb",
};

database.connect(connectionInfo).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Exportáljuk a socket handler-ek számára
export function getDatabase() {
  if (!database.db) {
    throw new Error("Database not initialized");
  }
  return database;
}