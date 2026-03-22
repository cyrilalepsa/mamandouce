import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function DarkModeToggle({ className = '' }) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-full transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
      data-testid="dark-mode-toggle"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
