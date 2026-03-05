import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Clock,
  Eye,
  Share2,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
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
  metaDescription: string
  author: {
    id: string
    fullName: string
    avatarUrl?: string
    bio?: string
  }
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImageUrl: string | null
  category: string
  publishedAt: string | null
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided')
      const response = await api.get(`/blog/posts/${slug}`)
      return response.data as BlogPost
    },
    enabled: !!slug,
  })

  const { data: relatedPosts } = useQuery({
    queryKey: ['blog-related', post?.category, post?.id],
    queryFn: async () => {
      if (!post) return []
      const response = await api.get(`/blog/posts?category=${post.category}&limit=3&exclude=${post.id}`)
      return response.data as RelatedPost[]
    },
    enabled: !!post,
  })

  // Update meta description for SEO
  useEffect(() => {
    if (post?.metaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', post.metaDescription)
      }
    }
  }, [post])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-warmgray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-warmgray-50">
        <div className="container-custom py-12">
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-20 h-20 bg-warmgray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-warmgray-400" />
            </div>
            <h2 className="text-xl font-semibold text-warmgray-900 mb-2">Article not found</h2>
            <p className="text-warmgray-600 mb-6">
              The article you're looking for may have been removed or is no longer available.
            </p>
            <Link to="/blog" className="btn-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Back Link */}
      <div className="container-custom pt-6">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center text-warmgray-600 hover:text-coral-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </button>
      </div>

      {/* Hero Section */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Category & Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="badge-coral">
              {post.category}
            </span>
            {post.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warmgray-100 text-warmgray-600"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-display-md md:text-display-lg font-bold text-warmgray-900 mb-6">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex flex-wrap items-center gap-6 text-warmgray-600 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
                <User className="h-6 w-6 text-coral-600" />
              </div>
              <div>
                <p className="font-semibold text-warmgray-900">{post.author.fullName}</p>
                {post.author.bio && (
                  <p className="text-sm text-warmgray-500">{post.author.bio}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-coral-500" />
                  <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-coral-500" />
                <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-coral-500" />
                <span>{post.viewCount.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container-custom pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="card p-6 md:p-10">
                {/* Excerpt */}
                <p className="text-lg text-warmgray-600 italic mb-8 border-l-4 border-coral-300 pl-4">
                  {post.excerpt}
                </p>

                {/* HTML Content */}
                <div 
                  className="prose prose-warmgray max-w-none prose-headings:text-warmgray-900 prose-p:text-warmgray-600 prose-a:text-coral-600 hover:prose-a:text-coral-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share Section */}
                <div className="mt-10 pt-8 border-t border-warmgray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-warmgray-600 font-medium">Share this article</span>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: post.title,
                            text: post.excerpt,
                            url: window.location.href,
                          })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                        }
                      }}
                      className="btn-outline text-sm py-2 px-4"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Author Card */}
                <div className="card p-5">
                  <h3 className="text-heading-xs font-bold text-warmgray-900 mb-4">About the Author</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center">
                      <User className="h-7 w-7 text-coral-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-warmgray-900">{post.author.fullName}</p>
                    </div>
                  </div>
                  {post.author.bio && (
                    <p className="text-sm text-warmgray-600">{post.author.bio}</p>
                  )}
                </div>

                {/* Post Info */}
                <div className="card p-5">
                  <h3 className="text-heading-xs font-bold text-warmgray-900 mb-4">Article Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-warmgray-500">Published</span>
                      <span className="text-warmgray-700">
                        {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warmgray-500">Updated</span>
                      <span className="text-warmgray-700">
                        {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warmgray-500">Views</span>
                      <span className="text-warmgray-700">{post.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="bg-white border-t border-warmgray-200">
          <div className="container-custom py-12">
            <h2 className="text-heading-md font-bold text-warmgray-900 mb-8">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="card-interactive group"
                >
                  <div className="relative h-40 overflow-hidden">
                    {relatedPost.featuredImageUrl ? (
                      <img
                        src={relatedPost.featuredImageUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full gradient-coral flex items-center justify-center">
                        <FileText className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-warmgray-800 text-xs font-medium rounded-full">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-warmgray-900 group-hover:text-coral-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.publishedAt && (
                      <p className="text-sm text-warmgray-500 mt-2">
                        {format(new Date(relatedPost.publishedAt), 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
