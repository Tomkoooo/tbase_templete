'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Define menu items for the sidebar
  const menuItems = [
    { href: '/-tbase/dashboard', label: 'Dashboard' },
    { href: '/-tbase/dashboard/auth', label: 'Auth' },
    { href: '/-tbase/dashboard/buckets', label: 'Buckets' },
    { href: '/-tbase/dashboard/tables', label: 'Tables' },
    { href: '/-tbase/dashboard/teams', label: 'Teams' },
    { href: '/-tbase/dashboard/permissions', label: 'Permissions' },
    { href: '/-tbase/dashboard/settings', label: 'Settings' },
  ];

  // Breadcrumb logic
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter((segment) => segment);
    const breadcrumbs: { label: string; href: string }[] = [];

    // Base path for tbase
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (index === 0 && segment === '-tbase') {
        // Skip the base segment
        currentPath = `/${segment}`;
        return;
      }

      currentPath += `/${segment}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Customize labels for specific routes
      if (segment === 'dashboard') label = 'Dashboard';
      else if (segment === 'auth') label = 'Auth';
      else if (segment === 'buckets') label = 'Buckets';
      else if (segment === 'tables') label = 'Tables';
      else if (segment === 'teams') label = 'Teams';
      else if (segment === 'permissions') label = 'Permissions';
      else if (segment === 'settings') label = 'Settings';
      else if (index === 2 && (pathSegments[1] === 'auth' || pathSegments[1] === 'buckets')) {
        label = `ID: ${segment}`; // For auth/:id or buckets/:id
      }

      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 p-4 min-h-screen">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="text-sm breadcrumbs">
          <ul className="flex flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href}>
                {index < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="link link-hover text-primary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-400">{crumb.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Menu */}
      <h2 className="text-2xl font-bold mb-6">Menu</h2>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block px-4 py-2 rounded-lg hover:bg-base-300 ${
                pathname === item.href ? 'bg-base-300 text-primary font-bold' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;