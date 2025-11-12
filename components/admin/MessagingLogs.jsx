// components/admin/MessagingLogs.jsx
"use client";

import { useEffect, useState } from 'react';

export default function MessagingLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/messages');
        const data = await response.json();

        if (response.ok) {
          setLogs(data);
        } else {
          console.error('Failed to fetch logs:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div>Loading logs...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Messaging Logs</h2>
      <div className="mt-4">
        <table>
          <thead>
            <tr>
              <th>To</th>
              <th>Template</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.customer_id}</td>
                <td>{log.template_name}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
