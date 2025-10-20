import React from 'react';
import { Product } from '../../types';
import { AlertTriangle, Clock } from 'lucide-react';

interface ProductAlertsListProps {
  lowStockProducts: Product[];
  expiringProducts: Product[];
  onViewProduct: (id: string) => void;
}

const ProductAlertsList: React.FC<ProductAlertsListProps> = ({ 
  lowStockProducts, 
  expiringProducts,
  onViewProduct
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center px-6 py-4 bg-gray-50">
          <AlertTriangle className="mr-2 text-amber-500" size={20} />
          <h3 className="text-lg font-medium text-gray-900">Alertas</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Low stock alerts */}
        <div className="px-6 py-4">
          <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" size={16} />
            Stock bajo
          </h4>
          
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No hay productos con stock bajo.</p>
          ) : (
            <ul className="space-y-2">
              {lowStockProducts.slice(0, 5).map(product => (
                <li key={product.id} className="bg-red-50 rounded p-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <div className="text-sm text-gray-600">
                      Stock actual: <span className="font-medium text-red-600">{product.currentStock}</span> / Mínimo: {product.minStockLevel}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProduct(product.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver
                  </button>
                </li>
              ))}
              
              {lowStockProducts.length > 5 && (
                <li className="text-center text-sm text-gray-500 mt-2">
                  + {lowStockProducts.length - 5} más...
                </li>
              )}
            </ul>
          )}
        </div>
        
        {/* Expiring soon alerts */}
        <div className="px-6 py-4">
          <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
            <Clock className="mr-2 text-amber-500" size={16} />
            Productos por vencer
          </h4>
          
          {expiringProducts.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No hay productos por vencer próximamente.</p>
          ) : (
            <ul className="space-y-2">
              {expiringProducts.slice(0, 5).map(product => (
                <li key={product.id} className="bg-amber-50 rounded p-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <div className="text-sm text-gray-600">
                      Vence: <span className="font-medium text-amber-600">{product.expirationDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProduct(product.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver
                  </button>
                </li>
              ))}
              
              {expiringProducts.length > 5 && (
                <li className="text-center text-sm text-gray-500 mt-2">
                  + {expiringProducts.length - 5} más...
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductAlertsList;