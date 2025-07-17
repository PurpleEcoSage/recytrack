import React from 'react';

const LeafLogo = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C50 90 50 70 50 50 C50 50 70 30 90 10 C90 10 70 10 50 10"
        fill="url(#leafGradient)"
        stroke="#22c55e"
        strokeWidth="2"
      />
      <path
        d="M50 30 C50 30 50 70 50 90"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M50 50 C40 45 35 40 35 40 M50 50 C60 45 65 40 65 40 M50 60 C40 55 35 50 35 50 M50 60 C60 55 65 50 65 50"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default LeafLogo;