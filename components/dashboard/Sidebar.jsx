// components/dashboard/Sidebar.jsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(true);

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const toggleLoyaltyMenu = () => {
    setIsLoyaltyOpen(!isLoyaltyOpen);
  };

  const navItems = [
    { id: 'Home', icon: '🏠', path: '/dashboard' },
    { id: 'Customers', icon: '👥', path: '/dashboard' },
    { id: 'Orders', icon: '🛒', path: '/dashboard' },
    { id: 'Reports', icon: '📈', path: '/dashboard' },
  ];

  const modules = [
    {
      id: 'Loyalty rewards',
      icon: '🏆',
      subItems: [
        { id: 'Dashboard', path: '/dashboard' },
        { id: 'Set up program', path: '/dashboard' },
        { id: 'Display on store', path: '/dashboard' },
        { id: 'Members', path: '/dashboard' },
        { id: 'Settings', path: '/dashboard' },
        { id: 'Point expiry', path: '/dashboard' },
        { id: 'Analytics', path: '/dashboard' },
      ],
    },
    { id: 'Email marketing', icon: '📧', path: '/dashboard' },
    { id: 'SMS marketing', icon: '📱', path: '/dashboard' },
    { id: 'WhatsApp', icon: '💬', path: '/dashboard' },
    { id: 'Product reviews', icon: '⭐', path: '/dashboard' },
    { id: 'Web push', icon: '🔔', path: '/dashboard' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Ai Trillion</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeItem === item.id
                    ? 'bg-red-100 text-red-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.id}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-500 uppercase px-4">Modules</h2>
        <ul className="space-y-2">
          {modules.map((item) => (
            <li key={item.id}>
              {item.subItems ? (
                <>
                  <button
                    onClick={toggleLoyaltyMenu}
                    className="w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.id}</span>
                    </div>
                    <span>{isLoyaltyOpen ? '▲' : '▼'}</span>
                  </button>
                  {isLoyaltyOpen && (
                    <ul className="pl-8 space-y-1 mt-2">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.id}>
                           <Link
                            href={subItem.path}
                            onClick={() => handleItemClick(subItem.id)}
                            className={`w-full block px-4 py-2 rounded-lg text-left transition-colors text-sm ${
                            activeItem === subItem.id
                                ? 'bg-red-100 text-red-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {subItem.id}
                           </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeItem === item.id
                      ? 'bg-red-100 text-red-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.id}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;