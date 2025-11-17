// components/dashboard/RedeemPoints.jsx
const RedeemPoints = () => {
  const redeemMethods = [
    { icon: '💸', title: 'Flat $10 Discount' },
    { icon: '📈', title: '50% Discount' },
    { icon: '🛍️', title: 'Discount on Purchase' },
    { icon: '🚚', title: 'Free Shipping' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Redeem points</h2>
      <ul className="space-y-4">
        {redeemMethods.map((method, index) => (
          <li key={index} className="flex items-center">
            <span className="text-2xl mr-4">{method.icon}</span>
            <p className="font-medium text-gray-800">{method.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RedeemPoints;