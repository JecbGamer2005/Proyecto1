import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { DashboardMetric } from '../types';
import DashboardMetricCard from '../components/dashboard/DashboardMetricCard';
import ProductAlertsList from '../components/dashboard/ProductAlertsList';
import { Package, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    products, 
    transactions, 
    getProductsExpiringWithinDays, 
    getProductsBelowStock 
  } = useInventory();
  
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();

  // Get products expiring within the next 30 days
  const expiringProducts = getProductsExpiringWithinDays(30);
  
  // Get products below minimum stock level
  const lowStockProducts = getProductsBelowStock();
  
  // Calculate total inventory value
  const totalInventoryValue = products.reduce(
    (total, product) => total + (product.currentStock * product.sellingPrice),
    0
  );

  // Calculate total entries in the last month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const monthlyEntries = transactions.filter(
    t => t.type === 'entry' && new Date(t.date) >= lastMonth
  );
  
  const monthlyExits = transactions.filter(
    t => t.type === 'exit' && new Date(t.date) >= lastMonth
  );

  // Create dashboard metrics
  const dashboardMetrics: DashboardMetric[] = [
    {
      title: 'Total de Productos',
      value: products.length.toString(),
      icon: 'package',
      color: 'blue'
    },
    {
      title: 'Valor del Inventario',
      value: formatCurrency(totalInventoryValue),
      icon: 'package',
      trend: 5.2,
      color: 'blue'
    },
    {
      title: 'Productos con Stock Bajo',
      value: lowStockProducts.length.toString(),
      icon: 'alert',
      color: 'red'
    },
    {
      title: 'Productos por Vencer',
      value: expiringProducts.length.toString(),
      icon: 'calendar',
      color: 'amber'
    }
  ];

  const handleViewProduct = (id: string) => {
    navigate(`/inventory?product=${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardMetrics.map((metric, index) => (
            <DashboardMetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Section */}
        <div className="lg:col-span-2">
          <ProductAlertsList
            lowStockProducts={lowStockProducts}
            expiringProducts={expiringProducts}
            onViewProduct={handleViewProduct}
          />
        </div>
        
        {/* Activity Summary */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-6 py-4 bg-gray-50">
              <Activity className="mr-2 text-blue-500" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                <TrendingUp className="mr-2 text-green-500" size={16} />
                Entradas del Mes
              </h4>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-900">{monthlyEntries.length}</div>
                <div className="text-lg font-medium text-gray-600">
                  {monthlyEntries.reduce((total, t) => total + t.quantity, 0)} unidades
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                <TrendingUp className="mr-2 text-red-500" size={16} />
                Salidas del Mes
              </h4>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-900">{monthlyExits.length}</div>
                <div className="text-lg font-medium text-gray-600">
                  {monthlyExits.reduce((total, t) => total + t.quantity, 0)} unidades
                </div>
              </div>
            </div>
            
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Última actualización:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;