'use client'

import type { ReactNode } from 'react'

interface ButtonProps {
	children: ReactNode
	onClick?: () => void
	icon?: ReactNode
	disabled?: boolean
	variant?: 'primary' | 'secondary' | 'danger'
	className?: string
	type?: 'button' | 'submit' | 'reset'
}

export default function Button({
	children,
	onClick,
	icon,
	disabled = false,
	variant = 'primary',
	className = '',
	type = 'button',
}: ButtonProps) {
	const baseStyles =
		'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50'

	const variantStyles = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white',
		secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
		danger: 'bg-red-600 hover:bg-red-700 text-white',
	}

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${baseStyles} ${variantStyles[variant]} ${className}`}
		>
			{icon}
			{children}
		</button>
	)
}
