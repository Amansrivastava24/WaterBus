import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Mail, Loader2, Hash, CheckCircle2, LogIn } from 'lucide-react';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    // Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/send-otp', {
                email,
                type: 'login'
            });

            setStep(2);
            setCountdown(60); // 60 seconds before resend

            // Start countdown timer
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and login
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/verify-otp-login', {
                email,
                otp
            });

            login(data);

            if (!data.businessId) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setOtp('');
        await handleSendOTP({ preventDefault: () => { } });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full glass-card p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-primary-200">
                        W
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">
                        {step === 1 ? 'Log in to manage your water business' : 'Enter the OTP sent to your email'}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        1
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        2
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span className="font-bold">!</span> {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <LogIn size={20} />
                                    Send OTP
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center bg-primary-50 p-4 rounded-xl">
                            <p className="text-sm text-primary-600 font-medium">
                                OTP sent to <strong>{email}</strong>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Enter OTP</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary-400 outline-none transition-all text-center text-2xl font-bold tracking-widest"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, ''));
                                        setError('');
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                OTP expires in 10 minutes
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Verify & Login
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            {countdown > 0 ? (
                                <p className="text-sm text-slate-500">
                                    Resend OTP in <span className="font-bold text-primary-600">{countdown}s</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-sm text-primary-600 font-bold hover:underline"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setOtp('');
                                setError('');
                            }}
                            className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                            ← Change Email
                        </button>
                    </form>
                )}

                <p className="text-center mt-8 text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-bold hover:underline">
                        Register Now
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
