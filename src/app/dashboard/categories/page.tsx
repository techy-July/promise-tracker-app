'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from '@/features/categories/controllers/category.controller'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { FormItem, Label, Input, FormError } from '@/components/ui/FormItem'

type Category = {
	id: string
	name: string
	color_hex: string
	keywords?: string[]
	is_default?: boolean
}

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [showAddModal, setShowAddModal] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)

	const [isPending, startTransition] = useTransition()

	// Fetch categories on mount
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const result = await getCategories()
				if (result.success && result.data) {
					setCategories(result.data)
				} else {
					setError(result.error || 'Failed to fetch categories')
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Error fetching categories')
			} finally {
				setLoading(false)
			}
		}

		fetchCategories()
	}, [])

	const handleCreateCategory = (newCategory: Category) => {
		startTransition(async () => {
			const result = await createCategory(
				newCategory.name,
				newCategory.color_hex,
				newCategory.keywords || []
			)

			if (result.success && result.data) {
				setCategories([...categories, result.data as Category])
				setShowAddModal(false)
				setError(null)
			} else {
				setError(result.error || 'Failed to create category')
			}
		})
	}

	const handleUpdateCategory = (updated: Category) => {
		startTransition(async () => {
			const result = await updateCategory(updated.id, {
				name: updated.name,
				color_hex: updated.color_hex,
				keywords: updated.keywords,
			})

			if (result.success) {
				setCategories(categories.map((c) => (c.id === updated.id ? updated : c)))
				setEditingCategory(null)
				setError(null)
			} else {
				setError(result.error || 'Failed to update category')
			}
		})
	}

	const handleDeleteCategory = async (id: string) => {
		if (!confirm('Are you sure? Items using this category will keep the association.')) {
			return
		}

		startTransition(async () => {
			const result = await deleteCategory(id)

			if (result.success) {
				setCategories(categories.filter((c) => c.id !== id))
				setError(null)
			} else {
				setError(result.error || 'Failed to delete category')
			}
		})
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-white p-8 flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white p-8">
			<div className="max-w-6xl">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Categories</h1>
						<p className="mt-1 text-gray-500">
							Manage your task categories and customize their appearance
						</p>
					</div>
					<Button
						onClick={() => setShowAddModal(true)}
						icon={<Plus className="w-4 h-4" />}
						disabled={isPending}
					>
						Add Category
					</Button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				{/* Categories Grid */}
				{categories.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
						<p className="text-gray-500 mb-4">No categories yet</p>
						<Button
							onClick={() => setShowAddModal(true)}
							variant="secondary"
							icon={<Plus className="w-4 h-4" />}
						>
							Create First Category
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{categories.map((category) => (
							<CategoryCard
								key={category.id}
								category={category}
								onEdit={() => setEditingCategory(category)}
								onDelete={() => handleDeleteCategory(category.id)}
								isPending={isPending}
							/>
						))}
					</div>
				)}

				{/* Add Category Modal */}
				{showAddModal && (
					<CategoryModal
						onClose={() => setShowAddModal(false)}
						onSave={handleCreateCategory}
						isPending={isPending}
					/>
				)}

				{/* Edit Category Modal */}
				{editingCategory && (
					<CategoryModal
						category={editingCategory}
						onClose={() => setEditingCategory(null)}
						onSave={handleUpdateCategory}
						isPending={isPending}
					/>
				)}
			</div>
		</div>
	)
}

function CategoryCard({
	category,
	onEdit,
	onDelete,
	isPending,
}: {
	category: Category
	onEdit: () => void
	onDelete: () => void
	isPending: boolean
}) {
	return (
		<div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between mb-3">
				<div className="flex items-center gap-3">
					<div
						className="w-4 h-4 rounded-full flex-shrink-0"
						style={{ backgroundColor: category.color_hex }}
					/>
					<h3 className="font-semibold text-gray-900">{category.name}</h3>
				</div>
				{!category.is_default && (
					<div className="flex gap-1">
						<button
							type="button"
							onClick={onEdit}
							disabled={isPending}
							className="p-2 text-gray-500 hover:bg-white rounded disabled:opacity-50"
						>
							<Pencil className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={onDelete}
							disabled={isPending}
							className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded disabled:opacity-50"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>

			{/* Keywords/Tags */}
			{category.keywords && category.keywords.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{category.keywords.map((keyword, idx) => (
						<span
							key={`${idx}-${keyword}`}
							className="inline-block px-2 py-1 text-xs bg-white rounded border border-gray-200"
						>
							{keyword}
						</span>
					))}
				</div>
			)}

			{category.is_default && (
				<span className="text-xs text-gray-500 italic">Default category</span>
			)}
		</div>
	)
}

function CategoryModal({
	category,
	onClose,
	onSave,
	isPending,
}: {
	category?: Category
	onClose: () => void
	onSave: (category: Category) => void
	isPending: boolean
}) {
	const [name, setName] = useState(category?.name || '')
	const [colorHex, setColorHex] = useState(category?.color_hex || '#3b82f6')
	const [keywords, setKeywords] = useState((category?.keywords || []).join(', '))
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim()) {
			setError('Category name is required')
			return
		}

		if (!colorHex.match(/^#[0-9A-Fa-f]{6}$/)) {
			setError('Please enter a valid hex color')
			return
		}

		const keywordList = keywords
			.split(',')
			.map((k) => k.trim())
			.filter((k) => k)

		onSave({
			id: category?.id || '',
			name: name.trim(),
			color_hex: colorHex,
			keywords: keywordList,
		})
	}

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={category ? 'Edit Category' : 'Add Category'}
			maxWidth="md"
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Error */}
				{error && <FormError message={error} />}

				{/* Name */}
				<FormItem>
					<Label htmlFor="category-name" required>
						Name
					</Label>
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Work, Personal, Urgent"
						disabled={isPending}
					/>
				</FormItem>

				{/* Color */}
				<FormItem>
					<Label htmlFor="category-color">Color</Label>
					<div className="flex gap-3 items-center">
						<input
							type="color"
							value={colorHex}
							onChange={(e) => setColorHex(e.target.value)}
							className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
							disabled={isPending}
						/>
						<Input
							type="text"
							value={colorHex}
							onChange={(e) => setColorHex(e.target.value)}
							placeholder="#000000"
							className="flex-1 font-mono text-sm"
							disabled={isPending}
						/>
					</div>
				</FormItem>

				{/* Keywords */}
				<FormItem>
					<Label htmlFor="category-keywords">Keywords</Label>
					<Input
						type="text"
						value={keywords}
						onChange={(e) => setKeywords(e.target.value)}
						placeholder="e.g., work, deadline, important"
						disabled={isPending}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Comma-separated keywords used to auto-categorize items
					</p>
				</FormItem>

				{/* Buttons */}
				<div className="flex gap-2 pt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isPending}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isPending}
						className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
					>
						{isPending ? 'Saving...' : category ? 'Update' : 'Create'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
