import React, { useState, useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary'
import router from './router'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import { ProtectedRoute } from './components/auth/ProtectedRoute'


const PRODUCTS = [
  { id: 1, name: "Sahara Duffel Bag", price: 120.00, category: "Popular", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600" },
  { id: 2, name: "Titanium Trekking Poles", price: 85.00, category: "New", img: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&w=600" },
  { id: 3, name: "Solar Power Bank", price: 45.00, category: "Discounted", img: "https://images.unsplash.com/photo-1617576621334-92718104863e?auto=format&fit=crop&w=600" },
];

const Navigation = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '1.5rem', background: '#2c3e50', color: 'white', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>VOYAGER</Link>
      <Link to="/search" style={{ color: 'white', textDecoration: 'none' }}>Search</Link>
      <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>

      {/* User Account Icon */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isAuthenticated && user ? (
          <Link to="/account" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{user.username}</span>
          </Link>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3498db', borderRadius: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

const Hero = () => (
  <section>
    {/* BAD CLS: High-res image without dimensions causes massive layout shift */}
    <img 
      src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=4000" 
      alt="Adventure" 
      style={{ width: '100%', objectFit: 'cover' }} 
    />
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Gear Up for the Unknown</h1>
    </div>
  </section>
);

const SearchPage = () => {
  const [query, setQuery] = useState("");
  
  // BAD INP: Synchronous blocking loop during user input
  const results = useMemo(() => {
    const start = Date.now();
    while (Date.now() - start < 200) {} // Blocking the UI thread
    return PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div style={{ padding: '40px' }}>
      <h2>Search Inventory</h2>
      <input 
        type="text" 
        placeholder="Type to search..." 
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '12px', width: '100%', maxWidth: '400px', fontSize: '16px' }}
      />
      <div style={{ marginTop: '20px' }}>
        {results.map(p => <div key={p.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{p.name}</div>)}
      </div>
    </div>
  );
};

const Checkout = () => {
  const [processing, setProcessing] = useState(false);

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      // Intentional Error: Calling a backend that might fail or timeout
      const response = await fetch('http://localhost:5000/api/checkout', { method: 'POST' });
      if (!response.ok) throw new Error("Payment Processor Unavailable");
      alert("Order Confirmed!");
    } catch (e) {
      console.error("Checkout failed", e);
      alert("An error occurred during checkout.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Finalize Your Trip</h2>
      <button onClick={handlePurchase} disabled={processing} style={{ padding: '15px 30px', background: '#e67e22', color: 'white', border: 'none' }}>
        {processing ? "Sending..." : "Buy Now"}
      </button>
    </div>
  );
};

export default function VoyagerApp() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<><Hero />{/* Render product list here */}</>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cart" element={<div style={{padding: '40px'}}><Link to="/checkout">Proceed to Checkout</Link></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}