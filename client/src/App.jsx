import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Reception from './pages/Reception';
import Doctor from './pages/Doctor';
import Display from './pages/Display';
import Emergency from './pages/Emergency';
import NotFound from './pages/NotFound';

const navItems = [
  { path: '/home', label: 'Home' },
  { path: '/reception', label: 'Reception' },
  { path: '/doctor', label: 'Doctor' },
  { path: '/emergency', label: 'Emergency' },
  { path: '/display', label: 'Display' },
];

function App() {
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const appRef = useRef(null);

  const isDisplayPage = location.pathname === '/display';

  useEffect(() => {
    if (isDisplayPage || !appRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-gsap-nav]', {
        y: -24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-gsap-main]', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.1,
      });
    }, appRef);

    return () => ctx.revert();
  }, [isDisplayPage, location.pathname]);

  if (isDisplayPage) {
    return (
      <Routes>
        <Route path="/display" element={<Display />} />
      </Routes>
    );
  }

  return (
    <div ref={appRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-blue-100/60">
      <nav data-gsap-nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/home" className="font-black tracking-tight text-slate-900">
            Hospital Queue
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 md:hidden"
            onClick={() => setMobileMenu((prev) => !prev)}
          >
            Menu
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200/70 bg-white/90 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenu(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main data-gsap-main className="mx-auto max-w-7xl px-4 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/display" element={<Display />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
