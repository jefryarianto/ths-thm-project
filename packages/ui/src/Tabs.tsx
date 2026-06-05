import React, { useState } from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

interface TabChildProps {
  label?: string;
  children?: React.ReactNode;
}

export function Tabs({ children, defaultIndex = 0, onChange }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleChange = (index: number) => {
    setActiveIndex(index);
    onChange?.(index);
  };

  const childrenArray = React.Children.toArray(children) as React.ReactElement<TabChildProps>[];

  return (
    <div>
      <TabList>
        {childrenArray.map((child, index) => (
          <Tab
            key={index}
            isActive={index === activeIndex}
            onClick={() => handleChange(index)}
          >
            {child.props.label || `Tab ${index + 1}`}
          </Tab>
        ))}
      </TabList>
      {childrenArray.map((child, index) => (
        <TabPanel key={index} isActive={index === activeIndex}>
          {child.props.children}
        </TabPanel>
      ))}
    </div>
  );
}

export function TabList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex border-b border-gray-200 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function Tab({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function TabPanel({
  children,
  isActive,
  className = '',
}: {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}) {
  if (!isActive) return null;
  return <div className={className}>{children}</div>;
}
