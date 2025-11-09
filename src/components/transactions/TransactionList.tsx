import React, { useState } from 'react';
import { MultiTransaction, Product } from '../../types';
import { Search, ArrowDownCircle, ArrowUpCircle, Calendar, RefreshCw, Trash2, User, Hash } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

interface TransactionListProps {
  transactions: MultiTransaction[];
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  onDelete: (id: string) => Promise<void>;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  products,
  getProductById,
  onDelete
}) => {
  const { formatCurrency } = useSettings();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entry' | 'exit'>('all');
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });
  const [productFilter, setProductFilter] = useState<string>('');

  // Apply filters and search
  const filteredTransactions = transactions.filter(transaction => {
    // Type filter
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    
    // Date filter - start date
    if (dateFilter.startDate && new Date(transaction.date) < new Date(dateFilter.startDate)) {
      return false;
    }
    
    // Date filter - end date
    if (dateFilter.endDate && new Date(transaction.date) > new Date(dateFilter.endDate)) {
      return false;
    }
    
    // Product filter
    if (productFilter) {
      const hasProduct = transaction.items.some(item => item.productId === productFilter);
      if (!hasProduct) return false;
    }
    
    // Search term - search in product name or notes
    if (searchTerm) {
      const productNames = transaction.items.map(item => {
        const product = getProductById(item.productId);
        return product?.name.toLowerCase() || '';
      }).join(' ');
      const transactionNotes = transaction.notes?.toLowerCase() || '';
      const buyerName = transaction.buyerName?.toLowerCase() || '';
      const transactionNumber = transaction.transactionNumber.toLowerCase();
      
      if (!productNames.includes(searchTerm.toLowerCase()) && 
          !transactionNotes.includes(searchTerm.toLowerCase()) &&
          !buyerName.includes(searchTerm.toLowerCase()) &&
          !transactionNumber.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter({ startDate: '', endDate: '' });
    setProductFilter('');
  };

  const handleDelete = async (id: string, transactionNumber: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la transacción ${transactionNumber}?`)) {
      await onDelete(id);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            <Calendar className="inline-block mr-2 mb-1" size={20} />
            Registro de Transacciones
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {(searchTerm || typeFilter !== 'all' || dateFilter.startDate || dateFilter.endDate || productFilter) && (
              <button 
                onClick={resetFilters}
                className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'entry' | 'exit')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">Todos</option>
              <option value="entry">Entradas</option>
              <option value="exit">Salidas</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="productFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <select
              id="productFilter"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Todos los productos</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              id="startDate"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              id="endDate"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                # Transacción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente/Proveedor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 italic">
                  No se encontraron transacciones.
                </td>
              </tr>
            ) : (
              sortedTransactions.map(transaction => {                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Hash size={14} className="mr-1 text-gray-400" />
                        {transaction.transactionNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === 'entry' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <ArrowDownCircle size={14} className="mr-1" /> Entrada
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <ArrowUpCircle size={14} className="mr-1" /> Salida
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {transaction.items.map((item, index) => {
                          const product = getProductById(item.productId);
                          return (
                            <div key={index} className="text-xs mb-1">
                              <span className="font-medium">{product?.name || 'N/A'}</span>
                              <span className="text-gray-500 ml-1">({item.quantity})</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(transaction.buyerName || transaction.supplierName) ? (
                        <div className="flex items-center">
                          <User size={14} className="mr-1 text-gray-400" />
                          {transaction.buyerName || transaction.supplierName}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {hasPermission('delete') && (
                        <button
                          onClick={() => handleDelete(transaction.id, transaction.transactionNumber)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar transacción"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;