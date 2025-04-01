'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from './userProvider'; // Adjust the import path
import { databaseClient } from '@/utils/tbase/bundler'; // Adjust the import path
import Image from 'next/image';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const  user  = useUser();

  const getPageTitle = () => {
    if (pathname === '/-tbase/dashboard') return 'Dashboard';
    if (pathname === '/-tbase/auth') return 'Auth';
    if (pathname.startsWith('/-tbase/auth/')) return 'Auth Details';
    if (pathname === '/-tbase/buckets') return 'Buckets';
    if (pathname.startsWith('/-tbase/buckets/')) return 'Bucket Details';
    if (pathname === '/-tbase/tables') return 'Tables';
    if (pathname === '/-tbase/teams') return 'Teams';
    if (pathname === '/-tbase/permissions') return 'Permissions';
    if (pathname === '/-tbase/settings') return 'Settings';
    return 'Dashboard';
  };

  const handleLogout = () => {
    databaseClient.account.killSession((response: any) => {
      if (response.status === 'success') {
        localStorage.removeItem('t_auth_super');
        document.cookie = 't_auth_super=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('t_auth');
        document.cookie = 't_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/-tbase/auth';
      }
    });
  };

  return (
    <header className="bg-base-300 p-4 flex justify-between items-center shadow-md">
        <div className='flex gap-2 items-end justify-center'>
            <Image
                src="/tbase/tbase_logo_white.svg"
                alt="tBase"
                width={100}
                height={100}
            />        
                  <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="btn btn-primary text-white px-4 py-2 rounded"
        >
          Logout
        </button>
        <span>{user?.name || user?.email || 'Guest'}</span>
      </div>
    </header>
  );
};

export default Navbar;