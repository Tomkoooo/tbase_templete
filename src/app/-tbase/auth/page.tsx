'use client'
import Image from "next/image";
import React, { useEffect } from "react";
import { databaseClient } from "@/utils/tbase/bundler"; // Frissített útvonal
import { Login, Register } from "../(components)/auth";

const Page = () => {
  const [superUsers, setSuperUsers] = React.useState(false);

  useEffect(() => {
    const getSuperUsers = async () => {
      databaseClient.users.listAll((data: any[]) => {
        if (data) {
          const superUsersExist = data.filter((user: any) => user.isSuper).length > 0;
          setSuperUsers(superUsersExist);
        }
      });
    };
    getSuperUsers();
    // Nem kell close(), mert a ClientConnection kezeli a kapcsolatot
  }, []);

  console.log(superUsers);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url(/tbase/rose_bg.jpg)" }}></div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
          {superUsers ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
};

export default Page;