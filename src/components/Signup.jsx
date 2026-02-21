import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, ArrowRight, ArrowLeft, User, Phone, MapPin, ShieldCheck, Eye, EyeOff, MapPinned, BellRing, Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ACCOUNTS_KEY = 'civic-flow-accounts';

const Signup = ({ onLogin, onUserData }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const [permissions, setPermissions] = useState({
        location: 'pending',
        notification: 'pending',
        camera: 'pending',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateStep1 = () => {
        if (!formData.fullName.trim()) { setError('Full name is required.'); return false; }
        if (!formData.email.trim()) { setError('Email is required.'); return false; }
        if (!/\S+@\S+\.\S+/.test(formData.email)) { setError('Please enter a valid email address.'); return false; }
        if (!formData.phone.trim()) { setError('Phone number is required.'); return false; }

        // Check if email already registered
        const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
        if (accounts.some(a => a.email.toLowerCase() === formData.email.toLowerCase())) {
            setError('An account with this email already exists. Please sign in.');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.address.trim()) { setError('Address is required.'); return false; }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return false; }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const requestLocationPermission = () => {
        if (!('geolocation' in navigator)) { setPermissions(p => ({ ...p, location: 'denied' })); return; }
        setPermissions(p => ({ ...p, location: 'requesting' }));
        navigator.geolocation.getCurrentPosition(
            () => setPermissions(p => ({ ...p, location: 'granted' })),
            () => setPermissions(p => ({ ...p, location: 'denied' })),
            { timeout: 10000 }
        );
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) { setPermissions(p => ({ ...p, notification: 'denied' })); return; }
        setPermissions(p => ({ ...p, notification: 'requesting' }));
        try {
            const result = await Notification.requestPermission();
            setPermissions(p => ({ ...p, notification: result === 'granted' ? 'granted' : 'denied' }));
        } catch { setPermissions(p => ({ ...p, notification: 'denied' })); }
    };

    const requestCameraPermission = async () => {
        if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
            setPermissions(p => ({ ...p, camera: 'denied' }));
            return;
        }
        setPermissions(p => ({ ...p, camera: 'requesting' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(t => t.stop()); // stop immediately, we just need the permission
            setPermissions(p => ({ ...p, camera: 'granted' }));
        } catch {
            setPermissions(p => ({ ...p, camera: 'denied' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            // Save account to localStorage
            const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
            accounts.push({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password,
                createdAt: new Date().toISOString(),
            });
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

            // Update app user state with signup data
            onUserData({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
            });

            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                onLogin('user');
                navigate('/dashboard');
            }, 2000);
        }, 1500);
    };

    const containerStyle = {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: '#0a192f', position: 'relative', overflow: 'hidden',
        fontFamily: "'Outfit', 'Inter', sans-serif",
    };

    const cardStyle = {
        width: '100%', maxWidth: '440px', padding: '36px', borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative', zIndex: 10,
    };

    const inputWrapperStyle = { position: 'relative', marginBottom: '16px' };
    const inputStyle = {
        width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)',
        color: 'white', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s',
    };
    const iconStyle = { position: 'absolute', left: '14px', top: '14px', color: 'rgba(255, 255, 255, 0.3)' };

    const getPermIcon = (s) => {
        if (s === 'granted') return <CheckCircle2 size={20} color="#43a047" />;
        if (s === 'denied') return <XCircle size={20} color="#ef5350" />;
        if (s === 'requesting') return <Loader2 size={20} color="var(--accent)" className="spin" />;
        return null;
    };
    const getPermLabel = (s) => {
        if (s === 'granted') return 'Granted';
        if (s === 'denied') return 'Denied';
        if (s === 'requesting') return 'Requesting...';
        return 'Not set';
    };

    if (success) {
        return (
            <div style={containerStyle}>
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #43a047, #66bb6a)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(67, 160, 71, 0.3)' }}>
                        <ShieldCheck size={40} color="white" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '12px' }}>Account Created!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Welcome to Civic Flow, <strong style={{ color: 'var(--accent)' }}>{formData.fullName}</strong>!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Redirecting to dashboard...</p>
                    <div style={{ marginTop: '24px' }}>
                        <div className="spin" style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(124, 77, 255, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(0, 172, 193, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div style={cardStyle} className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(135deg, #7c4dff 0%, var(--accent) 100%)', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 8px 16px rgba(124, 77, 255, 0.3)' }}>
                        <UserPlus size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Create Account</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>Join the civic community today</p>
                </div>

                {/* Progress — 3 steps */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= s ? 'var(--accent)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                    ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    STEP {step} OF 3 — {step === 1 ? 'PERSONAL INFO' : step === 2 ? 'ADDRESS & PASSWORD' : 'PERMISSIONS'}
                </p>

                {error && (
                    <div style={{ background: 'rgba(229, 57, 53, 0.1)', border: '1px solid rgba(229, 57, 53, 0.3)', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef5350', fontSize: '0.85rem' }}>
                        <ShieldCheck size={16} />{error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div style={inputWrapperStyle}>
                                <User style={iconStyle} size={18} />
                                <input type="text" placeholder="Full Name" style={inputStyle} value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                            </div>
                            <div style={inputWrapperStyle}>
                                <Mail style={iconStyle} size={18} />
                                <input type="email" placeholder="Email Address" style={inputStyle} value={formData.email} onChange={(e) => handleChange('email', e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                            </div>
                            <div style={inputWrapperStyle}>
                                <Phone style={iconStyle} size={18} />
                                <input type="tel" placeholder="Phone Number" style={inputStyle} value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                            </div>
                            <button type="button" onClick={handleNext} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent) 0%, #7c4dff 100%)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px', transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <span>Continue</span><ArrowRight size={18} />
                            </button>
                        </>
                    ) : step === 2 ? (
                        <>
                            <div style={inputWrapperStyle}>
                                <MapPin style={iconStyle} size={18} />
                                <input type="text" placeholder="Your Address" style={inputStyle} value={formData.address} onChange={(e) => handleChange('address', e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                            </div>
                            <div style={inputWrapperStyle}>
                                <Lock style={iconStyle} size={18} />
                                <input type={showPassword ? 'text' : 'password'} placeholder="Create Password" style={inputStyle} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.3)" /> : <Eye size={18} color="rgba(255,255,255,0.3)" />}
                                </button>
                            </div>
                            <div style={inputWrapperStyle}>
                                <Lock style={iconStyle} size={18} />
                                <input type="password" placeholder="Confirm Password" style={inputStyle} value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--accent)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => { setStep(1); setError(''); }} style={{ flex: '0 0 auto', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                    <ArrowLeft size={18} />
                                </button>
                                <button type="button" onClick={handleNext} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent) 0%, #7c4dff 100%)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <span>Continue</span><ArrowRight size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '20px', textAlign: 'center' }}>
                                Civic Flow needs these permissions to work best.
                            </p>

                            {/* Location */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: `1px solid ${permissions.location === 'granted' ? 'rgba(67,160,71,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 172, 193, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPinned size={22} color={permissions.location === 'granted' ? '#43a047' : 'var(--accent)'} />
                                        </div>
                                        <div><p style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}>Location</p><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Find nearby issues</p></div>
                                    </div>
                                    {permissions.location === 'pending' ? (
                                        <button type="button" onClick={requestLocationPermission} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>Allow</button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{getPermIcon(permissions.location)}<span style={{ fontSize: '0.8rem', fontWeight: '600', color: permissions.location === 'granted' ? '#43a047' : '#ef5350' }}>{getPermLabel(permissions.location)}</span></div>
                                    )}
                                </div>
                            </div>

                            {/* Notifications */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: `1px solid ${permissions.notification === 'granted' ? 'rgba(67,160,71,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124, 77, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BellRing size={22} color={permissions.notification === 'granted' ? '#43a047' : '#7c4dff'} />
                                        </div>
                                        <div><p style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}>Notifications</p><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Issue updates & alerts</p></div>
                                    </div>
                                    {permissions.notification === 'pending' ? (
                                        <button type="button" onClick={requestNotificationPermission} style={{ background: '#7c4dff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>Allow</button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{getPermIcon(permissions.notification)}<span style={{ fontSize: '0.8rem', fontWeight: '600', color: permissions.notification === 'granted' ? '#43a047' : '#ef5350' }}>{getPermLabel(permissions.notification)}</span></div>
                                    )}
                                </div>
                            </div>

                            {/* Camera */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${permissions.camera === 'granted' ? 'rgba(67,160,71,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(251, 140, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Camera size={22} color={permissions.camera === 'granted' ? '#43a047' : '#fb8c00'} />
                                        </div>
                                        <div><p style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}>Camera</p><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Capture issue photos</p></div>
                                    </div>
                                    {permissions.camera === 'pending' ? (
                                        <button type="button" onClick={requestCameraPermission} style={{ background: '#fb8c00', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>Allow</button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{getPermIcon(permissions.camera)}<span style={{ fontSize: '0.8rem', fontWeight: '600', color: permissions.camera === 'granted' ? '#43a047' : '#ef5350' }}>{getPermLabel(permissions.camera)}</span></div>
                                    )}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: '12px' }}>Permissions are optional. You can change these later in device settings.</p>

                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '16px', lineHeight: '1.5' }}>
                                By creating an account, you agree to the <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Privacy Policy</span>.
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => { setStep(2); setError(''); }} style={{ flex: '0 0 auto', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                    <ArrowLeft size={18} />
                                </button>
                                <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c4dff 0%, var(--accent) 100%)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }} onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {loading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                                            <span>Creating Account...</span>
                                        </div>
                                    ) : (
                                        <><UserPlus size={18} /><span>Create Account</span></>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
