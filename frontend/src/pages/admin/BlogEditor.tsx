import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Save, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Loader2,
  Image as ImageIcon,
  Tag,
  FileText,
  CheckCircle,
  X,
  Globe
} from 'lucide-react'
import api from '../../utils/api'

interface BlogFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string
  metaDescription: string
  featuredImageUrl: string
  status: 'DRAFT' | 'PUBLISHED'
}

const INITIAL_FORM_DATA: BlogFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  category: '',
  tags: '',
  metaDescription: '',
  featuredImageUrl: '',
  status: 'DRAFT',
}

const CATEGORIES = [
  'News',
  'Events',
  'Tips & Guides',
  'Product Updates',
  'Community',
  'Behind the Scenes',
]

// Simple slug generator
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100)
}

export function BlogEditor() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const isEditing = !!postId

  const [formData, setFormData] = useState<BlogFormData>(INITIAL_FORM_DATA)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Load post data if editing
  useEffect(() => {
    if (isEditing && postId) {
      loadPost(postId)
    }
  }, [isEditing, postId])

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await api.get(`/blog/posts/admin/${id}`)
      const post = response.data
      
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags?.join(', ') || '',
        metaDescription: post.metaDescription || '',
        featuredImageUrl: post.featuredImageUrl || '',
        status: post.status,
      })
      setSlugManuallyEdited(true)
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title && !isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(formData.title)
      }))
    }
  }, [formData.title, slugManuallyEdited, isEditing])

  const handleChange = (field: keyof BlogFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'slug') {
      setSlugManuallyEdited(true)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.slug.trim()) {
      setError('Slug is required')
      return false
    }
    if (!formData.content.trim()) {
      setError('Content is required')
      return false
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required')
      return false
    }
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    return true
  }

  const handleSave = async (publish = false) => {
    if (!validateForm()) return

    const status = publish ? 'PUBLISHED' : formData.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'

    const payload = {
      ...formData,
      status,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    try {
      setIsSaving(true)
      setError('')

      if (isEditing && postId) {
        await api.put(`/blog/posts/${postId}`, payload)
      } else {
        await api.post('/blog/posts', payload)
      }

      navigate('/admin/blog')
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = () => handleSave(true)
  const handleSaveDraft = () => handleSave(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="btn-ghost p-2"
            title="Back to Blog Admin"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-heading-lg font-bold text-warmgray-900">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h2>
            <p className="text-warmgray-600 text-sm">
              {formData.status === 'PUBLISHED' ? (
                <span className="inline-flex items-center text-green-600">
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center text-warmgray-500">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Draft
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`btn-outline text-sm py-2 ${showPreview ? 'bg-coral-50 border-coral-300 text-coral-700' : ''}`}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="btn-outline text-sm py-2"
          >
            {isSaving && formData.status !== 'PUBLISHED' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="btn-primary text-sm py-2"
          >
            {isSaving && (formData.status === 'PUBLISHED' || isSaving) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {formData.status === 'PUBLISHED' ? 'Update' : 'Publish'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
          <X className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Form */}
        <div className="space-y-6">
          {/* Main Content Card */}
          <div className="card p-6">
            <h3 className="text-heading-sm font-bold text-warmgray-900 mb-4">Post Content</h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter post title"
                  className="input"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                  <span className="text-warmgray-500 font-normal ml-1">(URL-friendly name)</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-warmgray-100 border border-r-0 border-warmgray-300 rounded-l-xl text-warmgray-500 text-sm">
                    /blog/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="post-slug"
                    className="input rounded-l-none"
                  />
                </div>
                <p className="text-xs text-warmgray-500 mt-1">
                  Auto-generated from title. Edit to customize.
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  Excerpt <span className="text-red-500">*</span>
                  <span className="text-warmgray-500 font-normal ml-1">(Short summary for previews)</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  placeholder="Write a brief summary..."
                  rows={3}
                  className="input resize-none"
                />
                <p className="text-xs text-warmgray-500 mt-1">
                  {formData.excerpt.length} characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  Content <span className="text-red-500">*</span>
                  <span className="text-warmgray-500 font-normal ml-1">(HTML supported)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Write your post content here..."
                  rows={12}
                  className="input font-mono text-sm resize-y min-h-[300px]"
                />
              </div>
            </div>
          </div>

          {/* SEO & Meta Card */}
          <div className="card p-6">
            <h3 className="text-heading-sm font-bold text-warmgray-900 mb-4">SEO & Metadata</h3>
            
            <div className="space-y-4">
              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  Meta Description
                  <span className="text-warmgray-500 font-normal ml-1">(For search engines)</span>
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="Brief description for search results..."
                  rows={2}
                  className="input resize-none"
                />
                <p className="text-xs text-warmgray-500 mt-1">
                  {formData.metaDescription.length} / 160 characters recommended
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <div className="card p-6">
            <h3 className="text-heading-sm font-bold text-warmgray-900 mb-4">Publishing</h3>
            
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'DRAFT')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.status === 'DRAFT'
                        ? 'bg-coral-500 text-white'
                        : 'bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('status', 'PUBLISHED')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.status === 'PUBLISHED'
                        ? 'bg-green-500 text-white'
                        : 'bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="card p-6">
            <h3 className="text-heading-sm font-bold text-warmgray-900 mb-4">Featured Image</h3>
            
            <div className="space-y-4">
              {formData.featuredImageUrl ? (
                <div className="relative">
                  <img
                    src={formData.featuredImageUrl}
                    alt="Featured"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleChange('featuredImageUrl', '')}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-warmgray-300 rounded-xl p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-warmgray-400 mx-auto mb-3" />
                  <p className="text-sm text-warmgray-500 mb-2">Enter image URL below</p>
                </div>
              )}
              
              <input
                type="url"
                value={formData.featuredImageUrl}
                onChange={(e) => handleChange('featuredImageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input"
              />
            </div>
          </div>

          {/* Category & Tags Card */}
          <div className="card p-6">
            <h3 className="text-heading-sm font-bold text-warmgray-900 mb-4">Organization</h3>
            
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1.5">
                  <span className="inline-flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </span>
                  <span className="text-warmgray-500 font-normal ml-1">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="event-planning, tips, guide"
                  className="input"
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.split(',').map((tag, idx) => (
                      tag.trim() && (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-coral-50 text-coral-700 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card p-6">
                <h3 className="text-heading-sm font-bold text-warmgray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Preview
                </h3>
                
                <div className="border border-warmgray-200 rounded-xl overflow-hidden">
                  {/* Preview Header */}
                  <div className="bg-warmgray-50 border-b border-warmgray-200 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-warmgray-500">milktix.com/blog/{formData.slug || '...'}</span>
                    </div>
                  </div>
                  
                  {/* Preview Content */}
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    {formData.featuredImageUrl && (
                      <img
                        src={formData.featuredImageUrl}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    {formData.category && (
                      <span className="inline-block px-2 py-1 bg-coral-100 text-coral-700 text-xs font-medium rounded-full mb-2">
                        {formData.category}
                      </span>
                    )}
                    
                    <h1 className="text-lg font-bold text-warmgray-900 mb-2">
                      {formData.title || 'Untitled Post'}
                    </h1>
                    
                    {formData.excerpt && (
                      <p className="text-sm text-warmgray-600 italic mb-4">
                        {formData.excerpt}
                      </p>
                    )}
                    
                    {formData.content ? (
                      <div 
                        className="prose prose-sm prose-warmgray max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: formData.content.slice(0, 500) + (formData.content.length > 500 ? '...' : '') 
                        }}
                      />
                    ) : (
                      <p className="text-warmgray-400 text-sm">No content yet...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
