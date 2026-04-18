'use client'

import { CheckCircle2, Clock, Inbox, Menu, MessageCircle, Settings, Tag, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LogOutButton from '@/components/ui/LogOutButton'

interface NavItem {
	label: string
	href: string
	icon: React.ReactNode
	badge?: number
}

export default function Sidebar() {
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)

	const navItems: NavItem[] = [
		{
			label: 'Inbox',
			href: '/dashboard',
			icon: <Inbox className="w-5 h-5" />,
			badge: 3,
		},
		{
			label: 'Active Items',
			href: '/dashboard/items',
			icon: <CheckCircle2 className="w-5 h-5" />,
			badge: 12,
		},
		{
			label: 'Awaiting Reply',
			href: '/dashboard/awaiting-reply',
			icon: <MessageCircle className="w-5 h-5" />,
			badge: 2,
		},
		{
			label: 'Reminders',
			href: '/dashboard/reminders',
			icon: <Clock className="w-5 h-5" />,
		},
		{
			label: 'Categories',
			href: '/dashboard/categories',
			icon: <Tag className="w-5 h-5" />,
		},
		{
			label: 'Settings',
			href: '/dashboard/settings',
			icon: <Settings className="w-5 h-5" />,
		},
	]

	const isActive = (href: string) => {
		if (href === '/dashboard') {
			return pathname === '/dashboard'
		}
		return pathname.startsWith(href)
	}

	return (
		<>
			{/* Mobile menu button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
				aria-label="Toggle menu"
			>
				{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</button>

			{/* Sidebar backdrop on mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 z-20 bg-black/50 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 z-30 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				{/* Logo */}
				<div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-800">
					<h1 className="text-2xl font-bold text-black dark:text-white">Promise</h1>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">Tracker</p>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setIsOpen(false)}
							className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
								isActive(item.href)
									? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
									: 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
							}`}
						>
							<div className="flex items-center gap-3">
								{item.icon}
								<span>{item.label}</span>
							</div>
							{item.badge !== undefined && (
								<span
									className={`px-2 py-1 text-xs font-semibold rounded-full ${
										isActive(item.href)
											? 'bg-blue-600 text-white'
											: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
									}`}
								>
									{item.badge}
								</span>
							)}
						</Link>
					))}
				</nav>

				{/* Footer */}
				<div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
					<LogOutButton />
				</div>
			</aside>
		</>
	)
}
