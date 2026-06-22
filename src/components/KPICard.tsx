import { FC, ReactNode } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  highlight?: boolean;
  delay?: number;
}

export const KPICard: FC<KPICardProps> = ({ title, value, subtitle, icon, highlight, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 flex flex-col justify-between h-full",
        highlight 
          ? "border-in-green bg-in-green-dim" 
          : "border-bg-card-border bg-bg-card hover:bg-bg-card-hover transition-colors"
      )}
    >
      {highlight && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-in-green rounded-full opacity-20 blur-3xl pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && (
          <div className={cn("p-2 rounded-lg", highlight ? "bg-in-green text-black" : "bg-bg-card-border text-in-green")}>
            {icon}
          </div>
        )}
      </div>
      
      <div>
        <div className={cn("text-3xl sm:text-4xl font-bold tracking-tight mb-1", highlight ? "text-in-green" : "text-white")}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};
