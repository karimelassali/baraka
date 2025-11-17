// components/dashboard/VipProgram.jsx
"use client";

import { useState } from 'react';

const VipProgram = () => {
  const [activeTier, setActiveTier] = useState('Silver');

  const tiers = ['Bronze', 'Silver', 'Gold'];

  const tierBenefits = {
    Bronze: [
      { icon: '💵', text: 'Spent value (1= $0.5)', value: 1.4 },
      { icon: '🏆', text: 'Bonus points on reaching this tier', value: 260 },
      { icon: '🎂', text: 'Additional birthday point', value: 400 },
    ],
    Silver: [
      { icon: '💵', text: 'Spent value (1= $0.5)', value: 1.5 },
      { icon: '🏆', text: 'Bonus points on reaching this tier', value: 300 },
      { icon: '🎂', text: 'Additional birthday point', value: 500 },
    ],
    Gold: [
      { icon: '💵', text: 'Spent value (1= $0.5)', value: 2.0 },
      { icon: '🏆', text: 'Bonus points on reaching this tier', value: 500 },
      { icon: '🎂', text: 'Additional birthday point', value: 1000 },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">VIP program</h2>
      <div className="flex justify-around mb-6 border-b">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`py-2 px-4 font-medium ${
              activeTier === tier
                ? 'border-b-2 border-red-500 text-red-500'
                : 'text-gray-600'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{activeTier}</h3>
          <p className="text-sm text-gray-600">Need to unlock</p>
          <div className="my-4">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-red-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-red-500">$50</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">SPENT needed to unlock {activeTier} level</p>
          </div>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium">
            Next tier
          </button>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">VIP tier benefits</h4>
          <ul className="space-y-4">
            {tierBenefits[activeTier].map((benefit, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">{benefit.icon}</span>
                  <p className="text-gray-700">{benefit.text}</p>
                </div>
                <span className="font-bold text-red-500">{benefit.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VipProgram;