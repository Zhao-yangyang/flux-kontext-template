import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { handlePaymentSuccess } from "@/lib/payment"
import { getStripeClient, isStripeAvailable } from "@/lib/stripe-client"

export async function POST(request: NextRequest) {
  try {
    // 检查Stripe是否可用
    if (!isStripeAvailable()) {
      return NextResponse.json(
        { error: "Stripe支付未启用或配置不完整" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "缺少Stripe签名" },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error("Webhook签名验证失败:", err)
      return NextResponse.json(
        { error: "Webhook签名验证失败" },
        { status: 400 }
      )
    }

    // 处理不同类型的事件
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handlePaymentSuccess("stripe", session.id)
        break

      case "invoice.payment_succeeded":
        // 处理订阅续费成功
        const invoice = event.data.object as Stripe.Invoice
        console.log("订阅续费成功:", invoice.id)
        break

      case "customer.subscription.deleted":
        // 处理订阅取消
        const subscription = event.data.object as Stripe.Subscription
        console.log("订阅已取消:", subscription.id)
        break

      default:
        console.log(`未处理的事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Stripe Webhook处理失败:", error)
    return NextResponse.json(
      { error: "Webhook处理失败" },
      { status: 500 }
    )
  }
}

// 🔍 支持GET请求用于验证端点状态
export async function GET() {
  const config = {
    hasPublicKey: !!(process.env.STRIPE_PUBLIC_KEY),
    hasPrivateKey: !!(process.env.STRIPE_PRIVATE_KEY),
    hasWebhookSecret: !!(process.env.STRIPE_WEBHOOK_SECRET),
    isEnabled: isStripeAvailable()
  }

  return NextResponse.json({
    message: 'Stripe Webhook端点正常运行',
    endpoint: '/api/webhooks/stripe',
    provider: 'stripe',
    timestamp: new Date().toISOString(),
    configuration: {
      ...config,
      // 不暴露敏感信息
      publicKey: config.hasPublicKey ? '已配置' : '未配置',
      privateKey: config.hasPrivateKey ? '已配置' : '未配置',
      webhookSecret: config.hasWebhookSecret ? '已配置' : '未配置'
    },
    status: config.isEnabled ? 'ready' : 'configuration_incomplete'
  })
} 