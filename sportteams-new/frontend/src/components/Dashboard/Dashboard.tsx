import React from 'react';
import { useAppSelector } from '../../hooks/redux';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      name: 'Totaal Spelers',
      value: '24',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      name: 'Actieve Teams',
      value: '3',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      name: 'Evaluaties Deze Week',
      value: '12',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'bg-yellow-500',
    },
    {
      name: 'Openstaande Doelen',
      value: '8',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welkom terug, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === 'admin' && 'Beheer je teams en spelers vanuit het dashboard'}
              {user?.role === 'coach' && 'Volg de voortgang van je team en spelers'}
              {user?.role === 'player' && 'Bekijk je persoonlijke ontwikkeling en doelen'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Evaluations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recente Evaluaties</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Placeholder for recent evaluations */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">JD</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">Technische vaardigheden</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">2 uur geleden</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-green-600">MB</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Maria Bakker</p>
                    <p className="text-xs text-gray-500">Tactisch inzicht</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 uur geleden</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium">
                Alle evaluaties bekijken →
              </button>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Team Prestaties</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Performance metrics */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Gemiddelde Score</p>
                  <p className="text-xs text-gray-500">Afgelopen maand</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">8.2</p>
                  <p className="text-xs text-green-500">+0.3 ↗</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Doelen Behaald</p>
                  <p className="text-xs text-gray-500">Deze maand</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">75%</p>
                  <p className="text-xs text-blue-500">12/16 doelen</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Activiteit Score</p>
                  <p className="text-xs text-gray-500">Team betrokkenheid</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">92%</p>
                  <p className="text-xs text-purple-500">Zeer actief</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium">
                Volledige rapporten bekijken →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;