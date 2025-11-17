// components/dashboard/Header.jsx
const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Loyalty rewards dashboard</h1>
        <p className="text-sm text-gray-600">Create ways for your customers to earn and redeem points.</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span>✨</span>
          <span className="text-sm font-medium text-gray-700">What's new</span>
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">1</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800">🌐</button>
          <button className="text-gray-600 hover:text-gray-800">🧩</button>
          <button className="text-gray-600 hover:text-gray-800">👤</button>
        </div>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
          Support
        </button>
      </div>
    </header>
  );
};

export default Header;