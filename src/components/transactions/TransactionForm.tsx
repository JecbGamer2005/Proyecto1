import React, { useState, useEffect } from 'react';
import { Product, Transaction } from '../../types';
import { X, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';

interface TransactionFormProps {
  products: Product[];
  initialProductId?: string;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  products,
  initialProductId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    productId: initialProductId || '',
    type: 'entry',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    createdBy: 'Admin'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Set the selected product when the form initializes or productId changes
  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number = value;
    
    // Convert numeric inputs to numbers
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // If the product ID changed, update the selected product
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      setSelectedProduct(product || null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.productId) newErrors.productId = 'El producto es requerido';
    if (formData.quantity <= 0) newErrors.quantity = 'La cantidad debe ser mayor a 0';
    
    // Additional validation for exit transactions
    if (formData.type === 'exit' && selectedProduct) {
      if (formData.quantity > selectedProduct.currentStock) {
        newErrors.quantity = `Solo hay ${selectedProduct.currentStock} unidades disponibles`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Nueva Transacción</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
              Producto <span className="text-red-500">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${errors.productId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - Stock: {product.currentStock}
                </option>
              ))}
            </select>
            {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId}</p>}
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Transacción <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <label className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.type === 'entry' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                <input
                  type="radio"
                  name="type"
                  value="entry"
                  checked={formData.type === 'entry'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <ArrowDown size={18} className="mr-2 text-green-600" />
                Entrada
              </label>
              
              <label className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.type === 'exit' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                <input
                  type="radio"
                  name="type"
                  value="exit"
                  checked={formData.type === 'exit'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <ArrowUp size={18} className="mr-2 text-red-600" />
                Salida
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full rounded-md shadow-sm ${errors.quantity ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Detalles adicionales..."
            />
          </div>
        </div>
        
        {/* Stock Preview */}
        {selectedProduct && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Vista Previa</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Stock Actual: <span className="font-semibold">{selectedProduct.currentStock}</span></p>
                <p className="text-sm text-gray-600">Stock Mínimo: <span className="font-semibold">{selectedProduct.minStockLevel}</span></p>
              </div>
              <div className="flex items-center">
                <ArrowRight size={18} className="text-gray-500 mx-4" />
                <div>
                  <p className="text-sm text-gray-600">
                    Nuevo Stock: 
                    <span className={`font-semibold ${
                      formData.type === 'entry' 
                        ? 'text-green-600' 
                        : selectedProduct.currentStock - (formData.quantity as number) < selectedProduct.minStockLevel
                          ? 'text-red-600'
                          : 'text-amber-600'
                    }`}>
                      {' '}
                      {formData.type === 'entry' 
                        ? selectedProduct.currentStock + (formData.quantity as number)
                        : selectedProduct.currentStock - (formData.quantity as number)
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;