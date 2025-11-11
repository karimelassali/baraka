'use client';

export default function Vouchers() {
  // Placeholder for fetching and displaying vouchers
  const vouchers = [
    { id: 1, code: 'VOUCHER-123', description: '€5 off' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Available Vouchers</h2>
      <ul>
        {vouchers.map((voucher) => (
          <li key={voucher.id}>
            <strong>{voucher.code}</strong>: {voucher.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
