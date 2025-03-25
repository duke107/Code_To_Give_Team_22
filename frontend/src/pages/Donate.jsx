import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";

function Donate() {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get eventId from URL if available
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("eventId");

  // Stripe states
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // 1) Create PaymentIntent on backend
  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/donate",
        { amount, donorName, email, message, eventId },
        { withCredentials: true }
      );
      const { data } = res.data;
      // data = { key_id (publishable key), clientSecret, ... }

      // 2) Load Stripe with publishable key
      setStripePromise(loadStripe(data.key_id));
      // 3) Store the clientSecret for confirming payment
      setClientSecret(data.clientSecret);

      toast.success("Donation intent created; please enter your card details.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Donation failed");
    }
    setLoading(false);
  };

  // If we have a clientSecret and a Stripe instance, show card inputs
  if (clientSecret && stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        <PaymentForm clientSecret={clientSecret} />
      </Elements>
    );
  }

  // Donation initialization form
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Donate</h1>
      {eventId && (
        <p className="text-gray-600 mb-2">
          You are donating to event: <strong>{eventId}</strong>
        </p>
      )}
      <form
        onSubmit={handleDonate}
        className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Amount (INR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Donate"}
        </button>
      </form>
    </div>
  );
}

// Minimal PaymentForm using three separate Elements
function PaymentForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      // Get the CardNumberElement reference
      const cardNumberElement = elements.getElement(CardNumberElement);
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            // Use cardNumberElement for all 3 (card, expiry, cvc)
            card: cardNumberElement,
          },
        }
      );

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful! Thank you for your donation.");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Payment failed");
    }
    setProcessing(false);
  };

  // Basic styling for the Card fields
  const cardStyleOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#374151", // Tailwind's gray-700
        "::placeholder": {
          color: "#9CA3AF", // Tailwind's gray-400
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Enter Card Details
      </h2>
      <form
        onSubmit={handleConfirmPayment}
        autoComplete="off"
        className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Card Number</label>
          <div className="w-full px-4 py-2 border rounded-md focus:outline-none">
            <CardNumberElement options={cardStyleOptions} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Expiry Date</label>
          <div className="w-full px-4 py-2 border rounded-md focus:outline-none">
            <CardExpiryElement options={cardStyleOptions} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">CVV</label>
          <div className="w-full px-4 py-2 border rounded-md focus:outline-none">
            <CardCvcElement options={cardStyleOptions} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {processing ? "Processing..." : "Confirm Payment"}
        </button>
      </form>
    </div>
  );
}

export default Donate;