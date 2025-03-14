import Image from "next/image";
import React from "react";
import { databaseClient } from "@/utils/tbase/bundler";
import { Login, Register } from "../(components)/auth";

const Page = () => {
    const superUsers = databaseClient.users().listAll(
      (data) => {
        console.log(data);
      }
    );
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url(/tbase/rose_bg.jpg)" }}></div>
      
      {/* Right Side Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200 p-6">
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
