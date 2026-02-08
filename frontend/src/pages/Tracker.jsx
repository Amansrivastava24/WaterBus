import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import useTrackerStore from '../store/trackerStore';
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
    Users,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    isToday as checkIsToday
} from 'date-fns';
import debounce from 'lodash.debounce';

const Tracker = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('today'); // 'today' or 'month'

    const { monthlyLogs, loading, fetchMonthlyLogs, updateLog } = useTrackerStore();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const { data } = await api.get('/customers');
                setCustomers(data);
                if (data.length > 0) setSelectedCustomerId(data[0]._id);
            } catch (err) {
                console.error('Failed to fetch customers');
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomerId) {
            fetchMonthlyLogs(selectedCustomerId, format(currentMonth, 'yyyy-MM'));
        }
    }, [selectedCustomerId, currentMonth, fetchMonthlyLogs]);

    const days = useMemo(() => {
        if (viewMode === 'today') {
            return [new Date()];
        }
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth, viewMode]);

    const selectedCustomer = useMemo(() =>
        customers.find(c => c._id === selectedCustomerId),
        [customers, selectedCustomerId]);

    const filteredCustomers = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm)
    );

    const handleMonthChange = (direction) => {
        setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Tracker</h1>
                    <p className="text-slate-500 font-medium">Quick delivery and payment logging.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setViewMode('today')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${viewMode === 'today' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${viewMode === 'month' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Full Month
                        </button>
                    </div>

                    {/* Month Navigation - Only show in month view */}
                    {viewMode === 'month' && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                            <button onClick={() => handleMonthChange('prev')} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-all hover:scale-110 active:scale-95">
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-2 px-3 font-bold text-slate-700 text-sm">
                                <CalendarIcon size={16} className="text-primary-500" />
                                {format(currentMonth, 'MMM yyyy')}
                            </div>
                            <button onClick={() => handleMonthChange('next')} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-all hover:scale-110 active:scale-95">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Customer Selection Sidebar */}
                <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col h-[750px] shadow-xl border-slate-100">
                    <div className="p-5 border-b border-slate-100 bg-white/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                        {loading && customers.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Loader2 className="animate-spin mx-auto mb-3 text-primary-500" />
                                <span className="font-medium">Loading customers...</span>
                            </div>
                        ) : filteredCustomers.map(customer => (
                            <button
                                key={customer._id}
                                onClick={() => setSelectedCustomerId(customer._id)}
                                className={`w-full p-5 text-left transition-all flex items-center gap-4 group ${selectedCustomerId === customer._id ? 'bg-primary-50/80' : 'hover:bg-slate-50'}`}
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-sm transition-all group-hover:scale-105 ${selectedCustomerId === customer._id ? 'bg-primary-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                    {customer.name?.charAt(0) || '?'}
                                </div>
                                <div className="truncate flex-1">
                                    <div className={`font-bold text-sm tracking-tight ${selectedCustomerId === customer._id ? 'text-primary-800' : 'text-slate-900'}`}>{customer.name}</div>
                                    <div className="text-xs text-slate-500 font-medium">{customer.phone}</div>
                                </div>
                                {selectedCustomerId === customer._id && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-200" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Tracker Area */}
                <div className="lg:col-span-9 flex flex-col gap-6 h-[750px]">
                    {selectedCustomer ? (
                        <>
                            {/* Header Panel */}
                            <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-white via-white to-primary-50/20 border-primary-100 shadow-lg">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary-100">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-inner">
                                            {selectedCustomer.name?.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-black text-primary-500 tracking-[0.2em] mb-1">
                                            {viewMode === 'today' ? 'Today' : format(currentMonth, 'MMMM yyyy')}
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                                        <div className="text-xs text-slate-500 font-medium mt-1">{selectedCustomer.phone}</div>
                                    </div>
                                </div>

                                {viewMode === 'month' && (
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-1">Delivered</div>
                                            <div className="text-3xl font-black text-primary-600 tabular-nums">
                                                {Object.values(monthlyLogs).filter(log => log.deliveryStatus === 'done').length}
                                            </div>
                                        </div>
                                        <div className="w-px h-12 bg-slate-200" />
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] mb-1">Total</div>
                                            <div className="text-3xl font-black text-emerald-600 tabular-nums">
                                                ₹{Object.values(monthlyLogs).reduce((acc, log) => acc + (log.amount || 0), 0)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Logs Table/Cards */}
                            <div className="glass-card flex-1 overflow-hidden flex flex-col shadow-xl border-slate-100 bg-white">
                                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar p-8">
                                    {viewMode === 'today' ? (
                                        <TodayView
                                            day={days[0]}
                                            customerId={selectedCustomerId}
                                            log={monthlyLogs[format(days[0], 'yyyy-MM-dd')]}
                                            onUpdate={(data) => updateLog(selectedCustomerId, format(days[0], 'yyyy-MM-dd'), data)}
                                        />
                                    ) : (
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm shadow-sm border-b border-slate-100">
                                                <tr className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
                                                    <th className="px-8 py-5 w-32">Date</th>
                                                    <th className="px-8 py-5">Delivered</th>
                                                    <th className="px-8 py-5 w-52">Amount (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {days.map((day, idx) => {
                                                    const dateKey = format(day, 'yyyy-MM-dd');
                                                    const log = monthlyLogs[dateKey];
                                                    return (
                                                        <MonthViewRow
                                                            key={idx}
                                                            day={day}
                                                            customerId={selectedCustomerId}
                                                            log={log}
                                                            onUpdate={(data) => updateLog(selectedCustomerId, dateKey, data)}
                                                        />
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card flex-1 flex flex-col items-center justify-center text-center p-16 bg-slate-50/20 border-dashed border-2 border-slate-200">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 border border-slate-100 text-slate-300">
                                <Users size={48} className="text-primary-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a Customer</h3>
                            <p className="text-slate-500 mt-3 max-w-sm font-medium leading-relaxed">Choose a customer from the left to start logging deliveries.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Today's simplified card view
const TodayView = ({ day, customerId, log, onUpdate }) => {
    const updateLog = useTrackerStore(state => state.updateLog);
    const [localAmount, setLocalAmount] = useState(log?.amount || 0);

    useEffect(() => {
        setLocalAmount(log?.amount || 0);
    }, [log?.amount]);

    const debouncedUpdateAmount = useMemo(
        () => debounce((id, date, amount, currentLog) => {
            updateLog(id, date, { ...currentLog, amount: Number(amount) });
        }, 500),
        [updateLog]
    );

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setLocalAmount(val);
        const dateStr = format(day, 'yyyy-MM-dd');
        debouncedUpdateAmount(customerId, dateStr, val, log || { deliveryStatus: 'done' });
    };

    const isDelivered = log?.deliveryStatus === 'done';

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-12">
                <div className="text-sm font-bold text-primary-500 uppercase tracking-widest mb-2">
                    {format(day, 'EEEE')}
                </div>
                <h2 className="text-6xl font-black text-slate-900 tabular-nums">
                    {format(day, 'd')}
                </h2>
                <div className="text-slate-400 font-medium mt-1">
                    {format(day, 'MMMM yyyy')}
                </div>
            </div>

            {/* Delivery Toggle */}
            <div className="glass-card p-10 bg-white border-2 border-slate-100 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">Delivery Status</h3>
                        <p className="text-sm text-slate-500 font-medium">Mark if water was delivered today</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isDelivered}
                            onChange={() => onUpdate({
                                ...(log || {}),
                                deliveryStatus: isDelivered ? 'not_done' : 'done'
                            })}
                        />
                        <div className="w-20 h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[2.5rem] rtl:peer-checked:after:-translate-x-[2.5rem] peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:start-[6px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-primary-500 shadow-inner border-2 border-slate-100"></div>
                    </label>
                </div>

                {isDelivered && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <label className="block mb-3">
                            <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Payment Amount</span>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                                <input
                                    type="number"
                                    value={localAmount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-3xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                />
                            </div>
                        </label>
                    </div>
                )}

                {!isDelivered && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-sm text-slate-400 font-medium italic">Enable delivery to record payment</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Month view compact row
const MonthViewRow = ({ day, customerId, log, onUpdate }) => {
    const updateLog = useTrackerStore(state => state.updateLog);
    const isToday = checkIsToday(day);
    const [localAmount, setLocalAmount] = useState(log?.amount || 0);

    useEffect(() => {
        setLocalAmount(log?.amount || 0);
    }, [log?.amount]);

    const debouncedUpdateAmount = useMemo(
        () => debounce((id, date, amount, currentLog) => {
            updateLog(id, date, { ...currentLog, amount: Number(amount) });
        }, 500),
        [updateLog]
    );

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setLocalAmount(val);
        const dateStr = format(day, 'yyyy-MM-dd');
        debouncedUpdateAmount(customerId, dateStr, val, log || { deliveryStatus: 'done' });
    };

    const isDelivered = log?.deliveryStatus === 'done';

    return (
        <tr className={`group transition-all hover:bg-slate-50/50 ${isToday ? 'bg-primary-50/30' : ''}`}>
            <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${isToday ? 'bg-primary-500 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                        {format(day, 'd')}
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase">{format(day, 'EEE')}</div>
                </div>
            </td>

            <td className="px-8 py-5">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isDelivered}
                        onChange={() => onUpdate({
                            ...(log || {}),
                            deliveryStatus: isDelivered ? 'not_done' : 'done'
                        })}
                    />
                    <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-[26px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[1.375rem] after:w-[1.375rem] after:transition-all peer-checked:bg-primary-500 shadow-inner border border-slate-100"></div>
                    <span className={`ms-3 text-xs font-black uppercase ${isDelivered ? 'text-primary-600' : 'text-slate-400'}`}>
                        {isDelivered ? 'Yes' : 'No'}
                    </span>
                </label>
            </td>

            <td className="px-8 py-5">
                <div className={`relative ${!isDelivered ? 'opacity-30' : ''}`}>
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                    <input
                        type="number"
                        disabled={!isDelivered}
                        value={localAmount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="w-full pl-9 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                    />
                </div>
            </td>
        </tr>
    );
};

export default Tracker;
