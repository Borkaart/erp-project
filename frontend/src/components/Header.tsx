import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, User } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-[56px] flex items-center justify-between px-8 bg-header-light dark:bg-header-dark border-b border-border-light dark:border-border-dark z-10 transition-colors duration-200">
      <div className="flex items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-text-secondary-light dark:text-text-secondary-dark">
          Projeto Contabilidade
        </h2>
      </div>
      
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-secondary-light dark:text-text-secondary-dark"
          title={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative text-text-secondary-light dark:text-text-secondary-dark">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-accent-light dark:bg-accent-dark rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-semibold text-text-primary-light dark:text-text-primary-dark leading-none">Administrador</p>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1">paulo@exemplo.com</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-accent-light dark:bg-accent-dark flex items-center justify-center text-white cursor-pointer hover:brightness-110 transition-all">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
