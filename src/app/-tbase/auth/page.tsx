import Image from "next/image";
import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url(/tbase/rose_bg.jpg)" }}></div>
      
      {/* Right Side Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-gray-200 p-6">
          <div className="w-full flex items-end justify-around h-16">
            <Image
              src="/tbase/tbase_logo_white.svg"
              alt="tBase"
              width={128}
              height={128}
            />
            <h2 className="text-2xl font-bold text-center">
              Login - tBase admin
            </h2>
          </div>
          <form className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input type="email" id="email" name="email" placeholder="e.g super@user.com" required className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <input type="password" id="password" name="password" placeholder="e.g. root" required className="input input-bordered w-full" />
            </div>
            <button className="btn btn-primary w-full" type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
