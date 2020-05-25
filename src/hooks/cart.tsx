import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageProducts) {
        await setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const saveProducts = useCallback(async () => {
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(products),
    );
  }, [products]);

  // const searchCart = useCallback(())

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const items = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }
        return product;
      });

      await setProducts(items);
      saveProducts();
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // // TODO ADD A NEW ITEM TO THE CART
      const productItem = { ...product, quantity: 1 };

      const productExist = products.find(p => p.id === product.id);

      if (productExist) {
        await increment(product.id);
        return;
      }

      setProducts([...products, productItem]);
      saveProducts();
    },
    [setProducts, increment, saveProducts, products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const items = products.map(product => {
        if (product.id === id) {
          product.quantity -= 1;
        }
        return product;
      });

      const teste = items.filter(product => product.quantity > 0);

      await setProducts(teste);
      saveProducts();
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
