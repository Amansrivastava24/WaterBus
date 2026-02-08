import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Deliveries from './pages/Deliveries';
import BulkOrders from './pages/BulkOrders';
import Tracker from './pages/Tracker';
import Settings from './pages/Settings';
import BusinessSetup from './pages/BusinessSetup';
import useAuthStore from './store/authStore';

function App() {
    const user = useAuthStore((state) => state.user);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                <Route path="/onboarding" element={user ? <BusinessSetup /> : <Navigate to="/login" />} />

                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/deliveries" element={<Deliveries />} />
                    <Route path="/bulk-orders" element={<BulkOrders />} />
                    <Route path="/tracker" element={<Tracker />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
