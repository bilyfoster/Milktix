import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '../utils/api'

interface CmsPageData {
  slug: string
  title: string
  content: string
  metaDescription?: string
  fallback?: boolean
}

export function CmsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<CmsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchPage(slug)
    }
  }, [slug])

  const fetchPage = async (pageSlug: string) => {
    try {
      setLoading(true)
      const response = await api.get(`/cms/pages/${pageSlug}`)
      setPage(response.data)
    } catch (err) {
      console.error('Failed to fetch page:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  if (error || !page) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-warmgray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-warmgray-900 mb-6">{page.title}</h1>
          
          {page.fallback && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                This page is using default content. Visit the admin panel to customize it.
              </p>
            </div>
          )}
          
          <div 
            className="prose prose-warmgray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  )
}
