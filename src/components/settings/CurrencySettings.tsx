import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Wallet, DollarSign, AlertTriangle } from 'lucide-react';

const CurrencySettings: React.FC = () => {
  const { settings, updateSettings, needsDollarRateUpdate } = useSettings();
  const [newRate, setNewRate] = useState((settings.dollarRate ?? 0).toString());
  const [showRateSuccess, setShowRateSuccess] = useState(false);

  const handleRateUpdate = () => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate) && rate > 0) {
      updateSettings({ dollarRate: rate });
      setShowRateSuccess(true);
      setTimeout(() => setShowRateSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center px-6 py-4 bg-gray-50">
          <Wallet className="mr-2 text-blue-500" size={20} />
          <h3 className="text-lg font-medium text-gray-900">Configuración de Moneda</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {needsDollarRateUpdate && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start">
              <AlertTriangle className="text-amber-500 mr-2 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-amber-800 font-medium">Actualización de Tasa Requerida</p>
                <p className="text-sm text-amber-700 mt-1">
                  Por favor, actualice la tasa del dólar para mantener los precios precisos.
                  Última actualización: {settings.lastDollarRateUpdate}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda del Sistema
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value as 'USD' | 'Bs' })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="Bs">Bolívares (Bs)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center mb-4">
              <DollarSign className="mr-2 text-blue-500" size={20} />
              <h4 className="text-lg font-medium text-gray-900">Tasa del Dólar</h4>
            </div>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="dollarRate" className="block text-sm font-medium text-gray-700 mb-2">
                  1 USD = X Bolívares
                </label>
                <input
                  type="number"
                  id="dollarRate"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingrese la tasa actual"
                />
              </div>
              
              <button
                onClick={handleRateUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Actualizar Tasa
              </button>
            </div>
            
            {showRateSuccess && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  Tasa del dólar actualizada exitosamente a Bs. {newRate}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 rounded-md p-4">
            <p className="text-sm text-blue-700">
              Tasa actual: 1 USD = Bs. {(settings.dollarRate ?? 0).toFixed(2)}
              <br />
              Los precios se mostrarán en {settings.currency === 'USD' ? 'dólares' : 'bolívares'} en todo el sistema.
              <br />
              Última actualización: {settings.lastDollarRateUpdate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;