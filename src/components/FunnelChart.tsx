import { FC } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface FunnelChartProps {
  data: { name: string; value: number }[];
}

export const FunnelChart: FC<FunnelChartProps> = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full h-[300px] border border-bg-card-border bg-bg-card rounded-2xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Funil de Conversão</h3>
        <p className="text-sm text-gray-500">Jornada do lead até o diagnóstico</p>
      </div>
      
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E330" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00E330" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2225" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#888', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#888', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F1012', borderColor: '#1F2225', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#00E330' }}
              cursor={{ stroke: '#1F2225', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#00E330" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorGreen)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
