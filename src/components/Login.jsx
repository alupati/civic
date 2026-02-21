import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';

const ACCOUNTS_KEY = 'civic-flow-accounts';

const Login = ({ onLogin, onUserData }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            // Admin check
            if (role === 'admin') {
                if (email.toLowerCase() !== '24071a6959@vnrvjiet.in') {
                    setError('Access Denied: Only the primary administrator can sign in.');
                    setLoading(false);
                    return;
                }
                onLogin('admin');
                navigate('/admin');
                setLoading(false);
                return;
            }

            // Resident: check if account exists in localStorage
            const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
            const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

            if (!account) {
                setError('Account not found. Please sign up first.');
                setLoading(false);
                return;
            }

            if (account.password !== password) {
                setError('Incorrect password. Please try again.');
                setLoading(false);
                return;
            }

            // Login successful — set user data from stored account
            onUserData({
                fullName: account.fullName,
                email: account.email,
                phone: account.phone,
                address: account.address,
            });
            onLogin('user');
            navigate('/dashboard');
            setLoading(false);
        }, 1200);
    };

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#0a192f',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', 'Inter', sans-serif",
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 10,
    };

    const inputWrapperStyle = { position: 'relative', marginBottom: '16px' };

    const inputStyle = {
        width: '100%',
        padding: '14px 14px 14px 44px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s',
    };

    const btnStyle = {
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, var(--accent) 0%, #7c4dff 100%)',
        color: 'white',
        fontWeight: '700',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '24px',
        transition: 'all 0.3s',
    };

    return (
        <div style={containerStyle}>
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(0, 172, 193, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(124, 77, 255, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--accent) 0%, #7c4dff 100%)', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 8px 16px rgba(0, 172, 193, 0.3)' }}>
                        <LogIn size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Civic Flow</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Sign in to continue</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(229, 57, 53, 0.1)', border: '1px solid rgba(229, 57, 53, 0.3)', borderRadius: '12px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef5350', fontSize: '0.85rem' }}>
                        <ShieldCheck size={18} />{error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', padding: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', marginBottom: '24px' }}>
                        <button type="button" onClick={() => setRole('user')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: 'none', transition: 'all 0.3s', background: role === 'user' ? 'var(--accent)' : 'transparent', color: role === 'user' ? 'white' : 'rgba(255, 255, 255, 0.4)' }}>
                            <User size={18} /><span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Resident</span>
                        </button>
                        <button type="button" onClick={() => setRole('admin')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: 'none', transition: 'all 0.3s', background: role === 'admin' ? '#7c4dff' : 'transparent', color: role === 'admin' ? 'white' : 'rgba(255, 255, 255, 0.4)' }}>
                            <ShieldCheck size={18} /><span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin</span>
                        </button>
                    </div>

                    <div style={inputWrapperStyle}>
                        <Mail style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255, 255, 255, 0.3)' }} size={18} />
                        <input type="email" placeholder="Email Address" required style={inputStyle} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                    </div>

                    <div style={inputWrapperStyle}>
                        <Lock style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255, 255, 255, 0.3)' }} size={18} />
                        <input type="password" placeholder="Password" required style={inputStyle} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                    </div>

                    <button type="submit" disabled={loading} style={btnStyle} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>New to Civic Flow?</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <button type="button" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(0, 172, 193, 0.4)', background: 'rgba(0, 172, 193, 0.08)', color: 'var(--accent)', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s' }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 172, 193, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 172, 193, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <User size={18} />
                            <span>Create an Account</span>
                            <ArrowRight size={16} />
                        </button>
                    </Link>
                </div>

                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.25)' }}>Sign up first, then use your credentials to sign in</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
