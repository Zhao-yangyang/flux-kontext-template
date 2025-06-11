"use client"

import { useSearchParams } from 'next/navigation'
import { CheckCircle, Home, CreditCard, ArrowRight } from 'lucide-react'

export function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  
  // 🔍 获取支付参数
  const checkoutId = searchParams.get('checkout_id')
  const orderId = searchParams.get('order_id')
  const sessionId = searchParams.get('session_id')
  
  // 🔍 判断支付平台
  const isCreemPayment = checkoutId || orderId
  const isStripePayment = sessionId
  const paymentProvider = isCreemPayment ? 'Creem' : isStripePayment ? 'Stripe' : 'Unknown'

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* 🎉 成功图标和标题 */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
      </div>

      {/* 📋 支付信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Provider:</span>
            <span className="font-medium">{paymentProvider}</span>
          </div>
          
          {checkoutId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Checkout ID:</span>
              <span className="font-mono text-xs">{checkoutId}</span>
            </div>
          )}
          
          {orderId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
          )}
          
          {sessionId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Session ID:</span>
              <span className="font-mono text-xs">{sessionId}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-500">Processed At:</span>
            <span className="text-xs">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 🚀 主要操作按钮 - 使用原生HTML */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-purple-900">What's Next?</h2>
        <p className="text-purple-700">
          Your credits have been added to your account. Choose your next action:
        </p>
        
        {/* 主要按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="/dashboard" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 text-center"
          >
            <CreditCard className="h-5 w-5" />
            View Dashboard
          </a>
          <a 
            href="/generate" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-purple-300 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors duration-200 text-center"
          >
            <ArrowRight className="h-5 w-5" />
            Start Generating
          </a>
        </div>
        
        {/* 次要按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <a 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 text-center"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </a>
          <a 
            href="/pricing" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 text-center"
          >
            <CreditCard className="h-4 w-4" />
            View Pricing
          </a>
        </div>
      </div>

      {/* 📞 联系支持 */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Need help? Email us at{' '}
          <a 
            href="mailto:support@fluxkontext.space" 
            className="text-purple-600 hover:underline font-medium"
          >
            support@fluxkontext.space
          </a>
        </p>
      </div>

      {/* 🎉 成功提示 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium">
          🎉 Success! Your credits are now available in your account. 
          Start creating amazing AI images right away!
        </p>
      </div>
    </div>
  )
} 