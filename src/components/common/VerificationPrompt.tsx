import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AlertTriangle } from 'lucide-react';

const VerificationPrompt: React.FC = () => {
  const { settings, updateSettings, needsVerification } = useSettings();

  if (!needsVerification) return null;

  const handleVerify = () => {
    updateSettings({
      lastInventoryVerification: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Verificación Diaria Requerida
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Para garantizar la precisión del inventario, es necesario verificar los datos diariamente.
              ¿Has verificado el inventario hoy?
            </p>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleVerify}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Sí, he verificado el inventario
          </button>
          <a
            href="/inventory"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Ir al inventario
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerificationPrompt;