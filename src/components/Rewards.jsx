import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Trophy, Award, History, TrendingUp, User, Earth, Bell, ClipboardList, Send, CircleCheckBig, Eye } from 'lucide-react';
import CivicFlowLogo from './CivicFlowLogo';

const POINTS = { post: 50, verify: 20, solve: 100, accept: 30 };

const Rewards = ({ user, issues }) => {
    const navigate = useNavigate();

    // Calculate dynamic rewards based on actual posts/issues
    const stats = useMemo(() => {
        const myPosts = (issues || []).filter(i => i.user === 'You');
        const myVerified = (issues || []).filter(i => i.verified && i.user === 'You');
        const mySolved = (issues || []).filter(i => (i.status === 'Solved' || i.status === 'Fixed') && (i.user === 'You' || i.acceptedBy === 'You'));
        const myAccepted = (issues || []).filter(i => i.acceptedBy === 'You');

        const postPoints = myPosts.length * POINTS.post;
        const verifyPoints = myVerified.length * POINTS.verify;
        const solvePoints = mySolved.length * POINTS.solve;
        const acceptPoints = myAccepted.length * POINTS.accept;
        const totalPoints = postPoints + verifyPoints + solvePoints + acceptPoints;

        // Generate history from actual issues
        const history = [];
        myPosts.forEach(p => history.push({ id: `post-${p.id}`, action: `Reported: ${p.description.substring(0, 40)}...`, points: POINTS.post, date: p.postedDate || p.time }));
        myAccepted.forEach(p => history.push({ id: `accept-${p.id}`, action: `Accepted task: ${p.description.substring(0, 35)}...`, points: POINTS.accept, date: p.time }));
        mySolved.forEach(p => history.push({ id: `solve-${p.id}`, action: `Resolved: ${p.description.substring(0, 40)}...`, points: POINTS.solve, date: p.fixedDate || p.time }));

        // Dynamic badges based on activity
        const badges = [];
        if (myPosts.length >= 1) badges.push({ id: 1, name: 'First Report', tier: 'Bronze', desc: 'Reported your first issue' });
        if (myPosts.length >= 5) badges.push({ id: 2, name: 'Active Reporter', tier: 'Silver', desc: '5+ issues reported' });
        if (myPosts.length >= 10) badges.push({ id: 3, name: 'Community Voice', tier: 'Gold', desc: '10+ issues reported' });
        if (myAccepted.length >= 1) badges.push({ id: 4, name: 'Helping Hand', tier: 'Bronze', desc: 'Accepted your first task' });
        if (mySolved.length >= 1) badges.push({ id: 5, name: 'Problem Solver', tier: 'Silver', desc: 'Resolved an issue' });
        if (mySolved.length >= 5) badges.push({ id: 6, name: 'Community Hero', tier: 'Gold', desc: 'Resolved 5+ issues' });

        // Next badge info
        let nextBadge = '';
        if (myPosts.length < 1) nextBadge = 'Post 1 issue for "First Report"';
        else if (myPosts.length < 5) nextBadge = `${5 - myPosts.length} more posts for "Active Reporter"`;
        else if (myPosts.length < 10) nextBadge = `${10 - myPosts.length} more posts for "Community Voice"`;
        else if (mySolved.length < 5) nextBadge = `${5 - mySolved.length} more solves for "Community Hero"`;
        else nextBadge = 'All badges earned! 🎉';

        return { myPosts, myVerified, mySolved, myAccepted, totalPoints, history, badges, nextBadge, postPoints, verifyPoints, solvePoints, acceptPoints };
    }, [issues]);

    // Leaderboard with dynamic user position
    const leaderboard = useMemo(() => {
        const others = [
            { id: 'a', name: 'Amit S.', points: 1250 },
            { id: 'b', name: 'Priya K.', points: 1100 },
            { id: 'c', name: 'Rahul R.', points: 420 },
        ];
        const allUsers = [...others, { id: 'me', name: user.fullName, points: stats.totalPoints, isMe: true }];
        allUsers.sort((a, b) => b.points - a.points);
        return allUsers.map((u, i) => ({ ...u, rank: i + 1 }));
    }, [stats.totalPoints, user.fullName]);

    return (
        <div className="container" style={{ padding: '24px 20px 80px' }}>
            <div className="fade-in">
                {/* Points Header */}
                <div style={{ background: 'var(--gradient-header)', borderRadius: '24px', padding: '32px 24px', color: 'white', textAlign: 'center', marginBottom: '24px', boxShadow: '0 12px 24px rgba(79, 70, 229, 0.2)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        <Trophy size={40} color="#ffd700" />
                    </div>
                    <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '4px' }}>{stats.totalPoints}</h1>
                    <p style={{ opacity: 0.9, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Civic Points</p>

                    {/* Points Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><Send size={16} /></div>
                            <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{stats.myPosts.length}</p>
                            <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Posts ({stats.postPoints} pts)</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><Eye size={16} /></div>
                            <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{stats.myAccepted.length}</p>
                            <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Accepted ({stats.acceptPoints} pts)</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><CircleCheckBig size={16} /></div>
                            <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{stats.mySolved.length}</p>
                            <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Solved ({stats.solvePoints} pts)</p>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Badges & Achievements</h3>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                        {stats.badges.length > 0 ? stats.badges.map(badge => (
                            <div key={badge.id} className="glass-card" style={{ padding: '20px 16px', minWidth: '130px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.8)', background: 'white' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: badge.tier === 'Gold' ? 'linear-gradient(135deg, #fff9c4, #fbc02d)' : badge.tier === 'Silver' ? 'linear-gradient(135deg, #f5f5f5, #90a4ae)' : 'linear-gradient(135deg, #ffe0b2, #ff8a65)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={28} color="white" />
                                </div>
                                <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{badge.name}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{badge.desc}</p>
                                <p style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 'bold', marginTop: '4px' }}>{badge.tier}</p>
                            </div>
                        )) : (
                            <div className="glass-card" style={{ padding: '24px', width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Award size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                                <p style={{ fontSize: '0.85rem' }}>Post your first issue to earn a badge!</p>
                            </div>
                        )}
                        <div className="glass-card" style={{ padding: '20px 16px', minWidth: '140px', textAlign: 'center', border: '1px dashed var(--border)', background: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <TrendingUp size={24} color="var(--border)" />
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>{stats.nextBadge}</p>
                        </div>
                    </div>
                </section>

                {/* Leaderboard */}
                <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Leaderboard</h3>
                    <div className="glass-card" style={{ background: 'white', padding: '8px' }}>
                        {leaderboard.map((entry, i) => (
                            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: i === leaderboard.length - 1 ? 'none' : '1px solid #f1f5f9', background: entry.isMe ? 'rgba(79, 70, 229, 0.05)' : 'transparent', borderRadius: entry.isMe ? '12px' : '0' }}>
                                <span style={{ width: '24px', fontWeight: 'bold', fontSize: '0.9rem', color: entry.rank <= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                                </span>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: entry.isMe ? 'var(--primary)' : '#e2e8f0', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color={entry.isMe ? 'white' : '#94a3b8'} />
                                </div>
                                <span style={{ flex: 1, fontWeight: '600', fontSize: '0.9rem' }}>{entry.name} {entry.isMe && <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>(You)</span>}</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.9rem' }}>{entry.points} pts</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Point History */}
                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Point History</h3>
                    {stats.history.length === 0 ? (
                        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'white' }}>
                            <History size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                            <p style={{ fontSize: '0.85rem' }}>No activity yet. Post issues to earn points!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.history.map(h => (
                                <div key={h.id} className="glass-card" style={{ background: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ padding: '10px', background: 'rgba(79, 70, 229, 0.08)', borderRadius: '12px' }}><History size={18} color="var(--primary)" /></div>
                                        <div><p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{h.action}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.date}</p></div>
                                    </div>
                                    <span style={{ color: 'var(--verified)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+{h.points}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', borderTop: '1px solid var(--border)', zIndex: 100 }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Earth size={24} /><span style={{ fontSize: '0.7rem' }}>Feed</span></div>
                <div onClick={() => navigate('/rewards')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}><Trophy size={24} /><span style={{ fontSize: '0.7rem' }}>Rewards</span></div>
                <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Bell size={24} /><span style={{ fontSize: '0.7rem' }}>Alerts</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 8px' }}><CivicFlowLogo size={28} /><span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px' }}>CIVIC FLOW</span></div>
                <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><ClipboardList size={24} /><span style={{ fontSize: '0.7rem' }}>Tasks</span></div>
                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><User size={24} /><span style={{ fontSize: '0.7rem' }}>Profile</span></div>
            </footer>
        </div>
    );
};

export default Rewards;
