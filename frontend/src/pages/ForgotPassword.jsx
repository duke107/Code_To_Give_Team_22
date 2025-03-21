import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, resetAuthSlice } from '../redux/slices/authSlice';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
function ForgotPassword() {
    const [email, setEmail] = React.useState('');
    const dispatch = useDispatch();

    const {
        loading, error, message, user, isAuthenticated
    } = useSelector(state => state.auth);

    const handleForgotPassword = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email));
    }
    useEffect(() => {
        console.log('====================================');
        console.log(message);
        console.log('====================================');
        if (message) {
            toast.success(message);
            setTimeout(() => {
                dispatch(resetAuthSlice());
            }, 100);  // Small delay to allow the toast to appear
        }
        if (error) {
            toast.error(error);
            dispatch(resetAuthSlice());
        }
    }, [dispatch, message, error]);
    
    if (isAuthenticated) {
        return <Navigate to={"/"} />
    }

    return (
        <>
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
                            Forgot Password
                        </h1>
                        <p className="text-gray-800 text-center mb-12">
                            Please enter your email
                        </p>
                        <form onSubmit={handleForgotPassword}>
                            <div className="mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="border-2 mt-5 border-black w-full font-semibold bg-black text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
                                disabled={loading ? true : false}
                            >
                                RESET PASSWORD
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )
}

export default ForgotPassword
