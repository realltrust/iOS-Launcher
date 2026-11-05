import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonPlayer from './pages/LessonPlayer';
import Tests from './pages/Tests';
import Games from './pages/Games';
import Reports from './pages/Reports';
import Certificates from './pages/Certificates';
import Teacher from './pages/Teacher';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/tests', label: 'Tests' },
  { to: '/games', label: 'Games' },
  { to: '/reports', label: 'Reports' },
  { to: '/certificates', label: 'Certificates' },
];

export default function App() {
  const { user, guest } = useAuth();
  const location = useLocation();

  if (!user && !guest) return <Login />;

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <aside className="glass-nav md:w-60 p-4 flex md:flex-col gap-2 overflow-x-auto md:border-b-0 border-b">
        <div className="flex items-center gap-2 mb-4 whitespace-nowrap">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" strokeLinecap="round" />
            </svg>
          </div>
          <div className="font-bold text-slate-800 dark:text-white">Typing Instructor</div>
        </div>

        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <NavLink
            to="/teacher"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`
            }
          >
            Teacher
          </NavLink>
        )}
        <div className="md:mt-auto pt-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="relative flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto animate-fade-in">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<LessonPlayer />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/games" element={<Games />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="*" element={<Navigate to="/" replace state={{ from: location.pathname }} />} />
        </Routes>
      </main>
    </div>
  );
}

function LogoutButton() {
  const { logout, user, setTheme } = useAuth();
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
        {user ? user.username : 'Guest'}
      </div>
      {user && (
        <button
          onClick={() => setTheme(user.settings.theme === 'dark' ? 'light' : 'dark')}
          className="w-full rounded-lg bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-slate-700/50 px-3 py-1.5 text-xs font-medium"
        >
          {user.settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      )}
      <button
        onClick={logout}
        className="w-full rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/20 transition"
      >
        Sign out
      </button>
    </div>
  );
}
