import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>{children}</table>
    </div>
  );
}

export function Thead({ children, className = '' }: TableProps) {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
}

export function Tbody({ children, className = '' }: TableProps) {
  return <tbody className={`divide-y divide-gray-200 bg-white ${className}`}>{children}</tbody>;
}

export function Tr({ children, className = '' }: TableProps) {
  return <tr className={`hover:bg-gray-50 transition-colors ${className}`}>{children}</tr>;
}

export function Th({ children, className = '' }: TableProps) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: TableProps) {
  return <td className={`px-6 py-4 text-sm text-gray-900 ${className}`}>{children}</td>;
}
