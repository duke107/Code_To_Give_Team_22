import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

function Donate() {
  const [amount, setAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDonate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
        const res = await axios.post(
            'http://localhost:4000/api/v1/donate',
            { amount, donorName, email, message },
            { withCredentials: true }
          );
          
        setClientSecret(res.data.clientSecret)
        toast.success('Thank you for your donating')
    } catch (err) {
        // setError(err.response?.data?.message || 'Donation failed')
        toast.error(err.response?.data?.message || 'Donation failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Donate</h1>
      <form onSubmit={handleDonate} className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Donate'}
        </button>
      </form>
      {clientSecret && (
  <div className="max-w-md mx-auto mt-6 p-4 bg-green-100 text-green-700 rounded-md">
    <p>Donation intent created successfully.</p>
    <p>Your donation has been initiated.</p>
  </div>
)}
    </div>
  )
}

export default Donate
