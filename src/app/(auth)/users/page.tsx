'use client';

import { useEffect, useState } from 'react';

interface Message {
  content: string;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  dob: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-3 px-6">Username</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Date of Birth</th>
              <th className="py-3 px-6">Verified</th>
              <th className="py-3 px-6">Accepting Messages</th>
              <th className="py-3 px-6">Messages</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-6">{user.username}</td>
                <td className="py-3 px-6">{user.email}</td>
                <td className="py-3 px-6">{new Date(user.dob).toLocaleDateString()}</td>
                <td className="py-3 px-6">{user.isVerified ? 'Yes' : 'No'}</td>
                <td className="py-3 px-6">{user.isAcceptingMessages ? 'Yes' : 'No'}</td>
                <td className="py-3 px-6">
                  {user.messages.length > 0 ? (
                    <ul>
                      {user.messages.map((message, index) => (
                        <li key={index}>{message.content}</li>
                      ))}
                    </ul>
                  ) : (
                    'No messages'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}