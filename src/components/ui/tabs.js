'use client';

import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, className = '', children }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', ...props }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-md bg-slate-100 p-1 ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;

  const base =
    'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none';

  const activeClass = isActive
    ? 'bg-white text-slate-900 shadow-sm'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200';

  return (
    <button
      type="button"
      className={`${base} ${activeClass} ${className}`}
      onClick={() => ctx?.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}


