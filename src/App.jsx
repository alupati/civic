import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSync } from './hooks/useSync';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Rewards from './components/Rewards';
import Notifications from './components/Notifications';
import Tasks from './components/Tasks';
import Admin from './components/Admin';
import './index.css';

const defaultIssues = [
  {
    id: 1, user: 'Amit S.', description: 'Large pothole on Main Street near Jubilee Hills. Multiple vehicles damaged this week. Urgent attention needed from GHMC.',
    location: '17.4326, 78.3826', address: 'Road No 10, Jubilee Hills', time: '2 hours ago',
    postedDate: '20 Feb 2026', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    verified: true, likes: 24, likedBy: [], status: 'Verified', category: 'Pothole', categoryIcon: '🚧', aiConfidence: 92,
  },
  {
    id: 2, user: 'Priya K.', description: 'Overflowing garbage bins at Madhapur junction. Waste has been piling up for three days now despite multiple complaints.',
    location: '17.4486, 78.3908', address: 'Madhapur Junction', time: '5 hours ago',
    postedDate: '20 Feb 2026', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
    verified: false, likes: 18, likedBy: [], status: 'Pending', category: 'Waste', categoryIcon: '🗑️', aiConfidence: 88,
  },
  {
    id: 3, user: 'Rahul R.', description: 'Broken street light on Road No 14, Banjara Hills. The entire stretch is pitch dark at night, causing safety concerns for pedestrians.',
    location: '17.4156, 78.4347', address: 'Road No 14, Banjara Hills', time: '1 day ago',
    postedDate: '19 Feb 2026', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
    verified: true, likes: 31, likedBy: [], status: 'In Progress', category: 'Infrastructure', categoryIcon: '💡', aiConfidence: 85,
    acceptedBy: 'Ravi Kumar', acceptedAt: Date.now() - 30000,
  },
];

const defaultNotifications = [
  { id: 1, title: 'Issue Verified', message: 'Your reported pothole on Main Street has been verified by 3 nearby residents.', type: 'verify', time: '30 min ago', unread: true, postId: 1 },
  { id: 2, title: 'Task Accepted', message: 'Field worker Ravi Kumar accepted the broken street light on Road No 14.', type: 'confirm', time: '2 hours ago', unread: true, postId: 3 },
  { id: 3, title: 'Points Earned', message: 'You earned 50 civic points for reporting the waste overflow at Madhapur junction.', type: 'update', time: '5 hours ago', unread: false, postId: 2 },
];

function App() {
  const [role, setRole] = useState(null);
  const [issues, setIssues] = useState(defaultIssues);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleLogin = (r) => setRole(r);

  // Called from Login/Signup to set real user data
  const handleUserData = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  // Multi-tab sync
  const { broadcastNewIssue, broadcastUpdateIssue } = useSync(issues, setIssues);

  const updateIssueStatus = (id, status, extra = {}) => {
    setIssues(prev => prev.map(issue =>
      issue.id === id ? { ...issue, status, acceptedAt: status === 'In Progress' ? Date.now() : issue.acceptedAt, ...extra } : issue
    ));
  };

  const addNotification = (notif) => {
    setNotifications(prev => [{ id: Date.now(), time: 'Just now', unread: true, ...notif }, ...prev]);
  };

  const acceptedTasks = issues.filter(i => i.acceptedBy === 'You' || (i.status === 'In Progress' && i.acceptedBy));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} onUserData={handleUserData} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} onUserData={handleUserData} />} />
        <Route path="/dashboard" element={role ? <Dashboard issues={issues} setIssues={setIssues} notifications={notifications} setNotifications={setNotifications} updateStatus={updateIssueStatus} broadcastNewIssue={broadcastNewIssue} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={role ? <Profile user={user} setUser={setUser} onLogout={() => setRole(null)} issues={issues} /> : <Navigate to="/login" />} />
        <Route path="/rewards" element={role ? <Rewards user={user} issues={issues} /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={role ? <Notifications notifications={notifications} setNotifications={setNotifications} issues={issues} /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={role ? <Tasks tasks={acceptedTasks} updateStatus={updateIssueStatus} addNotification={addNotification} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={role === 'admin' ? <Admin issues={issues} setIssues={setIssues} updateStatus={updateIssueStatus} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
