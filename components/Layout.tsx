import React from 'react';
import { Activity, Users, Home, Settings, LogOut, HeartPulse, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Painel Geral', icon: Home, path: '/' },
    { label: 'Residentes', icon: Users, path: '/residents' },
    { label: 'Saúde & Vitas', icon: HeartPulse, path: '/health' },
    { label: 'Atividades', icon: Activity, path: '/activities' },
    { label: 'Administração', icon: ShieldCheck, path: '/admin' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <div className="bg-primary-600 text-white p-2 rounded-lg">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">VidaCare</h1>
            <p className="text-xs text-slate-500 font-medium">Gestão ILPI</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.label || 'Bem-vindo'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Enf. Maria Silva</p>
              <p className="text-xs text-slate-500">Supervisora - Turno Dia</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold border-2 border-white shadow-sm">
              MS
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;