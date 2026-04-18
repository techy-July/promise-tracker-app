'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
	closeButton?: boolean
}

const maxWidthClasses = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = 'md',
	closeButton = true,
}: ModalProps) {
	const [mounted, setMounted] = useState(false)

	// Handle ESC key to close modal
	useEffect(() => {
		setMounted(true)

		if (!isOpen) return

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		// Prevent body scroll when modal is open
		const originalOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		document.addEventListener('keydown', handleEscape)

		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = originalOverflow
		}
	}, [isOpen, onClose])

	if (!mounted || !isOpen) return null

	return (
		<div
			className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto"
			role="presentation"
		>
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 -z-10"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal */}
			{/** biome-ignore lint/a11y/useKeyWithClickEvents: Manual modal declaration */}
			<div
				className={`${maxWidthClasses[maxWidth]} w-full bg-white dark:bg-zinc-900 rounded-lg shadow-xl`}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
					<h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white">{title}</h2>
					{closeButton && (
						<button
							type="button"
							onClick={onClose}
							className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
							aria-label="Close modal"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>

				{/* Content */}
				<div className="p-4 sm:p-6">{children}</div>
			</div>
		</div>
	)
}
