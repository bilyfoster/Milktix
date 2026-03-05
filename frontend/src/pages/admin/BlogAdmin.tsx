import { useState, useEffect } from 'react'
import { 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Eye,
  Trash2,
  Plus,
  Filter,
  X,
  FileText,
  User,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  Archive
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../utils/api'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
  viewCount: number
  author: {
    id: string
    fullName: string
  }
}

type PostStatus = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'

const ITEMS_PER_PAGE = 10

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PostStatus>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/blog/posts/admin')
      setPosts(response.data as BlogPost[])
    } catch (err) {
      console.error('Failed to load blog posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || post.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(paginatedPosts.map(p => p.id)))
    } else {
      setSelectedPosts(new Set())
    }
  }

  const handleSelectPost = (postId: string, checked: boolean) => {
    const newSelected = new Set(selectedPosts)
    if (checked) {
      newSelected.add(postId)
    } else {
      newSelected.delete(postId)
    }
    setSelectedPosts(newSelected)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return
    
    try {
      setIsDeleting(true)
      await api.delete(`/blog/posts/${postId}`)
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedPosts.size} post(s)? This action cannot be undone.`)) return
    
    try {
      setIsDeleting(true)
      await Promise.all(Array.from(selectedPosts).map(id => api.delete(`/blog/posts/${id}`)))
      setPosts(posts.filter(p => !selectedPosts.has(p.id)))
      setSelectedPosts(new Set())
    } catch (err) {
      console.error('Failed to delete posts:', err)
      alert('Failed to delete some posts. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (postId: string, newStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    try {
      await api.patch(`/blog/posts/${postId}/status`, { status: newStatus })
      setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p))
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update post status. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-warmgray-100 text-warmgray-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      ARCHIVED: 'bg-amber-100 text-amber-700',
    }
    const icons = {
      DRAFT: <FileText className="h-3 w-3 mr-1" />,
      PUBLISHED: <CheckCircle className="h-3 w-3 mr-1" />,
      ARCHIVED: <Archive className="h-3 w-3 mr-1" />,
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-heading-lg font-bold text-warmgray-900">Blog Posts</h2>
          <p className="text-warmgray-600 mt-1">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            {selectedStatus !== 'ALL' && ` (${selectedStatus.toLowerCase()})`}
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="btn-primary text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search by title, author..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="input pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-warmgray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as PostStatus)
                setCurrentPage(1)
              }}
              className="input py-2 text-sm w-40"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedStatus !== 'ALL') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warmgray-100">
            <span className="text-xs text-warmgray-500">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('ALL')}><X className="h-3 w-3" /></button>
              </span>
            )}
            <button 
              onClick={() => {
                setSearchQuery('')
                setSelectedStatus('ALL')
              }}
              className="text-xs text-warmgray-500 hover:text-coral-600 ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-coral-800 font-medium">
            {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="btn-ghost text-xs py-1.5 px-3 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </button>
            <button
              onClick={() => setSelectedPosts(new Set())}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      {filteredPosts.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No posts found</h3>
          <p className="text-warmgray-600 mt-1">
            {searchQuery || selectedStatus !== 'ALL' 
              ? 'Try adjusting your filters.' 
              : 'No blog posts yet. Create your first post!'}
          </p>
          {(searchQuery || selectedStatus !== 'ALL') && (
            <button 
              onClick={() => {
                setSearchQuery('')
                setSelectedStatus('ALL')
              }}
              className="btn-primary mt-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-warmgray-50 border-b border-warmgray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={paginatedPosts.length > 0 && paginatedPosts.every(p => selectedPosts.has(p.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Post</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Published</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray-100">
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-warmgray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPosts.has(post.id)}
                          onChange={(e) => handleSelectPost(post.id, e.target.checked)}
                          className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="font-medium text-warmgray-900 truncate">{post.title}</p>
                          <p className="text-xs text-warmgray-500 truncate">/{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-warmgray-600">
                          <User className="h-3.5 w-3.5 text-warmgray-400" />
                          {post.author.fullName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-warmgray-600">{post.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-warmgray-600">
                        {post.publishedAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-warmgray-400" />
                            {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span className="text-warmgray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-warmgray-600">
                          <BarChart3 className="h-3.5 w-3.5 text-warmgray-400" />
                          {post.viewCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Publish/Unpublish */}
                          {post.status === 'PUBLISHED' ? (
                            <button
                              onClick={() => handleStatusChange(post.id, 'DRAFT')}
                              className="btn-ghost text-xs py-1.5 px-2"
                              title="Unpublish"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                              className="btn-ghost text-xs py-1.5 px-2 text-green-600 hover:bg-green-50"
                              title="Publish"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* View */}
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            className="btn-ghost text-xs py-1.5 px-2"
                            title="View Post"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          {/* Edit */}
                          <Link
                            to={`/admin/blog/edit/${post.id}`}
                            className="btn-ghost text-xs py-1.5 px-2"
                            title="Edit Post"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeleting}
                            className="btn-ghost text-xs py-1.5 px-2 text-red-600 hover:bg-red-50"
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-warmgray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-ghost text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-warmgray-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-ghost text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
