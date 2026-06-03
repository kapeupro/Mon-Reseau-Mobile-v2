import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  title?: string;
  className?: string;
  children?: any;
  onClick?: any;
  active?: boolean;
}

export default function Button({
  title,
  className = '',
  children,
  onClick,
  active,
}: ButtonProps) {
  //TODO ADD Tailwind merge
  if (active) {
    className += ' bg-primary text-white';
  }
  return (
    <div
      title={title}
      className={twMerge(
        `flex-none p-1 px-4 rounded-2xl mx-2 cursor-pointer font-paragraphe text-color-primary bg-white hover:bg-primary hover:text-primary-text  transition duration-300 ease-in-out`,
        className
      )}
      onClick={(e) => onClick(e)}
    >
      {children}
    </div>
  );
}
