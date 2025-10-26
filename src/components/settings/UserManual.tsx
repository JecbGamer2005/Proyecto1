import React from 'react';
import { Book, Package, ClipboardList, Settings, Bell, Search, Filter, ArrowDown, ArrowUp } from 'lucide-react';

const UserManual: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center px-6 py-4 bg-gray-50">
          <Book className="mr-2 text-blue-500" size={20} />
          <h3 className="text-lg font-medium text-gray-900">Manual de Usuario</h3>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Introducción */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Introducción</h4>
          <p className="text-gray-600">
            El Sistema Digital de Inventario de El Paradero del Cristiano es una aplicación diseñada para ayudarte a gestionar tu inventario de manera eficiente. 
            Este manual te guiará a través de las principales funciones del sistema.
          </p>
        </section>

        {/* Navegación Principal */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Navegación Principal</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Package className="text-blue-500 mt-1" size={20} />
              <div>
                <h5 className="font-medium text-gray-800">Dashboard</h5>
                <p className="text-gray-600">Muestra un resumen general del inventario, incluyendo alertas de stock bajo y productos por vencer.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Package className="text-blue-500 mt-1" size={20} />
              <div>
                <h5 className="font-medium text-gray-800">Inventario</h5>
                <p className="text-gray-600">Gestiona tus productos, añade nuevos items, actualiza existencias y visualiza detalles.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ClipboardList className="text-blue-500 mt-1" size={20} />
              <div>
                <h5 className="font-medium text-gray-800">Transacciones</h5>
                <p className="text-gray-600">Registra entradas y salidas de productos, con historial completo de movimientos.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Settings className="text-blue-500 mt-1" size={20} />
              <div>
                <h5 className="font-medium text-gray-800">Configuración</h5>
                <p className="text-gray-600">Ajusta las preferencias del sistema, incluyendo la moneda y opciones de sincronización.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gestión de Productos */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Gestión de Productos</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Añadir Nuevo Producto</h5>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Haz clic en "Agregar Producto" en la sección de Inventario</li>
                <li>Completa todos los campos requeridos (nombre, descripción, precio, etc.)</li>
                <li>Establece el nivel mínimo de stock para recibir alertas</li>
                <li>Guarda el producto</li>
              </ol>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Buscar y Filtrar</h5>
              <div className="flex items-center space-x-2 mb-2">
                <Search size={16} className="text-gray-500" />
                <span className="text-gray-600">Usa la barra de búsqueda para encontrar productos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-gray-600">Utiliza los filtros para categorizar por tipo, marca, o estado de stock</span>
              </div>
            </div>
          </div>
        </section>

        {/* Transacciones */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Registro de Transacciones</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <ArrowDown className="text-green-500" size={20} />
              <span>Entrada: Para registrar nuevos productos o reposición de stock</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <ArrowUp className="text-red-500" size={20} />
              <span>Salida: Para registrar ventas o productos retirados</span>
            </div>
          </div>
        </section>

        {/* Alertas y Notificaciones */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Alertas y Notificaciones</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Bell className="text-blue-500 mt-1" size={20} />
              <div>
                <h5 className="font-medium text-gray-800">Sistema de Alertas</h5>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Stock Bajo: Notifica cuando un producto está por debajo del nivel mínimo</li>
                  <li>Productos por Vencer: Alerta sobre productos cercanos a su fecha de vencimiento</li>
                  <li>Verificación Diaria: Recordatorio para verificar el inventario diariamente</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Modo Sin Conexión */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Modo Sin Conexión</h4>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-gray-700">
              El sistema funciona incluso sin conexión a internet. Los cambios se guardan localmente y se sincronizarán 
              automáticamente cuando se restablezca la conexión.
            </p>
          </div>
        </section>

        {/* Consejos Útiles */}
        <section>
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Consejos Útiles</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Verifica el inventario diariamente para mantener datos precisos</li>
            <li>Utiliza la función de búsqueda para encontrar productos rápidamente</li>
            <li>Revisa las alertas regularmente para mantener niveles óptimos de stock</li>
            <li>Mantén las descripciones de productos claras y concisas</li>
            <li>Usa notas en las transacciones para registrar detalles importantes</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default UserManual;