import { Suspense } from 'react'
import { PaymentSuccessContent } from '../../../components/PaymentSuccessContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Successful | FluxKontext.space',
  description: 'Your payment has been processed successfully. Thank you for your purchase!',
  robots: 'noindex, nofollow', // 不要被搜索引擎索引
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-background overflow-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
} 