import { useNavigate, Link } from 'react-router-dom';
import { User, Earth, ArrowRight, UserPlus } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <Earth size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Civic Flow</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Empowering communities through transparent action.
                    </p>
                </div>
                <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Civic Flow Portal</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                        >
                            <User size={20} />
                            Sign In to Portal
                        </button>
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <button
                                type="button"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--primary)',
                                    background: 'rgba(79, 70, 229, 0.05)',
                                    color: 'var(--primary)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '1rem',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'var(--primary)';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)';
                                    e.currentTarget.style.color = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <UserPlus size={20} />
                                Create New Account
                                <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        By signing in, you agree to our terms of civic responsibility.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
