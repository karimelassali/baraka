'use client';

import { useEffect, useState } from 'react';

export default function Wallet() {
  const [points, setPoints] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    async function fetchPoints() {
      const response = await fetch('/api/customer/points');
      const data = await response.json();
      setPoints(data);
      const total = data.reduce((acc, curr) => acc + curr.points, 0);
      setTotalPoints(total);
    }
    fetchPoints();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Loyalty Wallet</h2>
      <p>
        <strong>Total Points:</strong> {totalPoints}
      </p>
      <h3 className="text-lg font-bold mt-4">History</h3>
      <ul>
        {points.map((item) => (
          <li key={item.id}>
            {item.reason}: {item.points} points on {new Date(item.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
