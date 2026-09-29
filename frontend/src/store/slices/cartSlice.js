import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('ff_cart');
const initialItems = saved ? JSON.parse(saved) : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: initialItems },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) existing.quantity = (existing.quantity || 1) + 1;
      else state.items.push({ ...action.payload, quantity: 1 });
      localStorage.setItem('ff_cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      localStorage.setItem('ff_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      localStorage.setItem('ff_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('ff_cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
export default cartSlice.reducer;
