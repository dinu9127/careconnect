import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const baseStyles = 'font-semibold rounded-lg transition focus:outline-none focus:ring-2'
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300',
    secondary: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-300',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
