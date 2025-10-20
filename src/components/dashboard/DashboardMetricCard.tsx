import React from 'react';
import { DashboardMetric } from '../../types';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

interface DashboardMetricCardProps {
  metric: DashboardMetric;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({ metric }) => {
  const getIcon = () => {
    switch (metric.icon) {
      case 'package':
        return <Package size={24} className={`text-${metric.color}-500`} />;
      case 'alert':
        return <AlertTriangle size={24} className={`text-${metric.color}-500`} />;
      case 'calendar':
        return <Calendar size={24} className={`text-${metric.color}-500`} />;
      default:
        return <ArrowRight size={24} className={`text-${metric.color}-500`} />;
    }
  };

  const getTrendIcon = () => {
    if (metric.trend === undefined) return null;
    
    if (metric.trend > 0) {
      return <TrendingUp size={16} className="text-green-500" />;
    } else if (metric.trend < 0) {
      return <TrendingDown size={16} className="text-red-500" />;
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${metric.color}-500 transform transition-transform duration-200 hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{metric.title}</h3>
          <div className="mt-1 flex items-center">
            <span className="text-2xl font-bold">{metric.value}</span>
            {metric.trend !== undefined && (
              <span className="ml-2 flex items-center text-sm">
                {getTrendIcon()}
                <span className={`ml-1 ${metric.trend > 0 ? 'text-green-600' : metric.trend < 0 ? 'text-red-600' : ''}`}>
                  {Math.abs(metric.trend)}%
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="p-3 rounded-full bg-gray-50">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricCard;