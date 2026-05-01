import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, User } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 flex items-center justify-between px-6 glass border-b dark:border-slate-700/50 z-10">
      <div className="flex items-center">
        <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accentOrange to-accentOrangeLight hidden sm:block tracking-widest uppercase">
          CHORA &nbsp; CONTÁBIL &nbsp; ERP
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
          <Bell size={20} className="text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accentOrange rounded-full shadow-glow-orange"></span>
        </button>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accentOrange to-accentOrangeLight flex items-center justify-center text-white cursor-pointer shadow-glow-orange hover:scale-110 transition-transform border border-white/20">
          <User size={20} strokeWidth={3} />
        </div>
      </div>
    </header>
  );
};

export default Header;
