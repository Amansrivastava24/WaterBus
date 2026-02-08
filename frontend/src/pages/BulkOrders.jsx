import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Plus, Search, Calendar, CheckCircle, Clock, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

const BulkOrders = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ customerId: '', quantity: '', deliveryDate: '', price: '' });

    const fetchData = async () => {
        try {
            const [ordRes, custRes] = await Promise.all([
                api.get('/bulk-orders'),
                api.get('/customers')
            ]);
            setOrders(ordRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bulk-orders', formData);
            fetchData();
            setShowModal(false);
            setFormData({ customerId: '', quantity: '', deliveryDate: '', price: '' });
        } catch (err) {
            alert('Failed to save bulk order');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/bulk-orders/${id}`, { status });
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this bulk order?')) {
            try {
                await api.delete(`/bulk-orders/${id}`);
                setOrders(orders.filter(o => o._id !== id));
            } catch (err) {
                alert('Failed to delete order');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Bulk Orders</h1>
                    <p className="text-slate-500">Track and manage large quantity water orders.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-100"
                >
                    <Plus size={20} /> Create Bulk Order
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => (
                    <div key={order._id} className="glass-card p-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{order.customerId?.name}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <Package size={14} /> {order.quantity} Units
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                                }`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><Calendar size={14} /> Date:</span>
                                <span className="font-semibold text-slate-700">{format(new Date(order.deliveryDate), 'PPP')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Price:</span>
                                <span className="font-bold text-slate-900 text-lg">₹{order.price}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updateStatus(order._id, 'delivered')}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} /> Mark Delivered
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(order._id)}
                                className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">New Bulk Order</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Price (₹)</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Delivery Date</label>
                                <input
                                    type="date" required
                                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
                                    value={formData.deliveryDate}
                                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-200 mt-4">
                                Save Order
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkOrders;
