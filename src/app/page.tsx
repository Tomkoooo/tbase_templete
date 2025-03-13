"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const petalCount = 15; 

  const petalVariants = {
    initial: {
      opacity: 0,
      y: -50,
      x: "-50%",
    },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      y: window.innerHeight + 50, 
      x: `calc(-50% + ${Math.random() * 100 - 50}vw)`, 
      transition: {
        duration: 5 + Math.random() * 3,
        delay: Math.random() * 2, 
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-300 to-rose-500 relative overflow-hidden">
      {Array.from({ length: petalCount }).map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          variants={petalVariants}
          initial="initial"
          animate="animate"
          className="absolute text-rose-600 text-2xl"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * -100}vh`, 
          }}
        >
          ❀ 
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="card w-96 bg-base-100 shadow-xl z-10"
      >
        <div className="card-body items-center text-center">
          <Image
            src={"/tbase/tbase_fav.svg"}
            alt="tBase"
            width={64}
            height={64}
          />
          <h2 className="card-title text-3xl font-bold" style={{ fontFamily: "var(--font-comfortaa)" }}>
            Welcome to tBase
          </h2>
          <p className=" mt-2" style={{ fontFamily: "var(--font-comfortaa)" }}>
            tBase is a powerful Backend as a Service provider to streamline your development process.
          </p>

          {/* Buttons */}
          <div className="card-actions justify-center mt-6 space-x-4">
            <Link href="/-tbase">
              <button className="btn btn-primary bg-rose-600 hover:bg-rose-700 border-none text-white">
                Admin Panel
              </button>
            </Link>
            <Link href="https://github.com/Tomkoooo/tbase-demo" target="_blank">
              <button className="btn btn-outline border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white">
                GitHub
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}