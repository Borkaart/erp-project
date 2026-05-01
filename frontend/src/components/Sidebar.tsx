import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LineChart } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contas', label: 'Contas', icon: Receipt },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/fluxo-caixa', label: 'Fluxo de Caixa', icon: LineChart },
  ];

  return (
    <aside className="w-64 glass border-r dark:border-slate-700/50 hidden md:flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accentOrange to-accentOrangeLight flex items-center justify-center mr-3 shadow-glow-orange border border-white/20">
          <span className="text-white font-black text-xl italic tracking-tighter">CC</span>
        </div>
        <span className="text-2xl font-black tracking-tighter uppercase italic">CC <span className="text-accentOrange">ERP</span></span>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-xl transition-all duration-300 group font-bold uppercase tracking-widest text-[10px]',
                isActive 
                  ? 'bg-accentOrange/10 text-accentOrange shadow-[inset_4px_0_0_0_#F97316]' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-accentOrange/5 hover:text-slate-900 dark:hover:text-accentOrange'
              )
            }
          >
            <item.icon size={18} className="mr-3 group-hover:scale-125 transition-transform duration-300" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="glass-card p-4 rounded-xl text-center text-xs border-transparent border-2 hover:animate-border-flow">
          <p className="text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-widest">Suporte</p>
          <button className="w-full btn-secondary py-2 font-black uppercase tracking-tighter text-[10px]">Contatar</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
