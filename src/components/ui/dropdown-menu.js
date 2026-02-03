'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const DropdownMenuContext = createContext(null);

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEsc(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  }
  return ctx;
}

export function DropdownMenuTrigger({ asChild, children }) {
  const { open, setOpen } = useDropdownMenu();

  const toggle = () => setOpen(!open);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        toggle();
      },
      'aria-haspopup': 'menu',
      'aria-expanded': open,
    });
  }

  return (
    <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, align = 'end', className = '' }) {
  const { open } = useDropdownMenu();
  if (!open) return null;

  const alignment =
    align === 'start'
      ? 'left-0'
      : align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'right-0';

  return (
    <div
      role="menu"
      className={`absolute z-50 mt-2 min-w-[10rem] rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl focus:outline-none ${alignment} ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className = '' }) {
  return (
    <div className={`px-3 py-2 text-xs font-medium text-slate-500 ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-200" />;
}

export function DropdownMenuItem({ children, className = '', onClick }) {
  const { setOpen } = useDropdownMenu();

  const handleClick = (e) => {
    onClick?.(e);
    setOpen(false);
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      className={`w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none flex items-center ${className}`}
    >
      {children}
    </button>
  );
}
