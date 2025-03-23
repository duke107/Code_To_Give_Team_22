import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js"
import adminReducer from "./slices/adminSlice.js"

export const store =configureStore({
    reducer:{
        auth: authReducer,
        admin: adminReducer
    }
})