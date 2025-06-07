import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    jwt: null,
    isAuthenticated: false,
    username: null
  },
  reducers: {
    setCredentials: (state, { payload: { user, jwt } }) => {
      state.user = user;
      state.jwt = jwt;
      state.isAuthenticated = true;
      state.username = user.username;
    },
    logout: (state) => {
      state.user = null;
      state.jwt = null;
      state.isAuthenticated = false;
      state.username = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;