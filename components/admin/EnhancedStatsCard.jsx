// components/admin/EnhancedStatsCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';

export default function EnhancedStatsCard({ title, value, change, icon: Icon, color, changeColor, loading, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden h-full">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <div className="h-10 w-24 bg-muted rounded mt-2 animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold mt-1">{value}</p>
              )}
            </div>
            <div className={`${color || 'bg-red-500'} p-3 rounded-lg text-white`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${changeColor || 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className={`text-sm font-medium ml-1 ${changeColor || 'text-green-500'}`}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}