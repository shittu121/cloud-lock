"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X, Cloud, Lock, User, Settings, Bell, Search } from 'lucide-react';
import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/client';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch user on mount
    const fetchUser = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({ email: data.user.email ?? '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems: { name: string; href: string; icon?: React.ElementType }[] = [
    { name: 'Dashboard', href: '/', icon: undefined },
    { name: 'Files', href: '#', icon: undefined },
    { name: 'Security', href: '#', icon: Lock },
    { name: 'Settings', href: '#', icon: Settings },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="relative">
                <Cloud className="h-8 w-8 text-blue-600 transition-all duration-300 group-hover:text-blue-700 group-hover:scale-110" />
                <Lock className="h-4 w-4 text-blue-800 absolute -bottom-1 -right-1 transition-all duration-300 group-hover:rotate-12" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                CloudLock
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 transition-all duration-300 group
                    ${pathname === item.href ? 'border-b-2 border-b-blue-500 hover:border-b-0 font-bold' : ''}
                    text-gray-700 hover:text-blue-600`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="flex items-center space-x-1">
                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                    <span>{item.name}</span>
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></div>
                </a>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 hover:scale-110">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 hover:scale-110 relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 relative">
                <div
                  className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
                  onClick={() => setProfileOpen((v) => !v)}
                  tabIndex={0}
                  onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
                >
                  <User className="h-4 w-4 text-white" />
                </div>
                {loading ? (
                  <span className="text-sm text-gray-700">Loading...</span>
                ) : user ? (
                  <span className="text-sm text-gray-700">{user.email}</span>
                ) : (
                  <a href="/auth/login" className="text-sm text-blue-600 font-semibold hover:underline">Login</a>
                )}
                {/* Dropdown */}
                {profileOpen && user && (
                  <div className="absolute right-16 top-14 mt-2 w-36 bg-white border border-gray-200 px-2 shadow-lg z-50 flex flex-col items-start">
                    <span className="text-lg text-gray-500 mb-2 border-b py-2 w-full">Profile</span>
                    <div className="py-2">
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              >
                <div className="relative h-6 w-6">
                  <Menu 
                    className={`absolute h-6 w-6 transition-all duration-300 ${
                      isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                    }`}
                  />
                  <X 
                    className={`absolute h-6 w-6 transition-all duration-300 ${
                      isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100`}>
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 transform
                  ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}
                  ${pathname === item.href ? 'font-bold underline bg-blue-50' : ''}
                  text-gray-700 hover:text-blue-600 hover:bg-blue-50`}
                style={{ 
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                }}
                onClick={() => setIsOpen(false)}
              >
                {item.icon ? <item.icon className="h-5 w-5" /> : null}
                <span>{item.name}</span>
              </a>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div
                  className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => setProfileOpen((v) => !v)}
                  tabIndex={0}
                  onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
                >
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user ? 'User Account' : 'Guest'}</p>
                  <p className="text-xs text-gray-500">{loading ? 'Loading...' : user ? user.email : 'Not signed in'}</p>
                </div>
              </div>
              {profileOpen && user && (
                <div className="px-4 pb-2">
                  <LogoutButton />
                </div>
              )}
              {!user && (
                <div className="px-4 pb-2">
                  <a href="/auth/login" className="block w-full text-center text-blue-600 font-semibold hover:underline py-2">Login</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
