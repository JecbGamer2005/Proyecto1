import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  Product,
  Transaction,
  MultiTransaction,
  Category,
  Brand
} from '../types';
import { useNetwork } from './NetworkContext';

interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  multiTransactions: MultiTransaction[];
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'syncStatus'>) => Promise<Transaction>;
  addMultiTransaction: (transaction: Omit<MultiTransaction, 'id' | 'transactionNumber' | 'syncStatus'>) => Promise<MultiTransaction>;
  updateMultiTransaction: (id: string, transaction: Omit<MultiTransaction, 'id' | 'transactionNumber' | 'syncStatus'>) => Promise<MultiTransaction>;
  deleteMultiTransaction: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getBrandById: (id: string) => Brand | undefined;
  getProductsExpiringWithinDays: (days: number) => Product[];
  getProductsBelowStock: () => Product[];
  searchProducts: (query: string) => Promise<Product[]>;
  filterProducts: (filters: { 
    categories?: string[]; 
    brands?: string[]; 
    types?: string[]; 
    stockLevel?: 'all' | 'low' | 'normal' | 'high';
    expirationStatus?: 'all' | 'expiring-soon' | 'good';
  }) => Product[];
  pendingSyncCount: number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { syncData } = useNetwork();
  const [loading, setLoading] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  
  // Use Dexie live queries to reactively update when DB changes
  const products = useLiveQuery(() => db.products?.toArray(), [], []) || [];
  const transactions = useLiveQuery(() => db.transactions?.toArray(), [], []) || [];
  const multiTransactions = useLiveQuery(() => db.multiTransactions?.toArray(), [], []) || [];
  const categories = useLiveQuery(() => db.categories?.toArray(), [], []) || [];
  const brands = useLiveQuery(() => db.brands?.toArray(), [], []) || [];
  
  // For pending sync count
  const pendingSyncItems = useLiveQuery(async () => {
    const { products, transactions, multiTransactions } = await db.getPendingSyncItems();
    return products.length + transactions.length + multiTransactions.length;
  }, [], 0);
  
  useEffect(() => {
    if (pendingSyncItems !== undefined) {
      setPendingSyncCount(pendingSyncItems);
    }
  }, [pendingSyncItems]);
  
  useEffect(() => {
    // Mark as loaded once we have data
    if (products.length > 0 && categories.length > 0) {
      setLoading(false);
    }
  }, [products, categories]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const newProduct = await db.addProduct(product);
    // Attempt to sync if we're online
    syncData();
    return newProduct;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const updatedProduct = await db.updateProduct(id, updatedFields);
    // Attempt to sync if we're online
    syncData();
    return updatedProduct;
  };

  const deleteProduct = async (id: string) => {
    await db.deleteProduct(id);
    // Attempt to sync if we're online
    syncData();
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'syncStatus'>) => {
    const newTransaction = await db.addTransaction(transaction);
    // Attempt to sync if we're online
    syncData();
    return newTransaction;
  };

  const addMultiTransaction = async (transaction: Omit<MultiTransaction, 'id' | 'transactionNumber' | 'syncStatus'>) => {
    const newTransaction = await db.addMultiTransaction(transaction);
    // Attempt to sync if we're online
    syncData();
    return newTransaction;
  };

  const updateMultiTransaction = async (id: string, transaction: Omit<MultiTransaction, 'id' | 'transactionNumber' | 'syncStatus'>) => {
    const existingTransaction = await db.multiTransactions.get(id);
    if (!existingTransaction) throw new Error('Transaction not found');

    const updatedTransaction = await db.updateMultiTransaction(id, {
      ...transaction,
      transactionNumber: existingTransaction.transactionNumber
    });

    syncData();
    return updatedTransaction;
  };

  const deleteMultiTransaction = async (id: string) => {
    await db.deleteMultiTransaction(id);
    // Attempt to sync if we're online
    syncData();
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getBrandById = (id: string) => {
    return brands.find(brand => brand.id === id);
  };

  const getProductsExpiringWithinDays = (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return products.filter(product => {
      if (!product.expirationDate) return false;
      const expirationDate = new Date(product.expirationDate);
      return expirationDate <= futureDate && expirationDate >= today;
    });
  };

  const getProductsBelowStock = () => {
    return products.filter(product => product.currentStock < product.minStockLevel);
  };

  const searchProducts = async (query: string) => {
    return await db.searchProducts(query);
  };

  const filterProducts = (filters: {
    categories?: string[];
    brands?: string[];
    stockLevel?: 'all' | 'low' | 'normal' | 'high';
    expirationStatus?: 'all' | 'expiring-soon' | 'good';
  }) => {
    return products.filter(product => {
      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false;
      }

      // Filter by brands
      if (filters.brands && filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) return false;
      }

      // Filter by stock level
      if (filters.stockLevel && filters.stockLevel !== 'all') {
        if (filters.stockLevel === 'low' && product.currentStock >= product.minStockLevel) return false;
        if (filters.stockLevel === 'normal' && (product.currentStock < product.minStockLevel || product.currentStock > product.minStockLevel * 2)) return false;
        if (filters.stockLevel === 'high' && product.currentStock <= product.minStockLevel * 2) return false;
      }

      // Filter by expiration status
      if (filters.expirationStatus && filters.expirationStatus !== 'all') {
        if (!product.expirationDate) return false;
        
        const today = new Date();
        const expirationDate = new Date(product.expirationDate);
        const daysDifference = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filters.expirationStatus === 'expiring-soon' && daysDifference > 30) return false;
        if (filters.expirationStatus === 'good' && daysDifference <= 30) return false;
      }

      return true;
    });
  };

  const value = {
    products,
    transactions,
    multiTransactions,
    categories,
    brands,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addTransaction,
    addMultiTransaction,
    updateMultiTransaction,
    deleteMultiTransaction,
    getProductById,
    getCategoryById,
    getBrandById,
    getProductsExpiringWithinDays,
    getProductsBelowStock,
    searchProducts,
    filterProducts,
    pendingSyncCount
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};