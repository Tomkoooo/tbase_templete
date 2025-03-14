//EXAMPLE for server-side authentication and server side usage of the database class in NextJs
import {Database, MongoDB, MySQLDB} from './dist/database';

export const database = new Database() //define inside class for mongodb or mysql

{
    /*
    export const database = new Database({
    new MongoDB({
      url: process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://localhost:27017",
      dbName: process.env.NEXT_PUBLIC_MONGODB_DB || "socket-test",
    }),
    */
}

{/*
    export const mongodb = new MongoDB({
     url: process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://localhost:27017",
    dbName: process.env.NEXT_PUBLIC_MONGODB_DB || "socket-test",
  });
*/}
{/*
    export const mysql = new MySQLDB({
    host: "localhost",
    user: "root",
    port: 3306,
    database: "socket-test",
    });
*/}