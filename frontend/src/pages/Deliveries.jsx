import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Truck, CheckCircle, XCircle, IndianRupee, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Deliveries = () => {
    const [customers, setCustomers] = useState([]);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(true);
    const [deliveries, setDeliveries] = useState({}); // {customerId: deliveryData}
    const [saving, setSaving] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [custRes, delRes] = await Promise.all([
                    api.get('/customers'),
                    api.get(`/deliveries?startDate=${date}&endDate=${date}`)
                ]);
                setCustomers(custRes.data);
                const delMap = {};
                delRes.data.forEach(d => { delMap[d.customerId._id || d.customerId] = d; });
                setDeliveries(delMap);
            } catch (err) {
                console.error('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date]);

    const handleStatusChange = async (customerId, status) => {
        setSaving(customerId);
        const existing = deliveries[customerId] || {};
        const payload = {
            customerId,
            date,
            status,
            quantity: existing.quantity || 1,
            amountPaid: status === 'done' ? (existing.amountPaid || 20) : 0,
            amountDue: status === 'done' ? 0 : 0
        };

        try {
            const { data } = await api.post('/deliveries', payload);
            setDeliveries({ ...deliveries, [customerId]: data });
        } catch (err) {
            alert('Failed to update delivery');
        } finally {
            setSaving(null);
        }
    };

    const updateAmount = async (customerId, field, value) => {
        setSaving(customerId);
        const existing = deliveries[customerId] || { status: 'not_done', quantity: 1 };
        const payload = { ...existing, customerId, date, [field]: Number(value) };

        try {
            const { data } = await api.post('/deliveries', payload);
            setDeliveries({ ...deliveries, [customerId]: data });
        } catch (err) {
            alert('Failed to update amount');
        } finally {
            setSaving(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Deliveries</h1>
                    <p className="text-slate-500">Log water delivery and payments for today.</p>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                    <CalendarIcon size={18} className="text-slate-400 mr-2" />
                    <input
                        type="date"
                        className="border-none focus:ring-0 text-slate-700 font-semibold"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map(customer => {
                    const delivery = deliveries[customer._id] || { status: 'not_done', amountPaid: 0, amountDue: 0, quantity: 1 };
                    return (
                        <div key={customer._id} className="glass-card p-6 relative group overflow-hidden">
                            <div className={`absolute top-0 right-0 w-1 h-full ${delivery.status === 'done' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{customer.name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Truck size={12} /> Daily Route
                                    </p>
                                </div>
                                {saving === customer._id && <Loader2 size={16} className="animate-spin text-primary-500" />}
                            </div>

                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => handleStatusChange(customer._id, 'done')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${delivery.status === 'done'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <CheckCircle size={16} /> Done
                                </button>
                                <button
                                    onClick={() => handleStatusChange(customer._id, 'not_done')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${delivery.status === 'not_done'
                                            ? 'bg-red-50 border-red-400 text-red-600'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <XCircle size={16} /> Not Done
                                </button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Quantity</span>
                                    <input
                                        type="number"
                                        className="w-16 px-2 py-1 bg-slate-50 border-none rounded text-right font-bold text-slate-700"
                                        value={delivery.quantity}
                                        onChange={(e) => updateAmount(customer._id, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Amount Paid (₹)</span>
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 bg-emerald-50/50 border-none rounded text-right font-bold text-emerald-600"
                                        value={delivery.amountPaid}
                                        onChange={(e) => updateAmount(customer._id, 'amountPaid', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Amount Due (₹)</span>
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 bg-amber-50/50 border-none rounded text-right font-bold text-amber-600"
                                        value={delivery.amountDue}
                                        onChange={(e) => updateAmount(customer._id, 'amountDue', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Deliveries;
