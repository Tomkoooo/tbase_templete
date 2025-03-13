import { Client } from "./dist/socket";

export const client = new Client() // Add the socket server uri default localhost:3000

{/*
export const mongoClient = await new Client()
.database("mongodb")
.connection({
  url: process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.en.NEXT_PUBLIC_MONGODB_DB || "socket-test",
});

use this for mongodb connection
*/}

{/*
export const mysqlClient = await new Client()
.database("mysql")
.connection({
  host: process.env.NEXT_PUBLIC_MYSQL_HOST || "localhost",
  user: process.env.NEXT_PUBLIC_MYSQL_USER || "root",
    password: process.env.NEXT_PUBLIC_MYSQL_PASSWORD || "",
  port: process.env.NEXT_PUBLIC_MYSQL_PORT || 3306,
  database: process.env.NEXT_PUBLIC_MYSQL_DATABASE || "socket-test",
});

use this for mysql connection
*/}