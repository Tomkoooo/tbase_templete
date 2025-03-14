'use client'
import Image from "next/image";
import React, { useEffect } from "react";
import { databaseClient } from "@/utils/tbase/bundler";
import { Login, Register } from "../(components)/auth";

const Page = () => {
  const [superUsers, setSuperUsers] = React.useState(false);
  useEffect(() => {
    const getSuperUsers = async () => {
      const users = databaseClient.users().listAll(
        (data: any) => {
          if(data) {
            const superUsers = data.filter((user: any) => user.isSuper);
            console.log(superUsers);
            if (superUsers.length > 0) {
              setSuperUsers(true);
            }
          }
          return
        }
      )
    };
    getSuperUsers();
    return () => {
      databaseClient.close();
    }
  }, []);

    console.log(superUsers);
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url(/tbase/rose_bg.jpg)" }}></div>
      
      {/* Right Side Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100 shdaow-xl   p-6">
          {
            superUsers ? (
              <Login/>
            ) : (
              <Register/>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Page;
