import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { FileText, Download, Filter, Calendar, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { Product } from '../types';

type ReportType = 'low-stock' | 'expiring' | 'all-products' | 'transactions-summary';

const Reports: React.FC = () => {
  const {
    products,
    getProductsBelowStock,
    getProductsExpiringWithinDays,
    getCategoryById,
    getBrandById,
    multiTransactions
  } = useInventory();

  const { formatCurrency, settings } = useSettings();
  const [selectedReport, setSelectedReport] = useState<ReportType>('low-stock');
  const [expirationDays, setExpirationDays] = useState(30);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const lowStockProducts = getProductsBelowStock();
  const expiringProducts = getProductsExpiringWithinDays(expirationDays);

  const getReportData = () => {
    switch (selectedReport) {
      case 'low-stock':
        return lowStockProducts;
      case 'expiring':
        return expiringProducts;
      case 'all-products':
        return products;
      default:
        return [];
    }
  };

  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';

    if (selectedReport === 'transactions-summary') {
      const filteredTransactions = multiTransactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= new Date(dateRange.startDate) && txDate <= new Date(dateRange.endDate);
      });

      csvContent = 'Número de Transacción,Fecha,Tipo,Total,Cliente/Proveedor,Notas\n';
      filteredTransactions.forEach(transaction => {
        const type = transaction.type === 'entry' ? 'Entrada' : 'Salida';
        const client = transaction.buyerName || transaction.supplierName || '';
        const notes = transaction.notes?.replace(/,/g, ';') || '';
        csvContent += `${transaction.transactionNumber},${transaction.date},${type},${transaction.totalAmount},${client},${notes}\n`;
      });
      filename = `reporte-transacciones-${dateRange.startDate}-${dateRange.endDate}.csv`;
    } else {
      const reportData = getReportData();
      csvContent = 'Nombre,Categoría,Marca,Stock Actual,Stock Mínimo,Precio Compra,Precio Venta,Fecha Vencimiento,Código de Barras\n';

      reportData.forEach(product => {
        const category = getCategoryById(product.category)?.name || '';
        const brand = getBrandById(product.brand)?.name || '';
        const expiration = product.expirationDate || '';
        const barcode = product.barcode || '';

        csvContent += `${product.name},${category},${brand},${product.currentStock},${product.minStockLevel},${product.purchasePrice},${product.sellingPrice},${expiration},${barcode}\n`;
      });

      const reportNames = {
        'low-stock': 'reporte-stock-bajo',
        'expiring': `reporte-por-vencer-${expirationDays}dias`,
        'all-products': 'reporte-inventario-completo'
      };
      filename = `${reportNames[selectedReport]}-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const reportData = selectedReport === 'transactions-summary'
      ? multiTransactions.filter(t => {
          const txDate = new Date(t.date);
          return txDate >= new Date(dateRange.startDate) && txDate <= new Date(dateRange.endDate);
        })
      : getReportData();

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte - El Paradero del Cristiano</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; text-align: center; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #2563eb; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:hover { background-color: #f5f5f5; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          .alert { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>El Paradero del Cristiano</h1>
          <h2>Reporte de ${selectedReport === 'low-stock' ? 'Stock Bajo' :
                         selectedReport === 'expiring' ? 'Productos por Vencer' :
                         selectedReport === 'all-products' ? 'Inventario Completo' :
                         'Resumen de Transacciones'}</h2>
        </div>
        <div class="info">
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Moneda:</strong> ${settings.currency}</p>
          ${selectedReport === 'transactions-summary' ?
            `<p><strong>Periodo:</strong> ${dateRange.startDate} al ${dateRange.endDate}</p>` : ''}
        </div>
    `;

    if (selectedReport === 'transactions-summary') {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th># Transacción</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Total</th>
              <th>Cliente/Proveedor</th>
            </tr>
          </thead>
          <tbody>
      `;

      reportData.forEach((transaction: any) => {
        const type = transaction.type === 'entry' ? 'Entrada' : 'Salida';
        const client = transaction.buyerName || transaction.supplierName || '-';
        htmlContent += `
          <tr>
            <td>${transaction.transactionNumber}</td>
            <td>${transaction.date}</td>
            <td>${type}</td>
            <td>${formatCurrency(transaction.totalAmount)}</td>
            <td>${client}</td>
          </tr>
        `;
      });
    } else {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Precio Venta</th>
              ${selectedReport === 'expiring' ? '<th>Vencimiento</th>' : ''}
            </tr>
          </thead>
          <tbody>
      `;

      (reportData as Product[]).forEach(product => {
        const category = getCategoryById(product.category)?.name || '';
        const isLowStock = product.currentStock < product.minStockLevel;

        htmlContent += `
          <tr>
            <td>${product.name}</td>
            <td>${category}</td>
            <td class="${isLowStock ? 'alert' : ''}">${product.currentStock}</td>
            <td>${product.minStockLevel}</td>
            <td>${formatCurrency(product.sellingPrice)}</td>
            ${selectedReport === 'expiring' ? `<td>${product.expirationDate || '-'}</td>` : ''}
          </tr>
        `;
      });
    }

    htmlContent += `
          </tbody>
        </table>
        <div class="footer">
          <p>© ${new Date().getFullYear()} El Paradero del Cristiano - Sistema de Inventario</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');

    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 250);
      };
    }
  };

  const renderReportContent = () => {
    if (selectedReport === 'transactions-summary') {
      const filteredTransactions = multiTransactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= new Date(dateRange.startDate) && txDate <= new Date(dateRange.endDate);
      });

      const totalEntries = filteredTransactions.filter(t => t.type === 'entry').length;
      const totalExits = filteredTransactions.filter(t => t.type === 'exit').length;
      const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

      return (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Total Entradas</h4>
              <p className="text-2xl font-bold text-green-600">{totalEntries}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Total Salidas</h4>
              <p className="text-2xl font-bold text-red-600">{totalExits}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Monto Total</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    # Transacción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente/Proveedor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transactionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'entry'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'entry' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.buyerName || transaction.supplierName || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const reportData = getReportData();

    if (reportData.length === 0) {
      return (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No hay productos para este reporte</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Precio Venta
              </th>
              {selectedReport === 'expiring' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vencimiento
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.image ? (
                      <img
                        src={URL.createObjectURL(new Blob([product.image], { type: product.imageType }))}
                        alt={product.name}
                        className="h-8 w-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <Package size={16} className="text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCategoryById(product.category)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBrandById(product.brand)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    product.currentStock < product.minStockLevel
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}>
                    {product.currentStock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.minStockLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(product.sellingPrice)}
                </td>
                {selectedReport === 'expiring' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                    {product.expirationDate}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          <FileText className="inline-block mr-2 mb-1" size={24} />
          Reportes
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline-block mr-1 mb-1" size={16} />
                Tipo de Reporte
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low-stock">Productos con Stock Bajo</option>
                <option value="expiring">Productos Próximos a Vencer</option>
                <option value="all-products">Inventario Completo</option>
                <option value="transactions-summary">Resumen de Transacciones</option>
              </select>
            </div>

            {selectedReport === 'expiring' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline-block mr-1 mb-1" size={16} />
                  Días hasta vencimiento
                </label>
                <input
                  type="number"
                  min="1"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 30)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            {selectedReport === 'transactions-summary' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} className="mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} className="mr-2" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              {selectedReport === 'low-stock' && (
                <>
                  <AlertTriangle className="mr-2 text-red-500" size={20} />
                  Productos con Stock Bajo ({lowStockProducts.length})
                </>
              )}
              {selectedReport === 'expiring' && (
                <>
                  <Calendar className="mr-2 text-amber-500" size={20} />
                  Productos Próximos a Vencer ({expiringProducts.length})
                </>
              )}
              {selectedReport === 'all-products' && (
                <>
                  <Package className="mr-2 text-blue-500" size={20} />
                  Inventario Completo ({products.length} productos)
                </>
              )}
              {selectedReport === 'transactions-summary' && (
                <>
                  <TrendingDown className="mr-2 text-blue-500" size={20} />
                  Resumen de Transacciones
                </>
              )}
            </h3>
          </div>

          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
