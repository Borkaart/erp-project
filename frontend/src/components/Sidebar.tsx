import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LineChart, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { section: 'Principal', items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/contas', label: 'Contas', icon: Receipt },
    ]},
    { section: 'Gestão', items: [
      { path: '/clientes', label: 'Clientes', icon: Users },
      { path: '/fluxo-caixa', label: 'Fluxo de Caixa', icon: LineChart },
    ]},
  ];

  return (
    <aside className="w-[220px] bg-sidebar-light dark:bg-sidebar-dark border-r border-border-light dark:border-border-dark hidden md:flex flex-col z-20">
      <div className="h-[56px] flex items-center px-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-accent-light dark:text-accent-dark" />
          <span className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
            Projeto Contabilidade
          </span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary-light/60 dark:text-text-secondary-dark/60 mb-2">
              {group.section}
            </h3>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item sidebar-item-hover ${isActive ? 'sidebar-item-active' : 'text-text-secondary-light dark:text-text-secondary-dark'}`
                }
              >
                <item.icon size={18} className="mr-3" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <div className="bg-background-light dark:bg-background-dark p-3 rounded-xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-2">Suporte</p>
          <button className="w-full btn-secondary text-[11px] py-1.5 uppercase font-semibold">Contatar</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
