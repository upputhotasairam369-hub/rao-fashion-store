import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api, endpoints } from '../api/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const GUEST_CART_KEY = 'raos_guest_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Helper to read guest cart
  const getGuestCart = () => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (items) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving guest cart:', e);
    }
  };

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const response = await api.get(endpoints.cart.get);
        const serverItems = response.data.items || [];
        setCartItems(serverItems);

        // If there were items in guest cart, sync them to server
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            try {
              await api.post(endpoints.cart.add, {
                product_id: item.product_id,
                quantity: item.quantity
              });
            } catch (err) {
              console.warn('Failed to sync guest item:', err);
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
          // Reload updated cart
          const updated = await api.get(endpoints.cart.get);
          setCartItems(updated.data.items || []);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    } else {
      // Load guest cart from local storage
      setCartItems(getGuestCart());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart, isAuthenticated]);

  const addToCart = async (productOrId, quantity = 1, productDetails = null) => {
    try {
      setError(null);
      const productId = typeof productOrId === 'object' ? productOrId.id : productOrId;
      const details = typeof productOrId === 'object' ? productOrId : productDetails;

      if (isAuthenticated) {
        const response = await api.post(endpoints.cart.add, { product_id: productId, quantity });
        setCartItems(response.data.items || []);
        setIsDrawerOpen(true);
        return { success: true };
      } else {
        // Guest cart handling
        const currentGuest = getGuestCart();
        const existingIdx = currentGuest.findIndex(i => i.product_id === productId);

        let updated;
        if (existingIdx > -1) {
          updated = [...currentGuest];
          const newQty = updated[existingIdx].quantity + quantity;
          updated[existingIdx].quantity = newQty;
          updated[existingIdx].subtotal = roundPrice(updated[existingIdx].price * newQty);
        } else {
          const itemPrice = details?.price || 999.0;
          const newItem = {
            product_id: productId,
            name: details?.name || 'Streetwear Item',
            price: itemPrice,
            quantity: quantity,
            subtotal: roundPrice(itemPrice * quantity),
            image_url: details?.image_url || '',
            size: details?.size || 'One Size',
            condition: details?.condition || 'Good'
          };
          updated = [...currentGuest, newItem];
        }

        saveGuestCart(updated);
        setCartItems(updated);
        setIsDrawerOpen(true);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const roundPrice = (num) => Math.round(num * 100) / 100;

  const removeFromCart = async (productId) => {
    try {
      setError(null);
      if (isAuthenticated) {
        await api.delete(endpoints.cart.remove(productId));
      }
      setCartItems(prev => {
        const next = prev.filter(item => item.product_id !== productId);
        if (!isAuthenticated) saveGuestCart(next);
        return next;
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      setError(null);
      if (isAuthenticated) {
        const response = await api.put(endpoints.cart.update(productId), { quantity });
        setCartItems(response.data.items || []);
      } else {
        setCartItems(prev => {
          const next = prev.map(item => {
            if (item.product_id === productId) {
              return {
                ...item,
                quantity,
                subtotal: roundPrice(item.price * quantity)
              };
            }
            return item;
          });
          saveGuestCart(next);
          return next;
        });
      }
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      if (isAuthenticated) {
        await api.delete(endpoints.cart.clear);
      }
      saveGuestCart([]);
      setCartItems([]);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.subtotal || item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.product_id === productId);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    cartItems,
    loading,
    error,
    isDrawerOpen,
    setIsDrawerOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getCartItem,
    clearError,
    isEmpty: cartItems.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};