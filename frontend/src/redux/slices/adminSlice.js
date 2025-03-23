import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async function to handle Admin Login
export const adminLogin = createAsyncThunk(
  "admin/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("Sending request to server...");
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/admin/login",
        { email, password }
      );
      console.log("Server Response:", data);

      localStorage.setItem("adminToken", data.token); // Save token
      return data;
    } catch (error) {
      console.error("Error in API call:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: { admin: null, token: localStorage.getItem("adminToken") || null, loading: false, error: null },
  reducers: {
    adminLogout: (state) => {
      state.admin = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("adminToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin; // Store admin data
        state.token = action.payload.token; // Store token
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Ensure error is a string
      });
  },
});

export const { adminLogout } = adminSlice.actions;
export default adminSlice.reducer;
