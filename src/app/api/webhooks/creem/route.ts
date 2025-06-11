import { NextRequest, NextResponse } from 'next/server'
import { handleCreemWebhook } from '@/lib/payment/creem'

// 🎯 CREEM专用Webhook处理器
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 收到CREEM Webhook请求')
    
    // 🔍 获取请求体和签名 - 使用正确的CREEM签名头部
    const body = await request.text()
    const signature = request.headers.get('creem-signature') || 
                     request.headers.get('x-creem-signature') || 
                     request.headers.get('x-signature') || 
                     request.headers.get('signature') || ''

    console.log('📨 CREEM Webhook 详情:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      signaturePreview: signature ? signature.substring(0, 10) + '...' : 'none',
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent'),
      allHeaders: Object.fromEntries(request.headers.entries())
    })

    // 🔐 处理CREEM Webhook
    const result = await handleCreemWebhook(body, signature)

    if (result.success) {
      console.log('✅ CREEM Webhook处理成功:', {
        eventType: result.event?.type,
        eventId: result.event?.id,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ 
        success: true, 
        provider: 'creem',
        message: 'CREEM Webhook处理成功',
        eventType: result.event?.type,
        eventId: result.event?.id,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('❌ CREEM Webhook处理失败:', result.error)
      
      return NextResponse.json(
        { 
          success: false, 
          provider: 'creem',
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('💥 CREEM Webhook处理异常:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        provider: 'creem',
        error: 'CREEM Webhook处理异常',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 🔍 支持GET请求用于验证端点状态
export async function GET() {
  const config = {
    hasApiKey: !!(process.env.CREEM_API_KEY),
    hasApiUrl: !!(process.env.CREEM_API_URL),
    hasWebhookSecret: !!(process.env.CREEM_WEBHOOK_SECRET),
    apiUrl: process.env.CREEM_API_URL,
    isTestMode: process.env.CREEM_API_URL?.includes('test-api')
  }

  return NextResponse.json({
    message: 'CREEM Webhook端点正常运行',
    endpoint: '/api/webhooks/creem',
    provider: 'creem',
    timestamp: new Date().toISOString(),
    configuration: {
      ...config,
      // 不暴露敏感信息
      apiKey: config.hasApiKey ? '已配置' : '未配置',
      webhookSecret: config.hasWebhookSecret ? '已配置' : '未配置'
    },
    status: config.hasApiKey && config.hasApiUrl ? 'ready' : 'configuration_incomplete'
  })
} 