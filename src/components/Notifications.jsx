import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Bell, MapPin, Info, CircleCheckBig, Eye, User, Earth, Trophy, ClipboardList, X, ExternalLink, ArrowRight } from 'lucide-react';
import CivicFlowLogo from './CivicFlowLogo';

const Notifications = ({ notifications, setNotifications, issues }) => {
    const navigate = useNavigate();
    const [expandedAlert, setExpandedAlert] = useState(null);

    const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    const getIcon = (type) => {
        switch (type) {
            case 'verify': return <Eye size={20} color="#fb8c00" />;
            case 'confirm': return <CircleCheckBig size={20} color="var(--verified)" />;
            case 'update': return <Info size={20} color="var(--primary)" />;
            default: return <Bell size={20} color="var(--text-muted)" />;
        }
    };

    const nearbyIssues = (issues || []).filter(i => i.status === 'Pending' || i.status === 'Verified');

    const handleAlertClick = (notification) => {
        markRead(notification.id);
        if (notification.postId) {
            const linkedIssue = (issues || []).find(i => i.id === notification.postId);
            setExpandedAlert({ notification, issue: linkedIssue });
        }
    };

    const closeDetail = () => setExpandedAlert(null);

    return (
        <div className="container" style={{ padding: '24px 20px 80px' }}>
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.5rem' }}>Notifications</h1>
                    {notifications.length > 0 && <button onClick={markAllRead} style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>Mark all read</button>}
                </div>

                {/* Nearby Issues Section */}
                <section style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="var(--primary)" /> Nearby Issues</h3>
                    </div>
                    {nearbyIssues.length === 0 ? (
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}><p>No nearby issues right now.</p></div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {nearbyIssues.slice(0, 3).map(issue => (
                                    <div key={issue.id} className="glass-card" onClick={() => {
                                        setExpandedAlert({ notification: null, issue });
                                    }} style={{ padding: '14px 16px', cursor: 'pointer', background: 'white', display: 'flex', gap: '14px', alignItems: 'center' }}>
                                        {issue.image && <img src={issue.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{issue.description.substring(0, 60)}...</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}><MapPin size={12} /> {issue.address || issue.location}</div>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '10px', background: issue.status === 'Verified' ? 'var(--verified)' : '#90a4ae', color: 'white', whiteSpace: 'nowrap' }}>{issue.status}</span>
                                    </div>
                                ))}
                            </div>
                            {/* View All Button */}
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    width: '100%', marginTop: '12px', padding: '12px', borderRadius: '12px',
                                    background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.15)',
                                    color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'; e.currentTarget.style.color = 'var(--primary)'; }}
                            >
                                <ExternalLink size={16} /> View All Issues on Feed
                                <ArrowRight size={14} />
                            </button>
                        </>
                    )}
                </section>

                {/* Alerts Section */}
                <section>
                    <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} color="var(--primary)" /> Alerts</h3>
                    {notifications.length === 0 ? (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Bell size={48} style={{ opacity: 0.15, marginBottom: '16px' }} /><p>No notifications yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notifications.map(n => (
                                <div key={n.id} onClick={() => handleAlertClick(n)} className="glass-card" style={{ padding: '14px 16px', cursor: 'pointer', background: n.unread ? 'rgba(0, 77, 64, 0.04)' : 'white', borderLeft: n.unread ? '3px solid var(--primary)' : '3px solid transparent', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                    <div style={{ padding: '8px', background: '#f1f8e9', borderRadius: '12px', flexShrink: 0, marginTop: '2px' }}>{getIcon(n.type)}</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{n.title}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#90a4ae', marginTop: '6px' }}>{n.time}</p>
                                    </div>
                                    {n.unread && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: '6px' }} />}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Issue Detail Modal */}
            {expandedAlert && expandedAlert.issue && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={closeDetail}>
                    <div className="fade-in" onClick={(e) => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: '480px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.15rem' }}>
                                {expandedAlert.notification ? expandedAlert.notification.title : 'Issue Details'}
                            </h2>
                            <button onClick={closeDetail} style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                        </div>

                        {/* Notification context */}
                        {expandedAlert.notification && (
                            <div style={{ background: '#f1f8e9', padding: '12px', borderRadius: '12px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                {getIcon(expandedAlert.notification.type)}
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: '1.5' }}>{expandedAlert.notification.message}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{expandedAlert.notification.time}</p>
                                </div>
                            </div>
                        )}

                        {/* Issue Image */}
                        {expandedAlert.issue.image && (
                            <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', height: '200px' }}>
                                <img src={expandedAlert.issue.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}

                        {/* Category & Status */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {expandedAlert.issue.category && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79, 70, 229, 0.05)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                                    {expandedAlert.issue.categoryIcon} {expandedAlert.issue.category}
                                </span>
                            )}
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', background: expandedAlert.issue.status === 'Solved' ? 'var(--solved)' : expandedAlert.issue.status === 'Verified' ? 'var(--verified)' : expandedAlert.issue.status === 'In Progress' ? 'var(--in-progress)' : '#90a4ae', color: 'white' }}>
                                {expandedAlert.issue.status}
                            </span>
                        </div>

                        {/* Full Issue Description */}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Issue Description</h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text)' }}>{expandedAlert.issue.description}</p>
                        </div>

                        {/* Location & Details */}
                        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <MapPin size={16} color="var(--primary)" />
                                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{expandedAlert.issue.address || expandedAlert.issue.location}</span>
                            </div>
                            {expandedAlert.issue.address && expandedAlert.issue.location && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '24px' }}>GPS: {expandedAlert.issue.location}</p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingLeft: '24px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted by: <strong>{expandedAlert.issue.user}</strong></span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expandedAlert.issue.postedDate || expandedAlert.issue.time}</span>
                            </div>
                        </div>

                        {/* AI Confidence */}
                        {expandedAlert.issue.aiConfidence && (
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 172, 193, 0.05)', border: '1px dashed rgba(0, 172, 193, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>AI Detection: {expandedAlert.issue.category}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent)' }}>{expandedAlert.issue.aiConfidence}% match</span>
                            </div>
                        )}

                        {/* Action Button */}
                        <button onClick={() => { closeDetail(); navigate('/dashboard'); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none' }}>
                            <ExternalLink size={16} /> Go to Feed
                        </button>
                    </div>
                </div>
            )}

            <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', borderTop: '1px solid var(--border)', zIndex: 100 }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Earth size={22} /><span style={{ fontSize: '0.7rem' }}>Feed</span></div>
                <div onClick={() => navigate('/rewards')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Trophy size={22} /><span style={{ fontSize: '0.7rem' }}>Rewards</span></div>
                <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}><Bell size={24} /><span style={{ fontSize: '0.7rem' }}>Alerts</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 8px' }}><CivicFlowLogo size={28} /><span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px' }}>CIVIC FLOW</span></div>
                <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><ClipboardList size={22} /><span style={{ fontSize: '0.7rem' }}>Tasks</span></div>
                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><User size={22} /><span style={{ fontSize: '0.7rem' }}>Profile</span></div>
            </footer>
        </div>
    );
};

export default Notifications;
