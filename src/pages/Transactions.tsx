import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import TransactionList from '../components/transactions/TransactionList';
import MultiTransactionForm from '../components/transactions/MultiTransactionForm';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MultiTransaction } from '../types';

const Transactions: React.FC = () => {
  const { multiTransactions, products, getProductById, addMultiTransaction, updateMultiTransaction, deleteMultiTransaction } = useInventory();
  const { hasPermission } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<MultiTransaction | undefined>(undefined);

  const handleAddClick = () => {
    setEditingTransaction(undefined);
    setShowForm(true);
  };

  const handleEditClick = (transaction: MultiTransaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleFormSubmit = async (transaction: any) => {
    if (editingTransaction) {
      await updateMultiTransaction(editingTransaction.id, transaction);
    } else {
      await addMultiTransaction(transaction);
    }
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>

        {!showForm && hasPermission('add') && (
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-1" />
            Nueva Transacción
          </button>
        )}
      </div>

      {showForm && hasPermission('add') ? (
        <MultiTransactionForm
          products={products}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialTransaction={editingTransaction}
        />
      ) : (
        <TransactionList
          transactions={multiTransactions}
          products={products}
          getProductById={getProductById}
          onDelete={hasPermission('delete') ? deleteMultiTransaction : async () => {}}
          onEdit={handleEditClick}
        />
      )}
    </div>
  );
};

export default Transactions;