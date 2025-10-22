
import React from 'react';
import { FilmIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-20 border-b border-gray-700">
      <div className="container mx-auto flex items-center gap-3">
        <FilmIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Cinematic Scene Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;
