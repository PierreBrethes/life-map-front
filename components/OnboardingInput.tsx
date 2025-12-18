
import React, { useState } from 'react';


interface OnboardingInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  minimal?: boolean;
}

export const OnboardingInput: React.FC<OnboardingInputProps> = ({ onSubmit, isLoading, minimal = false }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  if (minimal) {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full h-full flex items-center"
      >
        <div className="relative w-full flex items-center h-full">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Parler à Taco..."
            disabled={isLoading}
            className="w-full h-full px-4 rounded-full bg-transparent border-none outline-none text-sm placeholder:text-slate-400 focus:ring-0 text-slate-800"
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="p-1.5 mr-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full h-full flex items-end justify-center pb-12 pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto flex items-center gap-2 w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-500 fade-in"
      >
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Répondre à Taco..."
            disabled={isLoading}
            className="w-full h-12 px-4 py-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-xl shadow-lg ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 pr-12 transition-all duration-200"
            autoFocus
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="absolute right-1.5 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
