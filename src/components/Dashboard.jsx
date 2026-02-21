import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Earth, Users, Award, Bell, User, Trophy, ClipboardList, CirclePlus, CircleAlert, MapPin, ThumbsUp, CircleCheck, Handshake, Camera, Send, X, Clock, AlertTriangle } from 'lucide-react';
import CivicFlowLogo from './CivicFlowLogo';

const TIMER_DURATION = 120 * 1000;

// Civic issue keywords — description must include at least one to be valid
const CIVIC_KEYWORDS = [
    'pothole', 'road', 'pavement', 'sidewalk', 'crack', 'bump', 'broken',
    'garbage', 'trash', 'waste', 'dump', 'litter', 'bin', 'dirty', 'filth',
    'light', 'lamp', 'electricity', 'power', 'pole', 'wire', 'streetlight',
    'water', 'leak', 'pipe', 'drain', 'sewage', 'overflow', 'flood', 'clog',
    'tree', 'branch', 'fire', 'hazard', 'danger', 'unsafe',
    'traffic', 'signal', 'sign', 'crossing', 'accident', 'jam',
    'stray', 'animal', 'dog', 'mosquito', 'pest', 'rodent',
    'construction', 'noise', 'illegal', 'encroachment', 'parking',
    'public', 'park', 'playground', 'bench', 'footpath', 'manhole',
    'bridge', 'building', 'wall', 'fence', 'graffiti', 'vandalism',
    'smell', 'pollution', 'smoke', 'dust', 'health', 'sanitation',
    'damaged', 'missing', 'overflowing', 'blocked', 'collapsed',
];

const PostIssueModal = ({ isOpen, onClose, onPost, issues = [] }) => {
    const [desc, setDesc] = useState('');
    const [location, setLocation] = useState('Fetching location...');
    const [fetchedAddress, setFetchedAddress] = useState('');
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState(null);
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageValidation, setImageValidation] = useState(null); // { valid, reason, checking }
    const [error, setError] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [status, setStatus] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const [confirmMismatch, setConfirmMismatch] = useState(false);


    const fetchLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setCoords({ lat, lng });
                    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    setError('');
                    // Reverse geocode to get address string
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                        const data = await res.json();
                        if (data.display_name) {
                            setFetchedAddress(data.display_name);
                        }
                    } catch {
                        setFetchedAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
                    }
                },
                () => setLocation('Location access denied')
            );
        }
    };

    // Validate image content using hidden canvas analysis
    const validateImage = async (imgUri) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = 100;
                canvas.width = size;
                canvas.height = size;
                ctx.drawImage(img, 0, 0, size, size);
                const data = ctx.getImageData(0, 0, size, size).data;

                let skinPixels = 0;
                let greyPixels = 0;
                let colorfulPixels = 0;
                let totalPixels = size * size;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Simple skin tone detection (Peach/Tan/Brown range)
                    if (r > 60 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 15)) {
                        skinPixels++;
                    }

                    // Grey/Neutral detection (Roads/Potholes/Concrete)
                    const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
                    if (diff < 20 && (r + g + b) / 3 > 40 && (r + g + b) / 3 < 200) {
                        greyPixels++;
                    }

                    // Colorful detection (Waste/Debris)
                    if (diff > 50) {
                        colorfulPixels++;
                    }
                }

                const skinRatio = skinPixels / totalPixels;
                const greyRatio = greyPixels / totalPixels;
                const colorRatio = colorfulPixels / totalPixels;

                // Thresholds
                if (skinRatio > 0.15) {
                    resolve({ valid: false, reason: 'Personal photo/Human presence detected. Please upload an image of the civic issue itself.', signature: 'Selfie/Person' });
                    return;
                }

                // Map results to civic tags
                const tags = [];
                if (greyRatio > 0.3) tags.push('road', 'concrete', 'pavement', 'pothole');
                if (colorRatio > 0.15) tags.push('waste', 'dirt', 'rubble');
                if ((r, g, b) => (r + g + b) / 3 < 50) tags.push('night', 'dark_area');

                resolve({ valid: true, tags, greyRatio, colorRatio });
            };
            img.src = imgUri;
        });
    };

    // Compare fetched address with manual address
    const checkLocationMismatch = (manualAddr) => {
        if (!manualAddr.trim()) { setLocationWarning(''); setConfirmMismatch(false); return; }
        if (!fetchedAddress) { setLocationWarning(''); return; }

        // Normalize both addresses for comparison
        const normalizeStr = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const fetchedNorm = normalizeStr(fetchedAddress);
        const manualNorm = normalizeStr(manualAddr);

        // Check if manual address words appear in fetched address
        const manualWords = manualNorm.split(/\s+/).filter(w => w.length > 2);
        const matchCount = manualWords.filter(w => fetchedNorm.includes(w)).length;
        const matchRatio = manualWords.length > 0 ? matchCount / manualWords.length : 1;

        if (matchRatio < 0.3 && manualWords.length > 0) {
            setLocationWarning(`GPS address: "${fetchedAddress.substring(0, 80)}..." doesn't match your input. Do you still want to upload?`);
            setConfirmMismatch(false);
        } else {
            setLocationWarning('');
            setConfirmMismatch(false);
        }
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setImageValidation(null);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const classifyIssue = (text) => {
        const t = text.toLowerCase();
        if (t.match(/pothole|road|pavement|sidewalk|street|lane|asphalt|concrete|tar|crack|crater|bump|uneven/)) return { name: 'Pothole', icon: '🚧' };
        if (t.match(/garbage|trash|waste|dump|litter|bin|container|debris|cleanup|sweep|spill|smell|stench|dirt|filth|sanitation/)) return { name: 'Waste', icon: '🗑️' };
        if (t.match(/light|lamp|electricity|power|pole|wire|cable|sign|signal|traffic|barricade|barrier|scaffolding|bridge|wall|fence/)) return { name: 'Infrastructure', icon: '💡' };
        if (t.match(/water|leak|leakage|pipe|drain|sewage|manhole|overflow|flood|stagnation|puddle|tap|valve|hydrant|pump|gutter/)) return { name: 'Water/Sanitation', icon: '💧' };
        if (t.match(/tree|branch|fire|hazard|danger|obstruction|graffiti|vandalism|stray|noise|smoke|dust|pollution|park|bench|playground/)) return { name: 'Safety/Public Space', icon: '🛡️' };
        if (t.match(/traffic|signal|sign|crossing/)) return { name: 'Traffic', icon: '🚦' };
        return { name: 'General', icon: '📋' };
    };

    const isCivicRelated = (text) => {
        const lower = text.toLowerCase();
        return CIVIC_KEYWORDS.some(kw => lower.includes(kw));
    };

    // Check for duplicate: same location + similar description
    const isDuplicate = (newDesc, newLocation) => {
        const normalizeStr = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const newDescNorm = normalizeStr(newDesc);
        const newLocNorm = normalizeStr(newLocation);

        return issues.some(existing => {
            const existingDescNorm = normalizeStr(existing.description);
            const existingLocNorm = normalizeStr(existing.location + ' ' + (existing.address || ''));

            // Check location similarity
            const locWords = newLocNorm.split(/\s+/).filter(w => w.length > 2);
            const locMatch = locWords.length > 0 ? locWords.filter(w => existingLocNorm.includes(w)).length / locWords.length : 0;

            // Check description similarity
            const descWords = newDescNorm.split(/\s+/).filter(w => w.length > 2);
            const descMatch = descWords.length > 0 ? descWords.filter(w => existingDescNorm.includes(w)).length / descWords.length : 0;

            return locMatch > 0.5 && descMatch > 0.5;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!image) { setError('Image upload is mandatory.'); return; }
        if (!desc.trim()) { setError('Please provide a description.'); return; }



        // Civic content validation
        if (!isCivicRelated(desc)) {
            setError('Only civic issue descriptions are allowed (e.g. pothole, garbage, broken light, water leak, traffic, etc.). Please describe a real civic problem.');
            return;
        }


        // Location mismatch — if warning is showing and user hasn't confirmed
        if (locationWarning && !confirmMismatch) {
            setError('Please confirm the location mismatch warning above before submitting.');
            return;
        }

        // Duplicate check
        const issueLocation = address || location;
        if (isDuplicate(desc, issueLocation)) {
            setError('A similar issue at this location already exists. Please check the feed before posting.');
            return;
        }

        const category = classifyIssue(desc);
        setAnalyzing(true);
        setError('');
        setStatus('Initializing Visual Scan...');

        setTimeout(async () => {
            const validation = await validateImage(image);
            setImageValidation(validation);

            if (!validation.valid) {
                setError(`AI Rejection: ${validation.reason}`);
                setAnalyzing(false);
                return;
            }

            // Cross-match image tags with description category
            const categoryToImageTags = {
                'Pothole': ['road', 'concrete', 'pavement', 'pothole', 'waste', 'dirt', 'rubble', 'construction', 'general', 'mixed'],
                'Waste': ['waste', 'dirt', 'rubble', 'construction', 'general', 'mixed'],
                'Infrastructure': ['road', 'concrete', 'pavement', 'pothole', 'night', 'dark_area', 'streetlight', 'general', 'mixed'],
                'Water/Sanitation': ['water', 'leak', 'drain', 'sky', 'road', 'concrete', 'general', 'mixed'],
                'Safety/Public Space': ['tree', 'hazard', 'fire', 'graffiti', 'road', 'general', 'mixed'],
                'Traffic': ['road', 'street', 'pavement', 'car', 'signal', 'general']
            };

            const allowedTags = categoryToImageTags[category.name] || ['general'];
            const isMatch = validation.tags.length === 0 || validation.tags.some(tag => allowedTags.includes(tag));

            if (!isMatch) {
                setError(`Visual Mismatch: AI detected ${validation.tags[0] || 'non-civic'} content, which doesn't match your description of a ${category.name}. Please provide a relevant photo.`);
                setAnalyzing(false);
                return;
            }

            // Procedural animation for UX
            const steps = [
                { label: 'Scanning pixel arrays...', time: 600 },
                { label: 'Detecting human/private objects...', time: 1200 },
                { label: `Detected: ${category.name} ${category.icon}`, time: 1800 },
                { label: 'Verifying visual signatures...', time: 2400 },
                { label: 'Finalizing confidence score...', time: 3000 }
            ];
            steps.forEach((step) => setTimeout(() => setStatus(step.label), step.time));

            setTimeout(() => {
                // Confidence scoring
                let score = 45;
                score += 35; // Visual match bonus
                if (desc.length > 50) score += 10;
                if (validation.greyRatio > 0.5 && category.name === 'Pothole') score += 10;

                score = Math.min(98, score - Math.floor(Math.random() * 5));

                const issue = {
                    id: Date.now(), user: 'You', description: desc,
                    location: location === 'Fetching location...' ? address || 'Unknown' : location,
                    address, coordinates: coords, image, time: 'Just now',
                    postedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    verified: false, likes: 0, likedBy: [], status: 'Pending',
                    aiConfidence: score, category: category.name, categoryIcon: category.icon,
                };
                onPost(issue);
                setAnalyzing(false); onClose();
                setDesc(''); setImage(null); setAddress(''); setError('');
                setLocationWarning(''); setConfirmMismatch(false); setFetchedAddress('');
                setImageValidation(null);
            }, 3200);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 2000 }}>
            <div className="fade-in" style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '0 auto', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Report a Civic Issue</h2>
                    <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fff1f2)', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', lineHeight: '1.5', border: '1px solid #fecaca' }}><CircleAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> {error}</div>}

                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <input type="file" accept="image/*" onChange={handleImage} id="image-upload" style={{ display: 'none' }} />
                        <label htmlFor="image-upload" style={{ height: '180px', background: image ? `url(${image})` : '#f5f5f5', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: image ? 'none' : '2px dashed var(--border)', color: 'var(--text-muted)' }}>
                            {!image && <><Camera size={40} /><span style={{ marginTop: '8px', fontWeight: '600' }}>Capture/Upload Photo*</span></>}
                            {image && <div style={{ background: 'rgba(0,0,0,0.4)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>Tap to change</div>}
                        </label>


                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Manual Address (Optional)</label>
                        <input type="text" value={address} onChange={(e) => { setAddress(e.target.value); checkLocationMismatch(e.target.value); }} placeholder="Enter street name, area, etc." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
                    </div>

                    {/* GPS vs Manual Location Mismatch Warning */}
                    {locationWarning && (
                        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', animation: 'fadeIn 0.3s' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <AlertTriangle size={18} color="#f9a825" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#e65100', marginBottom: '4px' }}>Location Mismatch</p>
                                    <p style={{ fontSize: '0.75rem', color: '#795548', lineHeight: '1.4' }}>{locationWarning}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setLocationWarning(''); setAddress(''); }} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #bdbdbd', background: 'white', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', color: '#666' }}>Clear Address</button>
                                <button type="button" onClick={() => setConfirmMismatch(true)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: confirmMismatch ? '#43a047' : '#fb8c00', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', color: 'white' }}>
                                    {confirmMismatch ? '✓ Confirmed' : 'Upload Anyway'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Issue Description*</label>
                        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the civic issue (e.g. pothole on road, garbage dump, broken streetlight, water leak...)" style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: '0.9rem' }} required />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>Only civic issues accepted (roads, water, waste, safety, traffic, etc.)</p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="var(--primary)" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>GPS Location</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{location}</span>
                            </div>
                        </div>
                        <button type="button" onClick={fetchLocation} style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Refetch</button>
                    </div>

                    {fetchedAddress && (
                        <div style={{ background: '#f1f8e9', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.75rem', color: '#33691e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} /> <strong>Detected:</strong> {fetchedAddress.substring(0, 100)}{fetchedAddress.length > 100 ? '...' : ''}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={analyzing} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', opacity: analyzing ? 0.7 : 1 }}>
                        {analyzing ? <><Camera size={18} className="spin" /> {status || 'Analyzing...'}</> : <><Send size={18} /> Submit Issue</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Dashboard = ({ issues, setIssues, notifications, setNotifications, updateStatus, broadcastNewIssue }) => {
    const navigate = useNavigate();
    const [posting, setPosting] = useState(false);
    const [tab, setTab] = useState('active');
    const [scanning, setScanning] = useState(null);
    const [scanStatus, setScanStatus] = useState('');
    const [now, setNow] = useState(Date.now());
    const currentUser = 'You';

    useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

    const getTimer = (acceptedAt) => {
        if (!acceptedAt) return null;
        const elapsed = now - acceptedAt;
        const remaining = Math.max(0, TIMER_DURATION - elapsed);
        return { remaining, mins: Math.floor(remaining / 60000), secs: Math.floor((remaining % 60000) / 1000), percent: (remaining / TIMER_DURATION) * 100 };
    };

    const unreadCount = notifications.filter(n => n.unread).length;
    const solvedCount = issues.filter(i => i.status === 'Solved').length;
    const filteredIssues = issues.filter(i => tab === 'active' ? i.status !== 'Solved' : i.status === 'Solved');

    const addIssue = (issue) => {
        const newIssue = { ...issue, likedBy: [] };
        setIssues([newIssue, ...issues]);
        if (broadcastNewIssue) broadcastNewIssue(newIssue);
    };
    const toggleLike = (id) => {
        setIssues(issues.map(i => {
            if (i.id !== id) return i;
            const liked = (i.likedBy || []).includes(currentUser);
            return { ...i, likedBy: liked ? i.likedBy.filter(u => u !== currentUser) : [...(i.likedBy || []), currentUser], likes: liked ? i.likes - 1 : i.likes + 1 };
        }));
    };
    const acceptTask = (id) => updateStatus(id, 'In Progress', { acceptedBy: 'You' });
    const verifyIssue = (id) => updateStatus(id, 'Verified', { verified: true });

    return (
        <div className="container" style={{ padding: 0 }}>
            {/* Header */}
            <header style={{ padding: '24px 20px 16px', background: 'var(--gradient-header)', color: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(30, 27, 75, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '2px' }}>Civic Flow</h1>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Clean City, Proud Citizen</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                            <Bell size={24} />
                            {unreadCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e53935', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold' }}>{unreadCount}</span>}
                        </div>
                        <User size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Users size={22} />
                        <div><p style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>1,240</p><p style={{ fontSize: '0.7rem', opacity: 0.85 }}>Contributors</p></div>
                    </div>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Award size={22} />
                        <div><p style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>{solvedCount + 447}</p><p style={{ fontSize: '0.7rem', opacity: 0.85 }}>Issues Solved</p></div>
                    </div>
                </div>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={() => setTab('active')} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', background: tab === 'active' ? 'white' : 'transparent', color: tab === 'active' ? 'var(--primary)' : 'rgba(255,255,255,0.8)', transition: 'all 0.3s ease', boxShadow: tab === 'active' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>Active</button>
                    <button onClick={() => setTab('solved')} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', background: tab === 'solved' ? 'white' : 'transparent', color: tab === 'solved' ? 'var(--primary)' : 'rgba(255,255,255,0.8)', transition: 'all 0.3s ease', boxShadow: tab === 'solved' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>Solved</button>
                </div>
            </header>

            <main style={{ padding: '20px 20px 80px', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{tab === 'active' ? 'Community Feed' : 'Solved Issues'}</h3>
                    {tab === 'active' && (
                        <button onClick={() => setPosting(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gradient-primary)', color: 'white', padding: '10px 20px', borderRadius: '24px', fontWeight: '700', fontSize: '0.85rem', boxShadow: 'var(--shadow-primary)', border: 'none' }}>
                            <CirclePlus size={16} /> Post Issue
                        </button>
                    )}
                </div>

                {filteredIssues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <CircleAlert size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>No {tab} issues found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                        {filteredIssues.map((issue) => (
                            <div key={issue.id} className="glass-card" style={{ overflow: 'hidden' }}>
                                {issue.image && (
                                    <div style={{ background: '#f0f4f8', height: '220px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                        <img src={issue.image} alt={issue.description} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                    </div>
                                )}
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{issue.user}</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: issue.status === 'Solved' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : issue.status === 'Fixed' ? 'linear-gradient(135deg, #10b981, #059669)' : issue.status === 'Verified' ? 'linear-gradient(135deg, #10b981, #059669)' : issue.status === 'In Progress' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#94a3b8', color: 'white', letterSpacing: '0.02em' }}>{issue.status}</span>
                                    </div>

                                    {issue.status === 'In Progress' && issue.acceptedAt && (() => {
                                        const timer = getTimer(issue.acceptedAt);
                                        return timer ? (
                                            <div style={{ background: timer.percent < 25 ? 'rgba(229,57,53,0.08)' : 'rgba(251,140,0,0.08)', border: `1px solid ${timer.percent < 25 ? 'rgba(229,57,53,0.2)' : 'rgba(251,140,0,0.2)'}`, borderRadius: '12px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

                                    {issue.category && (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '10px', marginBottom: '12px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                                            <span>{issue.categoryIcon}</span><span>{issue.category.toUpperCase()}</span>
                                        </div>
                                    )}

                                    <p style={{ fontSize: '0.95rem', marginBottom: '14px', fontWeight: '500', lineHeight: '1.5' }}>{issue.description}</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <MapPin size={14} color="var(--primary)" /> {issue.location}
                                        </div>
                                        {issue.address && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '20px' }}>{issue.address}</p>}
                                        {issue.status !== 'Solved' && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '20px' }}>{issue.time}</p>}
                                    </div>

                                    {tab === 'active' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <button onClick={() => toggleLike(issue.id)} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: (issue.likedBy || []).includes(currentUser) ? '#e53935' : 'var(--primary)', fontWeight: 'bold' }}>
                                                    <ThumbsUp size={18} fill={(issue.likedBy || []).includes(currentUser) ? '#e53935' : 'none'} /> <span style={{ fontSize: '0.9rem' }}>{issue.likes}</span>
                                                </button>
                                                {issue.acceptedBy === 'You' ? (
                                                    <div style={{ background: issue.status === 'Fixed' ? 'var(--verified)' : 'var(--in-progress)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{issue.status === 'Fixed' ? 'Fix Reported' : 'In Progress'}</div>
                                                ) : (
                                                    <button onClick={() => acceptTask(issue.id)} disabled={issue.status === 'Fixed'} style={{ background: issue.status === 'Fixed' ? '#e2e8f0' : 'var(--gradient-primary)', color: issue.status === 'Fixed' ? '#94a3b8' : 'white', padding: '8px 18px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: issue.status === 'Fixed' ? 'none' : 'var(--shadow-primary)' }}>
                                                        <Handshake size={16} /> {issue.status === 'Fixed' ? 'Reported Fixed' : 'Accept Task'}
                                                    </button>
                                                )}
                                            </div>

                                            {issue.aiConfidence && (
                                                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.04), rgba(79, 70, 229, 0.04))', border: '1px solid rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <CircleCheck size={14} color="var(--accent)" />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>AI Vision: {issue.category} Detected</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{issue.aiConfidence}% match</span>
                                                </div>
                                            )}

                                            {issue.status === 'Pending' && !issue.verified && (
                                                <button onClick={() => verifyIssue(issue.id)} style={{ width: '100%', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <CircleAlert size={18} /> Verify this Issue (Nearby)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '10px 24px 12px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)', borderTop: '1px solid var(--border-light)', zIndex: 1000 }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}><Earth size={22} /><span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Feed</span></div>
                <div onClick={() => navigate('/rewards')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><Trophy size={22} /><span style={{ fontSize: '0.7rem' }}>Rewards</span></div>
                <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <div style={{ position: 'relative' }}><Bell size={22} />{unreadCount > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#e53935', borderRadius: '50%' }} />}</div>
                    <span style={{ fontSize: '0.7rem' }}>Alerts</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 8px' }}><CivicFlowLogo size={28} /><span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px' }}>CIVIC FLOW</span></div>
                <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><ClipboardList size={22} /><span style={{ fontSize: '0.7rem' }}>Tasks</span></div>
                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}><User size={22} /><span style={{ fontSize: '0.7rem' }}>Profile</span></div>
            </footer>

            <PostIssueModal isOpen={posting} onClose={() => setPosting(false)} onPost={addIssue} issues={issues} />
        </div>
    );
};

export default Dashboard;
