// components/dashboard/EarnPoints.jsx
const EarnPoints = () => {
  const earnMethods = [
    { icon: '📝', title: 'Create an account', points: 100 },
    { icon: '🎂', title: 'Celebrate birthday', points: 200 },
    { icon: '⭐', title: 'Leave a review', points: 50 },
    { icon: '🛒', title: 'Make a purchase', points: 50 },
    { icon: '🏬', title: 'Visit store', points: 20 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Earn points</h2>
      <ul className="space-y-4">
        {earnMethods.map((method, index) => (
          <li key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-4">{method.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{method.title}</p>
                <p className="text-sm text-gray-600">{method.points} points</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EarnPoints;