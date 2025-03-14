import { Client } from "./dist/socket";

// export const databaseClient = new Client() //constructor is ws server url, basic url is localhost:3000


export const databaseClient = await new Client()
.database("mongodb")
.connection({
  url: process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.NEXT_PUBLIC_MONGODB_DB || "socket-test",
});

// use this for mongodb connection


{/*
export const databaseClient = await new Client()
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