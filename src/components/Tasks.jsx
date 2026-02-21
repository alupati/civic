import { useNavigate } from 'react-router-dom';
import { ClipboardList, MapPin, Clock, CircleCheckBig, Earth, Trophy, Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import CivicFlowLogo from './CivicFlowLogo';

const TIMER_DURATION = 120 * 1000;

const Tasks = ({ tasks, updateStatus, addNotification }) => {
    const navigate = useNavigate();
    const [now, setNow] = useState(Date.now());

    useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

    const getTimer = (acceptedAt) => {
        if (!acceptedAt) return null;
        const elapsed = now - acceptedAt;
        const remaining = Math.max(0, TIMER_DURATION - elapsed);
        return { remaining, mins: Math.floor(remaining / 60000), secs: Math.floor((remaining % 60000) / 1000), percent: (remaining / TIMER_DURATION) * 100 };
    };

    const markFixed = (id) => {
        updateStatus(id, 'Fixed', { fixedDate: new Date().toLocaleDateString() });
        addNotification({ title: 'Fix Reported', message: 'Admin and nearby users have been notified to verify your fix.', type: 'confirm', postId: id });
    };

    return (
        <div className="container" style={{ padding: '24px 16px 80px 16px' }}>
            <div className="fade-in">
                <h1 style={{ marginBottom: '8px' }}>My Tasks</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Issues you've accepted and are resolving.</p>

                {tasks.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>You haven't accepted any tasks yet.</p>
                        <button onClick={() => navigate('/dashboard')} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 'bold', background: 'none' }}>Go to Feed</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {tasks.map(task => (
                            <div key={task.id} className="glass-card" style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', background: task.status === 'Fixed' ? 'var(--verified)' : 'var(--in-progress)', color: 'white' }}>{task.status}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {task.time}</span>
                                </div>

                                {task.category && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79, 70, 229, 0.05)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                                        <span>{task.categoryIcon}</span><span>{task.category.toUpperCase()}</span>
                                    </div>
                                )}

                                <p style={{ fontSize: '0.9rem', marginBottom: '16px', fontWeight: '500', lineHeight: '1.5' }}>{task.description}</p>

                                {task.status === 'In Progress' && task.acceptedAt && (() => {
                                    const timer = getTimer(task.acceptedAt);
                                    return timer ? (
                                        <div style={{ background: timer.percent < 25 ? 'rgba(229,57,53,0.08)' : 'rgba(251,140,0,0.08)', border: `1px solid ${timer.percent < 25 ? 'rgba(229,57,53,0.2)' : 'rgba(251,140,0,0.2)'}`, borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Clock size={16} color={timer.percent < 25 ? '#e53935' : '#fb8c00'} />
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: timer.percent < 25 ? '#e53935' : '#fb8c00' }}>Fix before {timer.mins}:{String(timer.secs).padStart(2, '0')}</span>
                                                <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '4px', height: '4px', overflow: 'hidden', marginTop: '4px' }}>
                                                    <div style={{ width: `${timer.percent}%`, height: '100%', background: timer.percent < 25 ? '#e53935' : '#fb8c00', borderRadius: '4px', transition: 'width 1s linear' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
                                    <MapPin size={14} color="var(--primary)" /> {task.address || task.location}
                                </div>

                                {task.status !== 'Fixed' && task.status !== 'Solved' ? (
                                    <button onClick={() => markFixed(task.id)} className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <CircleCheckBig size={18} /> Mark as Fixed
                                    </button>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(67, 160, 71, 0.1)', color: 'var(--verified)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Waiting for Verification</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', borderTop: '1px solid var(--border)', zIndex: 100 }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Earth size={24} /><span style={{ fontSize: '0.7rem' }}>Feed</span></div>
                <div onClick={() => navigate('/rewards')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Trophy size={24} /><span style={{ fontSize: '0.7rem' }}>Rewards</span></div>
                <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Bell size={24} /><span style={{ fontSize: '0.7rem' }}>Alerts</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 8px' }}><CivicFlowLogo size={28} /><span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px' }}>CIVIC FLOW</span></div>
                <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}><ClipboardList size={24} /><span style={{ fontSize: '0.7rem' }}>Tasks</span></div>
                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><User size={24} /><span style={{ fontSize: '0.7rem' }}>Profile</span></div>
            </footer>
        </div>
    );
};

export default Tasks;
