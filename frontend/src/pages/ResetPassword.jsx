import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { resetAuthSlice, resetPassword } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
function ResetPassword() {
   const [password,setPassword]= useState('');
   const [confirmPassword,setConfirmPassword]=useState('')

   const {token}=useParams();
   const dispatch=useDispatch();
    const navigateTo= useNavigate();
    const {
           loading, error, message, user, isAuthenticated
       } = useSelector(state => state.auth);
   
    const handleResetPassword=(e)=>{
        e.preventDefault();
        const formData=new FormData();
        formData.append("password",password);
        formData.append("confirmPassword",confirmPassword)
        dispatch(resetPassword(formData,token))
    }

   useEffect(() => {
    if (message) {
        toast.success(message);
        
        dispatch(resetAuthSlice());
       navigateTo("/login")
    }
    if (error) {
        toast.error(error);
        dispatch(resetAuthSlice());
    }
}, [dispatch, isAuthenticated, error, loading]);


return (
    <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* LEFT SECTION */}
        <div className="hidden w-full md:w-1/2 bg-black text-white md:flex flex-col items-center justify-center p-8 rounded-tr-[80px] rounded-br-[88px]">
            <div className="text-center h-[450px]">
                <div className="flex justify-center mb-12">
                    <img src='https://samarthanam.org/wp-content/uploads/2023/10/samarthanam-logo.jpg' alt="logo" className="mb-12 h-44 w-auto" />
                </div>
            </div>
        </div>
        {/* RIGHT SECTION */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 relative">
            <Link
                to={"/login"}
                className="border-2 border-black rounded-3xl font-bold w-52 py-2 px-4 fixed top-10 right-10 hover:bg-black hover:text-white transition duration-300 text-center"
            >
                Back
            </Link>
            <div className="max-w-sm w-full">
                <div className="flex justify-center mb-12">
                    <div className="rounded-full flex items-center justify-center">
                        <img src='https://samarthanam.org/wp-content/uploads/2023/10/samarthanam-logo.jpg' alt="logo" className="h-24 w-auto" />
                    </div>
                </div>
                <h1 className="text-4xl font-medium text-center mb-5 overflow-hidden">
                    Reset Password
                </h1>
                <p className="text-gray-800 text-center mb-12">
                    Please enter your new password
                </p>
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={confirmPassword}
                            required
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="border-2 mt-5 border-black w-full font-semibold bg-black text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
                        disabled={loading ? true : false}
                    >
                        UPDATE PASSWORD
                    </button>
                </form>
            </div>
        </div>
    </div>
);

}

export default ResetPassword
