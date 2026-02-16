import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Menu, X } from 'lucide-react';

const Layout = () => {
    const user = useAuthStore((state) => state.user);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.businessId) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        W
                    </div>
                    <span className="font-bold text-slate-900">WaterBus</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            <div className="flex">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 lg:pl-64 min-h-screen transition-all duration-300">
                    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
