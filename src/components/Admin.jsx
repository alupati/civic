import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BarChart3, Users, CircleCheck, Clock, Eye, MapPin, ChevronLeft, UserCheck, Trash2, CheckCircle2, XCircle, Phone, Home, Wrench } from 'lucide-react';

const Admin = ({ issues, setIssues, updateStatus }) => {
    const navigate = useNavigate();
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [workerFilter, setWorkerFilter] = useState('all');

    const total = issues.length;
    const pending = issues.filter(i => i.status === 'Pending').length;
    const inProgress = issues.filter(i => i.status === 'In Progress' || i.status === 'Verified').length;
    const solved = issues.filter(i => i.status === 'Solved' || i.status === 'Fixed').length;

    // Field workers categorized by WORK TYPE (not department)
    const workers = [
        { id: 1, name: 'Ravi Kumar', workType: 'Road & Pothole Repair', phone: '+91 9876543210', address: 'Madhapur, Hyderabad', status: 'Active', issuesHandled: 5, avatar: '🛠️' },
        { id: 2, name: 'Lakshmi D.', workType: 'Water & Plumbing', phone: '+91 9876543211', address: 'Kukatpally, Hyderabad', status: 'On Duty', issuesHandled: 3, avatar: '💧' },
        { id: 3, name: 'Abdul H.', workType: 'Waste & Sanitation', phone: '+91 9876543212', address: 'Ameerpet, Hyderabad', status: 'On Leave', issuesHandled: 0, avatar: '🗑️' },
        { id: 4, name: 'Priya S.', workType: 'Electrical & Lighting', phone: '+91 9876543213', address: 'Banjara Hills, Hyderabad', status: 'Active', issuesHandled: 7, avatar: '💡' },
        { id: 5, name: 'Suresh M.', workType: 'Road & Pothole Repair', phone: '+91 9876543214', address: 'Gachibowli, Hyderabad', status: 'On Duty', issuesHandled: 4, avatar: '🛠️' },
        { id: 6, name: 'Meena R.', workType: 'Tree & Public Space', phone: '+91 9876543215', address: 'HITEC City, Hyderabad', status: 'Active', issuesHandled: 2, avatar: '🌳' },
        { id: 7, name: 'Venkat K.', workType: 'Traffic & Signals', phone: '+91 9876543216', address: 'Secunderabad', status: 'On Leave', issuesHandled: 1, avatar: '🚦' },
    ];

    const workTypes = ['all', ...new Set(workers.map(w => w.workType))];
    const filteredWorkers = workerFilter === 'all' ? workers : workers.filter(w => w.workType === workerFilter);

    const adminVerify = (id) => updateStatus(id, 'Solved', { solved: true });

    const deleteIssue = (id) => {
        setIssues(prev => prev.filter(i => i.id !== id));
        setDeleteConfirm(null);
    };

    const getStatusStyle = (status) => {
        if (status === 'Active') return { bg: 'rgba(67,160,71,0.1)', color: '#43a047', dot: '#43a047' };
        if (status === 'On Duty') return { bg: 'rgba(33,150,243,0.1)', color: '#1e88e5', dot: '#1e88e5' };
        return { bg: 'rgba(229,57,53,0.1)', color: '#e53935', dot: '#e53935' };
    };

    return (
        <div className="container" style={{ padding: '0 0 24px' }}>
            <div className="fade-in">
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '24px', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '10px' }}><ChevronLeft size={18} /></button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={28} color="#7c4dff" />
                            <div><h2 style={{ color: 'white', fontSize: '1.2rem' }}>Admin Panel</h2><p style={{ fontSize: '0.7rem', opacity: 0.6 }}>Civic Flow Management</p></div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                        {[
                            { icon: <BarChart3 size={20} />, val: total, label: 'Total', bg: 'rgba(124,77,255,0.2)' },
                            { icon: <Clock size={20} />, val: pending, label: 'Pending', bg: 'rgba(251,140,0,0.2)' },
                            { icon: <Eye size={20} />, val: inProgress, label: 'Active', bg: 'rgba(0,172,193,0.2)' },
                            { icon: <CircleCheck size={20} />, val: solved, label: 'Solved', bg: 'rgba(67,160,71,0.2)' },
                        ].map((s, i) => (
                            <div key={i} style={{ padding: '14px 8px', background: s.bg, borderRadius: '14px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
                                <div style={{ opacity: 0.8, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                                <p style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{s.val}</p>
                                <p style={{ fontSize: '0.6rem', opacity: 0.7 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Issue Management */}
                <div style={{ padding: '24px 20px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Issue Management</h3>
                    {issues.length === 0 ? (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}><p>No issues yet.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {issues.map(issue => (
                                <div key={issue.id} className="glass-card" style={{ background: 'white', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    {issue.image && <img src={issue.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{issue.user}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', background: issue.status === 'Solved' ? 'var(--solved)' : issue.status === 'Fixed' ? 'var(--verified)' : issue.status === 'Verified' ? 'var(--verified)' : issue.status === 'In Progress' ? 'var(--in-progress)' : '#90a4ae', color: 'white' }}>{issue.status}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', marginBottom: '8px', lineHeight: '1.4' }}>{issue.description.substring(0, 80)}...</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                            <MapPin size={12} /> {issue.location}
                                        </div>

                                        {/* Verify & Delete buttons for every post */}
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {issue.status !== 'Solved' && (
                                                <button onClick={() => adminVerify(issue.id)} style={{ background: 'var(--primary)', color: 'white', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}>
                                                    <CheckCircle2 size={14} /> Verify & Resolve
                                                </button>
                                            )}
                                            {issue.status === 'Solved' && (
                                                <span style={{ background: 'rgba(67,160,71,0.1)', color: '#43a047', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CheckCircle2 size={14} /> Resolved ✓
                                                </span>
                                            )}
                                            {deleteConfirm === issue.id ? (
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#e53935', fontWeight: '600' }}>Delete?</span>
                                                    <button onClick={() => deleteIssue(issue.id)} style={{ background: '#e53935', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Yes</button>
                                                    <button onClick={() => setDeleteConfirm(null)} style={{ background: '#e0e0e0', color: '#666', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>No</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(issue.id)} style={{ background: 'rgba(229,57,53,0.08)', color: '#e53935', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(229,57,53,0.2)', cursor: 'pointer' }}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Field Workers */}
                <div style={{ padding: '0 20px 24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Field Workers</h3>

                    {/* Filter by work type */}
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
                        {workTypes.map(type => (
                            <button key={type} onClick={() => setWorkerFilter(type)} style={{ whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: workerFilter === type ? 'none' : '1px solid var(--border)', background: workerFilter === type ? '#7c4dff' : 'white', color: workerFilter === type ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {type === 'all' ? '🔹 All' : type}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredWorkers.map(w => {
                            const st = getStatusStyle(w.status);
                            return (
                                <div key={w.id} className="glass-card" style={{ background: 'white', padding: '16px', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                            {w.avatar}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{w.name}</p>
                                                <span style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', background: st.bg, color: st.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                                                    {w.status}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                <Wrench size={13} color="var(--text-muted)" />
                                                <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>{w.workType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact details */}
                                    <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Phone size={13} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{w.phone}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Home size={13} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{w.address}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.issuesHandled} issues handled</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
