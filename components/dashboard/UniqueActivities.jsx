// components/dashboard/UniqueActivities.jsx
const UniqueActivities = () => {
  const activities = [
    { icon: '🤝', title: 'Refer a Friends', points: '+100 points' },
    { icon: '👑', title: 'Become a Member', points: '+200 points' },
    { icon: '🏢', title: 'Become an Affiliate', points: '+80 points' },
    { icon: '🎁', title: 'Buy $X Get Y Points', points: '+60 points' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Unique activities</h2>
      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center p-4 border rounded-lg">
            <span className="text-3xl mr-4">{activity.icon}</span>
            <div>
              <p className="font-semibold text-gray-800">{activity.title}</p>
              <p className="text-sm text-green-500 font-bold">{activity.points}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniqueActivities;