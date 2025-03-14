import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      addToCart: (product, quantity) => {
        const items = get().items;
        
        // Create a unique ID based on product ID and selected options
        const variantId = `${product.id}-${product.selectedColor || ''}-${product.selectedSize || ''}`;
        
        // Check if this exact variant exists
        const existingItemIndex = items.findIndex(item => 
          `${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}` === variantId
        );

        if (existingItemIndex > -1) {
          // Update quantity if variant exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ 
            items: updatedItems,
            totalItems: get().totalItems + quantity 
          });
        } else {
          // Add new variant with variantId
          set({ 
            items: [...items, { ...product, id: variantId, quantity }],
            totalItems: get().totalItems + quantity 
          });
        }
      },
      removeFromCart: (variantId) => {
        const items = get().items;
        const item = items.find(i => i.id === variantId);
        if (item) {
          set({ 
            items: items.filter(i => i.id !== variantId),
            totalItems: get().totalItems - item.quantity 
          });
        }
      },
      updateQuantity: (variantId, quantity) => {
        const items = get().items;
        const item = items.find(i => i.id === variantId);
        if (item) {
          const diff = quantity - item.quantity;
          set({ 
            items: items.map(i => 
              i.id === variantId ? { ...i, quantity } : i
            ),
            totalItems: get().totalItems + diff
          });
        }
      },
      clearCart: () => set({ items: [], totalItems: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
); 