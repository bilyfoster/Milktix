import { useEffect, useState } from 'react'
import { FileText, Plus, Edit2, Eye, EyeOff, Trash2, Save, X, Globe } from 'lucide-react'
import api from '../../utils/api'

interface CmsPage {
  id: string
  slug: string
  title: string
  content: string
  metaDescription: string
  isPublished: boolean
  updatedAt: string
}

export function CmsPages() {
  const [pages, setPages] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    metaDescription: '',
    isPublished: true
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await api.get('/cms/admin/pages')
      setPages(response.data)
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (page: CmsPage) => {
    setEditingPage(page)
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished
    })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingPage(null)
    setFormData({
      slug: '',
      title: '',
      content: '',
      metaDescription: '',
      isPublished: true
    })
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        await api.post('/cms/admin/pages', formData)
      } else if (editingPage) {
        await api.put(`/cms/admin/pages/${editingPage.id}`, formData)
      }
      fetchPages()
      setEditingPage(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to save page:', error)
      alert('Failed to save page. Make sure slug is unique.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return
    try {
      await api.delete(`/cms/admin/pages/${id}`)
      fetchPages()
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const handleTogglePublish = async (page: CmsPage) => {
    try {
      await api.put(`/cms/admin/pages/${page.id}`, {
        ...page,
        isPublished: !page.isPublished
      })
      fetchPages()
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-900">Content Management</h1>
          <p className="text-warmgray-600">Manage static pages like About, Contact, Terms</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Page
        </button>
      </div>

      {/* Editor */}
      {(editingPage || isCreating) && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isCreating ? 'Create New Page' : 'Edit Page'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingPage(null)
                  setIsCreating(false)
                }}
                className="btn-outline"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1">
                  Page Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="input"
                  placeholder="about-us"
                  disabled={!isCreating}
                />
                <p className="text-xs text-warmgray-500 mt-1">Used in URL: /your-slug</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="About Us"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">
                Meta Description (SEO)
              </label>
              <input
                type="text"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="input"
                placeholder="Brief description for search engines"
                maxLength={160}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">
                Content (HTML supported)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="input font-mono text-sm"
                placeholder="<h2>Heading</h2><p>Your content here...</p>"
              />
              <p className="text-xs text-warmgray-500 mt-1">
                Supports HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt;, etc.
              </p>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
              />
              <span className="text-sm text-warmgray-700">Published (visible to public)</span>
            </label>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-warmgray-200">
          <thead className="bg-warmgray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-warmgray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-warmgray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-warmgray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-warmgray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-warmgray-900">{page.title}</div>
                      <div className="text-sm text-warmgray-500 line-clamp-1">
                        {page.metaDescription || 'No meta description'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-coral-600 hover:text-coral-700 flex items-center gap-1"
                  >
                    /{page.slug}
                    <Globe className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleTogglePublish(page)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      page.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-warmgray-100 text-warmgray-800'
                    }`}
                  >
                    {page.isPublished ? (
                      <><Eye className="h-3 w-3" /> Published</>
                    ) : (
                      <><EyeOff className="h-3 w-3" /> Draft</>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-warmgray-500">
                  {new Date(page.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-coral-600 hover:text-coral-900"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-warmgray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-warmgray-300" />
                  <p>No pages yet. Create your first page!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">HTML Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use <code>&lt;h2&gt;</code> for headings</li>
          <li>• Use <code>&lt;p&gt;</code> for paragraphs</li>
          <li>• Use <code>&lt;ul&gt;&lt;li&gt;</code> for bullet lists</li>
          <li>• Use <code>&lt;strong&gt;</code> for <strong>bold</strong> text</li>
          <li>• Use <code>&lt;a href=&quot;...&quot;&gt;</code> for links</li>
        </ul>
      </div>
    </div>
  )
}
