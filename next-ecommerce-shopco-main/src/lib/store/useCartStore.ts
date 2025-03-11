import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product.types';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalQuantities: number;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create(
  persist<CartStore>(
    (set: any) => ({
      items: [],
      totalQuantities: 0,
      addToCart: (product: Product, quantity: number) => 
        set((state: any) => {
          const existingItem = state.items.find((item: any) => item._id === product.id);
          
          if (existingItem) {
            const updatedItems = state.items.map((item: any) =>
              item._id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            return {
              items: updatedItems,
              totalQuantities: state.totalQuantities + quantity
            };
          }
          
          return {
            items: [...state.items, { ...product, quantity }],
            totalQuantities: state.totalQuantities + quantity
          };
        }),
      removeFromCart: (productId: string) =>
        set((state: any) => {
          const itemToRemove = state.items.find((item: any) => item._id === productId);
          return {
            items: state.items.filter((item: any) => item._id !== productId),
            totalQuantities: state.totalQuantities - (itemToRemove?.quantity || 0)
          };
        }),
      updateQuantity: (productId: string, quantity: number) =>
        set((state: any) => {
          const updatedItems = state.items.map((item: any) =>
            item._id === productId
              ? { ...item, quantity }
              : item
          );
          const newTotalQuantities = updatedItems.reduce(
            (sum: number, item: any) => sum + item.quantity, 
            0
          );
          return {
            items: updatedItems,
            totalQuantities: newTotalQuantities
          };
        }),
      clearCart: () => set({ items: [], totalQuantities: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
); 