// 1. IMPORTS
import React from 'react';

// 2. TYPES
type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

// 3. COMPOSANT
const Button: React.FC<ButtonProps> = ({
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  disabled = false
}) => {
  // Définition des styles de base pour chaque variante
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-md transition-colors duration-300
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;