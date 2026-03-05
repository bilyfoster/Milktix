import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  ChevronRight, 
  FileText,
  User,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImageUrl: string | null
  category: string
  tags: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  viewCount: number
  author: {
    id: string
    fullName: string
    avatarUrl?: string
  }
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  postCount: number
}

// Skeleton component for loading state
function BlogCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-warmgray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-warmgray-200 rounded w-1/4"></div>
        <div className="h-6 bg-warmgray-200 rounded w-3/4"></div>
        <div className="h-4 bg-warmgray-200 rounded w-full"></div>
        <div className="h-4 bg-warmgray-200 rounded w-2/3"></div>
        <div className="flex items-center gap-2 pt-2">
          <div className="w-8 h-8 rounded-full bg-warmgray-200"></div>
          <div className="h-4 bg-warmgray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function BlogList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const response = await api.get('/blog/posts')
      return response.data as BlogPost[]
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const response = await api.get('/blog/categories')
      return response.data as BlogCategory[]
    },
  })

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory && post.status === 'PUBLISHED'
  })

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-warmgray-50">
        {/* Header */}
        <div className="bg-white border-b border-warmgray-200">
          <div className="container-custom py-6">
            <h1 className="text-heading-lg font-bold text-warmgray-900">Blog</h1>
            <p className="text-warmgray-600 mt-1">Latest news, tips, and updates</p>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="container-custom py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (postsError) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-error-500" />
          </div>
          <h2 className="text-xl font-semibold text-warmgray-900 mb-2">Unable to load blog posts</h2>
          <p className="text-warmgray-600 mb-4">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Header */}
      <div className="bg-white border-b border-warmgray-200">
        <div className="container-custom py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-heading-lg font-bold text-warmgray-900">Blog</h1>
              <p className="text-warmgray-600 mt-1">
                {filteredPosts?.length || 0} article{filteredPosts?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="container-custom py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <Filter className="h-5 w-5 text-warmgray-400 flex-shrink-0" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-coral-500 text-white shadow-soft'
                  : 'bg-white text-warmgray-700 border border-warmgray-200 hover:border-coral-300 hover:text-coral-600'
              }`}
            >
              All Categories
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-coral-500 text-white shadow-soft'
                    : 'bg-white text-warmgray-700 border border-warmgray-200 hover:border-coral-300 hover:text-coral-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container-custom pb-16">
        {filteredPosts?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-warmgray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-warmgray-400" />
            </div>
            <h3 className="text-lg font-semibold text-warmgray-900 mb-2">No articles found</h3>
            <p className="text-warmgray-600">Try adjusting your search or filters</p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="btn-primary mt-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts?.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="card-interactive group flex flex-col h-full"
              >
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden">
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full gradient-coral flex items-center justify-center">
                      <FileText className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-warmgray-800 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>

                  {/* Date Badge */}
                  {post.publishedAt && (
                    <div className="absolute top-4 right-4 bg-white rounded-xl px-3 py-2 text-center shadow-soft">
                      <div className="text-xs font-bold text-coral-600 uppercase tracking-wider">
                        {format(new Date(post.publishedAt), 'MMM')}
                      </div>
                      <div className="text-2xl font-bold text-warmgray-900">
                        {format(new Date(post.publishedAt), 'd')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-heading-sm font-bold text-warmgray-900 group-hover:text-coral-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="mt-2 text-warmgray-600 text-body-sm line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center text-xs text-warmgray-500"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                          {idx < Math.min(post.tags.length, 3) - 1 && (
                            <span className="mx-1">,</span>
                          )}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-warmgray-400">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author & Read More */}
                  <div className="mt-4 pt-4 border-t border-warmgray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-coral-600" />
                      </div>
                      <span className="text-sm text-warmgray-600">{post.author.fullName}</span>
                    </div>
                    
                    <div className="flex items-center text-coral-600 font-semibold text-sm">
                      Read More
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
