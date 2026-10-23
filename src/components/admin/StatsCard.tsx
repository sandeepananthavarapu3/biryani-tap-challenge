'use client';

import React, { useEffect, useState } from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ label, value, icon, trend }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1000;
      const steps = 60;
      const stepTime = Math.abs(Math.floor(duration / steps));
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep += 1;
        const progress = currentStep / steps;
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const nextValue = Math.floor(easeOutQuart * value);
        
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(nextValue);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-75 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">
            {displayValue}
          </h3>
          
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded-lg text-orange-500">
          {icon}
        </div>
      </div>
    </div>
  );
}
