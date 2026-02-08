import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    Users,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/analytics/dashboard');
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    const revenueData = {
        labels: stats?.revenueStats.map(s => `Month ${s._id}`) || [],
        datasets: [
            {
                label: 'Revenue',
                data: stats?.revenueStats.map(s => s.totalRevenue) || [],
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const paymentData = {
        labels: ['Paid', 'Pending'],
        datasets: [
            {
                data: [stats?.paymentOverview.paid || 0, stats?.paymentOverview.pending || 0],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0,
            },
        ],
    };

    const quarterlyData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Earnings',
                data: [0, 0, 0, 0], // Placeholder for quarterly calc
                backgroundColor: '#6366f1',
                borderRadius: 8,
            },
        ],
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Business Overview</h1>
                    <p className="text-slate-500 text-lg mt-1 italic">Your enterprise at a glance</p>
                </div>
                <div className="hidden md:block">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Automated Reports Enabled</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    icon={Users}
                    color="blue"
                    trend="+5%"
                />
                <StatCard
                    title="Monthly Income"
                    value={`₹${stats?.paymentOverview.paid || 0}`}
                    icon={Wallet}
                    color="green"
                    trend="+12%"
                />
                <StatCard
                    title="Pending Payments"
                    value={`₹${stats?.paymentOverview.pending || 0}`}
                    icon={BarChart3}
                    color="orange"
                    trend="-2%"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(stats?.paymentOverview.paid + stats?.paymentOverview.pending) || 0}`}
                    icon={TrendingUp}
                    color="purple"
                    trend="+8%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-card p-10 bg-white/40 border border-white/20 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-slate-800">Revenue trajectory</h3>
                        <select className="bg-slate-50 border-none text-sm font-bold text-slate-500 rounded-lg px-3 py-1 focus:ring-0">
                            <option>Last 12 Months</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <Line data={revenueData} options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { grid: { display: false } },
                                x: { grid: { display: false } }
                            }
                        }} />
                    </div>
                </div>
                <div className="glass-card p-10 bg-white/40 border border-white/20 shadow-2xl flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 mb-10 text-center">Cashflow distribution</h3>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-56 h-56">
                            <Pie data={paymentData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="mt-10 space-y-4">
                        <div className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <span className="text-emerald-700 font-bold flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Paid
                            </span>
                            <span className="font-black text-emerald-800">₹{stats?.paymentOverview.paid}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                            <span className="text-amber-700 font-bold flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending
                            </span>
                            <span className="font-black text-amber-800">₹{stats?.paymentOverview.pending}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colors = {
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200',
        green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200',
        orange: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-200',
        purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-200',
    };

    return (
        <div className="glass-card p-8 group hover:-translate-y-2 transition-all duration-300 bg-white/60 border border-white/40 shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform ${colors[color]}`}>
                    <Icon size={28} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {trend} {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
            </div>
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</h3>
            <p className="text-4xl font-black text-slate-900 mt-2">{value}</p>
        </div>
    );
};

export default Dashboard;
