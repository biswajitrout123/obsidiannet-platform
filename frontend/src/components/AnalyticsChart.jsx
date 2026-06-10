import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/engagement`, {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error("Failed to fetch chart data");
        
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Chart sync error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchChartData();

    // 🔄 Optional: Real-time polling (refreshes data every 30 seconds)
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-6 h-[350px] flex items-center justify-center shadow-xl">
        <p className="text-gray-500 text-sm animate-pulse">Loading real-time metrics...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-4 sm:p-6 shadow-xl w-full">
      <div className="mb-6 border-b border-[#1e2230] pb-3">
        <h3 className="text-gray-100 font-bold text-sm sm:text-base tracking-wide">
          📊 Real-Time Network Engagement
        </h3>
        <p className="text-gray-500 text-[11px] sm:text-xs mt-1">
          Tracking your profile views and new connections over the last 7 days.
        </p>
      </div>

      {/* 📈 The Chart Container */}
      <div className="h-[250px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2230" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#090a0f', borderColor: '#252a3d', borderRadius: '8px' }}
              itemStyle={{ color: '#e5e7eb', fontSize: '13px' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            <Line 
              type="monotone" 
              name="Profile Views"
              dataKey="profileViews" 
              stroke="#3b82f6" /* Blue */
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              name="New Connections"
              dataKey="connections" 
              stroke="#10b981" /* Emerald Green */
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}