import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, User, Camera, Mail, Phone, MapPin, Send, PanelsTopLeft, CircleCheckBig, LogOut, Earth, Trophy, Bell, ClipboardList, X } from 'lucide-react';
import { useState } from 'react';
import CivicFlowLogo from './CivicFlowLogo';

const Profile = ({ user, setUser, onLogout, issues = [] }) => {
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: user.fullName, email: user.email, phone: user.phone, address: user.address });

    // Dynamic stats from actual issues
    const myIssues = issues.filter(i => i.user === 'You');
    const postedCount = myIssues.length;
    const inProgressCount = myIssues.filter(i => i.status === 'In Progress' || i.status === 'Verified' || i.status === 'Fixed').length;
    const solvedCount = myIssues.filter(i => i.status === 'Solved').length;

    const saveChanges = () => {
        setUser(prev => ({ ...prev, ...form }));

        // Also update localStorage account
        const ACCOUNTS_KEY = 'civic-flow-accounts';
        const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
        const idx = accounts.findIndex(a => a.email.toLowerCase() === user.email.toLowerCase());
        if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], ...form };
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        }

        setEditing(false);
    };

    return (
        <div className="container" style={{ padding: '0 0 80px 0' }}>
            <div className="fade-in">
                <div style={{ background: 'var(--gradient-header)', height: '160px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', color: 'white' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}><ChevronLeft size={20} /> Back</button>
                        <h2 style={{ color: 'white', fontSize: '1.2rem' }}>My Profile</h2>
                        <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px', borderRadius: '10px' }}><Settings size={18} /></button>
                    </div>
                </div>

                <div style={{ marginTop: '-60px', padding: '0 20px' }}>
                    <div className="glass-card" style={{ background: 'white', padding: '24px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <User size={40} color="var(--primary)" />
                            </div>
                            <button onClick={() => setEditing(true)} style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', border: '2px solid white', borderRadius: '50%', padding: '6px' }}><Camera size={14} /></button>
                        </div>
                        <h2 style={{ marginBottom: '4px' }}>{user.fullName}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified Citizen • {user.address || 'Location not set'}</p>
                    </div>
                </div>

                <div style={{ padding: '24px 20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Impact Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {[
                            { icon: <Send size={20} color="var(--primary)" />, val: postedCount, label: 'Posted' },
                            { icon: <PanelsTopLeft size={20} color="#fb8c00" />, val: inProgressCount, label: 'In Progress' },
                            { icon: <CircleCheckBig size={20} color="var(--verified)" />, val: solvedCount, label: 'Solved' },
                        ].map((s, i) => (
                            <div key={i} className="glass-card" style={{ background: 'white', padding: '16px 8px', textAlign: 'center' }}>
                                <div style={{ marginBottom: '8px' }}>{s.icon}</div>
                                <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{s.val}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '0 20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Contact Details</h3>
                    <div className="glass-card" style={{ background: 'white', padding: '4px', borderRadius: '20px' }}>
                        {[
                            { icon: <Mail size={18} color="var(--primary)" />, label: 'Email', value: user.email },
                            { icon: <Phone size={18} color="var(--primary)" />, label: 'Phone', value: user.phone },
                            { icon: <MapPin size={18} color="var(--primary)" />, label: 'Address', value: user.address },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>{item.icon}</div>
                                <div style={{ flex: 1 }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</p><p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.value || 'Not set'}</p></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '32px 20px' }}>
                    <button onClick={() => { localStorage.removeItem('civic-flow-current-user'); onLogout(); navigate('/'); }} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(229, 57, 53, 0.05)', border: '1px solid rgba(229, 57, 53, 0.2)', color: '#e53935', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Logout Session
                    </button>
                </div>
            </div>

            {editing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>Edit Profile</h2>
                            <button onClick={() => { setEditing(false); setForm({ fullName: user.fullName, email: user.email, phone: user.phone, address: user.address }); }} style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['fullName', 'email', 'phone', 'address'].map(field => (
                                <div key={field}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>{field === 'fullName' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                    <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
                                </div>
                            ))}
                        </div>
                        <button onClick={saveChanges} style={{ marginTop: '24px', width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem' }}>Save Changes</button>
                    </div>
                </div>
            )}

            <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', borderTop: '1px solid var(--border)', zIndex: 100 }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Earth size={22} /><span style={{ fontSize: '0.7rem' }}>Feed</span></div>
                <div onClick={() => navigate('/rewards')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Trophy size={22} /><span style={{ fontSize: '0.7rem' }}>Rewards</span></div>
                <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Bell size={22} /><span style={{ fontSize: '0.7rem' }}>Alerts</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 8px' }}><CivicFlowLogo size={28} /><span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px' }}>CIVIC FLOW</span></div>
                <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><ClipboardList size={22} /><span style={{ fontSize: '0.7rem' }}>Tasks</span></div>
                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}><User size={22} /><span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Profile</span></div>
            </footer>
        </div>
    );
};

export default Profile;
