import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">1Kind AI</span>
            </Link>
            <div className="hidden md:flex md:ml-8">
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/blog" className="nav-link">Blog</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="flex items-center space-x-1 px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}