"use client"
import React, { createContext, ReactNode, useContext } from 'react';

// Define the shape of the user object
interface User {
  [key: string]: any;
}

// Create a context with a default value of null
const UserContext = createContext<User | null>(null);

// Create a provider component
const UserProvider = ({ user, children }: { user: User | null, children: ReactNode }) => {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserProvider, useUser };