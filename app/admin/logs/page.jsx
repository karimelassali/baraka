// app/admin/logs/page.jsx
"use client";

import MessagingLogs from '../../../components/admin/MessagingLogs';

export default function AdminLogsPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Messaging Logs</h1>
        <p className="text-gray-600">View and monitor message delivery status</p>
        <div className="w-24 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <MessagingLogs />
      </div>
    </>
  );
}