// app/admin/logs/page.jsx
"use client";

import UnifiedLogs from '../../../../components/admin/UnifiedLogs';

export default function AdminLogsPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">System & Messaging Logs</h1>
        <p className="text-gray-600">Comprehensive view of all system activities and communications</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <UnifiedLogs />
      </div>
    </>
  );
}