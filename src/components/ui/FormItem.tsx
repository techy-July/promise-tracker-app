import type React from 'react'

interface FormItemProps {
	children: React.ReactNode
	className?: string
}

export function FormItem({ children, className = '' }: FormItemProps) {
	return <div className={`space-y-1.5 ${className}`}>{children}</div>
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	children: React.ReactNode
	required?: boolean
}

export function Label({ children, required, className = '', ...props }: LabelProps) {
	return (
		<label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
			{children}
			{required && <span className="text-red-500 ml-1">*</span>}
		</label>
	)
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: string
}

export function Input({ error, className = '', ...props }: InputProps) {
	return (
		<>
			<input
				className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
					error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
				} ${className}`}
				{...props}
			/>
			{error && <p className="text-xs text-red-600 mt-1">{error}</p>}
		</>
	)
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	error?: string
	children: React.ReactNode
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
	return (
		<>
			<select
				className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${
					error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
				} ${className}`}
				{...props}
			>
				{children}
			</select>
			{error && <p className="text-xs text-red-600 mt-1">{error}</p>}
		</>
	)
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: string
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
	return (
		<>
			<textarea
				className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
					error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
				} ${className}`}
				{...props}
			/>
			{error && <p className="text-xs text-red-600 mt-1">{error}</p>}
		</>
	)
}

interface FormErrorProps {
	message: string
}

export function FormError({ message }: FormErrorProps) {
	return (
		<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
			{message}
		</div>
	)
}

interface FormSuccessProps {
	message: string
}

export function FormSuccess({ message }: FormSuccessProps) {
	return (
		<div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
			{message}
		</div>
	)
}
