// components/dashboard/StatCard.jsx
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
      <div className="flex-shrink-0">
        <span className="text-4xl">{icon}</span>
      </div>
      <div className="ml-4">
        <p className="text-lg font-medium text-gray-800">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;