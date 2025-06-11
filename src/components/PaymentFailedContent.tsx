"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, Home, CreditCard, RotateCcw, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface FailureDetails {
  error?: string
  error_description?: string
  session_id?: string
  checkout_id?: string
}

export function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const [failureDetails, setFailureDetails] = useState<FailureDetails>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 🔍 获取URL参数
    const details: FailureDetails = {
      error: searchParams.get('error') || undefined,
      error_description: searchParams.get('error_description') || undefined,
      session_id: searchParams.get('session_id') || undefined,
      checkout_id: searchParams.get('checkout_id') || undefined,
    }

    setFailureDetails(details)
    setIsLoading(false)

    // 📝 记录支付失败事件
    console.log('❌ 支付失败页面加载:', details)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ❌ 失败标题 */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600">
          We're sorry, but your payment could not be processed. Please try again.
        </p>
      </div>

      {/* ⚠️ 错误信息 */}
      {(failureDetails.error || failureDetails.error_description) && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  <strong>Error:</strong> {failureDetails.error || 'Payment processing failed'}
                </p>
                {failureDetails.error_description && (
                  <p className="text-sm text-red-700 mt-1">
                    <strong>Details:</strong> {failureDetails.error_description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 📋 失败详情卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            What Happened?
          </CardTitle>
          <CardDescription>
            Your payment was not processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Common reasons for payment failure include:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details or expired card</li>
              <li>• Your bank declined the transaction</li>
              <li>• Network connection issues</li>
              <li>• Security restrictions from your bank</li>
            </ul>
          </div>

          {/* 会话信息 */}
          {(failureDetails.session_id || failureDetails.checkout_id) && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Transaction Details:</p>
              {failureDetails.session_id && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Session ID</span>
                  <span className="text-sm font-mono text-gray-900">{failureDetails.session_id}</span>
                </div>
              )}
              {failureDetails.checkout_id && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Checkout ID</span>
                  <span className="text-sm font-mono text-gray-900">{failureDetails.checkout_id}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📝 下一步操作 */}
      <Card>
        <CardHeader>
          <CardTitle>What Can You Do?</CardTitle>
          <CardDescription>
            Here are some options to resolve the payment issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild className="w-full">
              <Link href="/pricing" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
          
          <Button asChild variant="secondary" className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Still having trouble? Please email us at{' '}
              <a href="mailto:support@fluxkontext.space" className="text-red-600 hover:underline">
                support@fluxkontext.space
              </a>{' '}
              for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 