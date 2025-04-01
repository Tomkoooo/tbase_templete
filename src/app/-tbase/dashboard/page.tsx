'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { databaseClient } from '@/utils/tbase/bundler';
import { useUser } from '../(components)/userProvider';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface User {
  _id: string;
  email: string;
  createdAt: string;
}

interface Session {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Collection {
  name: string;
  type: string;
}

interface BucketStat {
  bucket: string;
  size: number;
}

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [onlineConnections, setOnlineConnections] = useState<number>(0);
  const [bucketCount, setBucketCount] = useState<number>(0);
  const [totalBucketSize, setTotalBucketSize] = useState<number>(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Online Connections
    databaseClient.users.listenOnlineUsers((onlineUsers: string[]) => {
      setOnlineConnections(onlineUsers.length || 0);
    });

    // Bucket Statistics
    databaseClient.bucket.listBuckets((buckets: string[]) => {
      const bucketTables = buckets.filter((bucket) => bucket.startsWith('bucket_'));
      setBucketCount(bucketTables.length);

      if (bucketTables.length > 0) {
        databaseClient.bucket.getBucketStats((stats: BucketStat[]) => {
          const totalSize = stats.reduce((sum, item) => sum + (item.size || 0), 0);
          setTotalBucketSize(totalSize);
        });
      } else {
        setTotalBucketSize(0);
      }
    });

    // Collections (Databases)
    const collectionsQuery = 'listCollections().toArray()'
    databaseClient.database.get("collections").query(collectionsQuery).callback( (response: any) => {
      if (response.status === 'success') {
        setCollections(response.result || []);
      } else {
        console.error('Error fetching collections:', response.message);
        setCollections([]);
      }
    }).execute();

    // Users (Registrations)
    const usersQuery = 'collection("users").find({}).toArray()'
    databaseClient.database.get("uers").query(usersQuery).callback((response: any) => {
      if (response.status === 'success') {
        setUsers(response.result || []);
      } else {
        console.error('Error fetching users:', response.message);
        setUsers([]);
      }
    }).execute();

    // Sessions (Connections)
    const sessionsQuery = 'collection("sessions").find({}).toArray()';
    databaseClient.database.get("listSessions").query(sessionsQuery).callback((response: any) => {
      if (response.status === 'success') {
        setSessions(response.result || []);
      } else {
        console.error('Error fetching sessions:', response.message);
        setSessions([]);
      }
    }).execute();

    // Cleanup (opcionális)
    return () => {
      // Cleanup logika, ha szükséges
    };
  }, []);

  const registrationData = {
    labels: users.map((u) => u.createdAt.split('T')[0]),
    datasets: [
      {
        label: 'Registrations',
        data: users.map((_, index) => index + 1),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const connectionData = {
    labels: sessions.map((s) => s.updatedAt.split('T')[0]),
    datasets: [
      {
        label: 'Connections',
        data: sessions.map((_, index) => index + 1),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Registrations Over Time' },
    },
  };

  return (
    <div className="flex w-full flex-col">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Registrations Over Time</h3>
              <Bar
                data={registrationData}
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, title: { text: 'Registrations Over Time' } },
                }}
              />
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Connections Over Time</h3>
              <Bar
                data={connectionData}
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, title: { text: 'Connections Over Time' } },
                }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/-tbase/sessions" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Online Connections</h3>
              <p className="text-2xl font-bold">{onlineConnections}</p>
            </div>
          </Link>
          <Link href="/-tbase/buckets" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Bucket Collections/Tables</h3>
              <p className="text-2xl font-bold">{bucketCount}</p>
            </div>
          </Link>
          <Link href="/-tbase/buckets" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Total Bucket Size</h3>
              <p className="text-2xl font-bold">
                {totalBucketSize} bytes ({(totalBucketSize / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </Link>
          <Link href="/-tbase/tables" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Tables/Collections</h3>
              <p className="text-2xl font-bold">{collections.length}</p>
            </div>
          </Link>
          <Link href="/-tbase/buckets" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Storage</h3>
              <p className="text-2xl font-bold">
                {totalBucketSize} bytes ({(totalBucketSize / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </Link>
          <Link href="/-tbase/buckets" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Buckets</h3>
              <p className="text-2xl font-bold">{bucketCount}</p>
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/-tbase/auth" className="card bg-base-200 shadow-xl hover:bg-base-300 transition-colors">
            <div className="card-body">
              <h3 className="card-title text-lg">Auth</h3>
              <p className="text-2xl font-bold">{users.length} Users</p>
            </div>
          </Link>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Functions</h3>
              <p className="text-2xl font-bold">0 Executions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;