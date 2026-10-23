'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  GiftIcon, 
  PlusCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Giveaways', href: '/admin/giveaways', icon: GiftIcon },
    { name: 'Create New', href: '/admin/giveaways/create', icon: PlusCircleIcon },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 border-b border-gray-800 p-4">
        <div className="text-white font-bold text-lg flex items-center">
          <span className="text-orange-500 mr-2">✦</span>
          Biryani Tap Admin
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${
        isOpen ? 'block' : 'hidden'
      } md:block w-full md:w-64 bg-gray-900 border-r border-gray-800 h-full min-h-screen flex-shrink-0 transition-all z-20`}>
        <div className="hidden md:flex items-center p-6 border-b border-gray-800">
          <span className="text-orange-500 mr-2 text-2xl">✦</span>
          <h1 className="text-white font-bold text-xl tracking-tight">Admin<span className="text-orange-500">Panel</span></h1>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                  active 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`h-5 w-5 mr-3 ${active ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium">{item.name}</span>
                
                {/* Optional badge logic could go here */}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full md:w-64 p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          Biryani Tap Challenge &copy; {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}
