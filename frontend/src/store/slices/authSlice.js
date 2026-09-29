import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('ff_token');
const user = localStorage.getItem('ff_user') ? JSON.parse(localStorage.getItem('ff_user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user, token, isAuthenticated: !!token },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('ff_token', action.payload.token);
      localStorage.setItem('ff_user', JSON.stringify(action.payload.user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('ff_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
