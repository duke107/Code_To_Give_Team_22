import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        error: null,
        message: null,
        user: null,
        isAuthenticated: false,
    },
    reducers: {
        registerRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        registerSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
        },
        registerFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        otpVerificationRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        otpVerificationSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        otpVerificationFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        loginRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        loginSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        loginFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        logoutRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        logoutSuccess(state) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.message = state.payload;
        },
        logoutFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    }
});

export const register = (data) => async (dispatch) => {
    dispatch(authSlice.actions.registerRequest());
    await axios
        .post("http://localhost:3000/api/v1/auth/register", data, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            dispatch(authSlice.actions.registerSuccess(res.data));
        })
        .catch((error) => {
            dispatch(authSlice.actions.registerFailed(error.response.data.message));
        });
};

export const otpVerification = (email, otp) => async (dispatch) => {
    dispatch(authSlice.actions.otpVerificationRequest());
    await axios
        .post("http://localhost:3000/api/v1/auth/verify-otp", { email, otp }, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            dispatch(authSlice.actions.otpVerificationSuccess(res.data));
        })
        .catch((error) => {
            dispatch(authSlice.actions.otpVerificationFailed(error.response.data.message));
        });
};

export const login = (data) => async (dispatch) => {
    dispatch(authSlice.actions.loginRequest());
    await axios
        .post("http://localhost:3000/api/v1/auth/login", data, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            dispatch(authSlice.actions.loginSuccess(res.data));
        })
        .catch((error) => {
            dispatch(authSlice.actions.loginFailed(error.response.data.message));
        });
};

export const logout = () => async (dispatch) => {
    dispatch(authSlice.actions.logoutRequest());
    await axios
        .get("http://localhost:3000/api/v1/auth/logout", {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            dispatch(authSlice.actions.logoutSuccess());
        })
        .catch((error) => {
            dispatch(authSlice.actions.logoutFailed(error.response.data.message));
        });
};
