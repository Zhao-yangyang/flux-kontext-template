"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Home, CreditCard, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

interface PaymentDetails {
  request_id?: string
  checkout_id?: string
  order_id?: string
  customer_id?: string
  subscription_id?: string
  product_id?: string
  signature?: string
  session_id?: string // Stripe会话ID
}

export function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({})
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  // 🕒 客户端时间设置，避免hydration错误
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())
    
    // 🔍 获取URL参数
    const details: PaymentDetails = {
      request_id: searchParams.get('request_id') || undefined,
      checkout_id: searchParams.get('checkout_id') || undefined,
      order_id: searchParams.get('order_id') || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      subscription_id: searchParams.get('subscription_id') || undefined,
      product_id: searchParams.get('product_id') || undefined,
      signature: searchParams.get('signature') || undefined,
      session_id: searchParams.get('session_id') || undefined,
    }

    setPaymentDetails(details)
    setIsLoading(false)

    // 🎉 记录支付成功事件
    console.log('🎉 支付成功页面加载:', details)
  }, [searchParams])
  
  // 🔍 判断支付平台
  const isCreemPayment = paymentDetails.checkout_id || paymentDetails.order_id
  const isStripePayment = paymentDetails.session_id
  const paymentProvider = isCreemPayment ? 'Creem' : isStripePayment ? 'Stripe' : 'Unknown'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 🎉 成功标题区域 */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Payment Successful!
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Thank you for your purchase. Your payment has been processed successfully and your credits are now available.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 📋 支付详情卡片 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Payment Details</CardTitle>
                </div>
                <CardDescription>
                  Transaction information for your recent purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium text-muted-foreground">Payment Provider</span>
                    <Badge variant={paymentProvider === 'Unknown' ? 'secondary' : 'default'}>
                      {paymentProvider}
                    </Badge>
                  </div>
                  
                  {paymentDetails.checkout_id && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">Checkout ID</span>
                      <code className="text-xs bg-accent px-2 py-1 rounded font-mono">
                        {paymentDetails.checkout_id}
                      </code>
                    </div>
                  )}
                  
                  {paymentDetails.order_id && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                      <code className="text-xs bg-accent px-2 py-1 rounded font-mono">
                        {paymentDetails.order_id}
                      </code>
                    </div>
                  )}
                  
                  {paymentDetails.session_id && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">Session ID</span>
                      <code className="text-xs bg-accent px-2 py-1 rounded font-mono">
                        {paymentDetails.session_id}
                      </code>
                    </div>
                  )}

                  {paymentDetails.customer_id && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">Customer ID</span>
                      <code className="text-xs bg-accent px-2 py-1 rounded font-mono">
                        {paymentDetails.customer_id}
                      </code>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Processed At</span>
                    </span>
                    <span className="text-sm" suppressHydrationWarning>
                      {currentTime || 'Loading...'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🚀 下一步操作卡片 */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>What's Next?</CardTitle>
                </div>
                <CardDescription>
                  Your credits have been added to your account. Choose your next action:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 主要操作按钮 */}
                <div className="space-y-3">
                  <Link href="/dashboard">
                    <Button className="w-full h-12 text-base" size="lg">
                      <CreditCard className="mr-2 h-5 w-5" />
                      View Dashboard
                    </Button>
                  </Link>
                  
                  <Link href="/generate">
                    <Button variant="outline" className="w-full h-12 text-base" size="lg">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Start Generating
                    </Button>
                  </Link>
                </div>
                
                {/* 次要操作按钮 */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Button>
                  </Link>
                  
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 📞 联系支持 */}
          <Card className="bg-accent/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about your purchase or account, we're here to help.
                </p>
                <div className="pt-2">
                  <a 
                    href="mailto:support@fluxkontext.space" 
                    className="text-primary hover:underline font-medium"
                  >
                    support@fluxkontext.space
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🎉 成功提示 */}
          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    🎉 Welcome to Flux Kontext Pro!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your credits are now available. Start creating amazing AI images with our advanced tools and features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
} 