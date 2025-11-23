import { Calendar, Clock, CheckCircle, Star } from 'lucide-react';

export function QuickStats() {
  const stats = [
    {
      label: 'TODAY',
      value: '3',
      subtitle: 'Assignments',
      icon: Calendar,
      color: '#0066CC'
    },
    {
      label: 'PENDING',
      value: '2',
      subtitle: 'Requests',
      icon: Clock,
      color: '#F59E0B'
    },
    {
      label: 'THIS MONTH',
      value: '42',
      subtitle: 'Completed',
      icon: CheckCircle,
      color: '#10B981'
    },
    {
      label: 'RATING',
      value: '4.8',
      subtitle: 'Avg Score',
      icon: Star,
      color: '#F59E0B'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-500 tracking-wide">{stat.label}</span>
                  <Icon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[32px] text-gray-900" style={{ fontWeight: 600 }}>
                    {stat.value}
                  </span>
                  {stat.label === 'RATING' && <span className="text-xl">⭐</span>}
                </div>
                <span className="text-sm text-gray-600">{stat.subtitle}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
