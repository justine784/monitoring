'use client';

import React from 'react';

export function Card({ className = '', ...props }) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }) {
  return (
    <div
      className={`p-4 border-b border-slate-100 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = '', ...props }) {
  return (
    <h3
      className={`text-base font-semibold text-slate-900 ${className}`}
      {...props}
    />
  );
}

export function CardDescription({ className = '', ...props }) {
  return (
    <p
      className={`text-sm text-slate-600 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = '', ...props }) {
  return (
    <div
      className={`p-4 pt-2 ${className}`}
      {...props}
    />
  );
}


