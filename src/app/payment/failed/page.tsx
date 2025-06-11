import { Suspense } from 'react'
import { PaymentFailedContent } from '@/components/PaymentFailedContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Failed | FluxKontext.space',
  description: 'Your payment could not be processed. Please try again.',
  robots: 'noindex, nofollow', // 不要被搜索引擎索引
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        }>
          <PaymentFailedContent />
        </Suspense>
      </div>
    </div>
  )
} 