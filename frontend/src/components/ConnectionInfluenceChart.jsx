import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function ConnectionInfluenceChart({ connections }) {
    // Transform the raw connection data for the chart
    // We sort it so the people with the most connections appear first
    const chartData = connections.map(conn => ({
        name: conn.name.split(' ')[0], // Use first name for a cleaner X-axis
        connectionCount: conn.connections?.length || 0,
        fullName: conn.name
    })).sort((a, b) => b.connectionCount - a.connectionCount);

    // If the user has no connections yet, don't render the chart
    if (!chartData || chartData.length === 0) return null;

    return (
        <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-4 sm:p-6 shadow-xl w-full mb-10">
            <div className="mb-6 border-b border-[#1e2230] pb-3">
                <h3 className="text-gray-100 font-bold text-sm sm:text-base tracking-wide">
                    🌐 Network Influence
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1">
                    Comparing the reach of professionals in your immediate network.
                </p>
            </div>

            <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2230" vertical={false} />
                        <XAxis 
                            dataKey="name" 
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
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e2230' }}
                            contentStyle={{ backgroundColor: '#090a0f', borderColor: '#252a3d', borderRadius: '8px' }}
                            itemStyle={{ color: '#e5e7eb', fontSize: '13px' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontWeight: 'bold' }}
                            formatter={(value) => [value, 'Total Connections']}
                            labelFormatter={(label, payload) => {
                                // Show full name on hover
                                if (payload && payload.length > 0) {
                                    return payload[0].payload.fullName;
                                }
                                return label;
                            }}
                        />
                        <Bar dataKey="connectionCount" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                /* The top connected person gets a bright blue bar, the rest get a deep indigo */
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#4338ca'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}