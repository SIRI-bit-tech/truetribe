'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface InfiniteScrollProps {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  children: React.ReactNode
  threshold?: number
}

export default function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  threshold = 0.1
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: false
  })

  const loadMoreRef = useRef(onLoadMore)
  loadMoreRef.current = onLoadMore

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreRef.current()
    }
  }, [inView, hasMore, loading])

  return (
    <div className="w-full">
      {children}
      
      {/* Loading trigger */}
      <div ref={ref} className="w-full py-8">
        {loading && (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {!hasMore && !loading && (
          <div className="text-center text-white/60 py-8">
            <div className="glass rounded-lg p-6 max-w-md mx-auto">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-white mb-2">You're all caught up!</h3>
              <p className="text-sm text-white/70">
                You've seen all the latest posts from verified users in your network.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}