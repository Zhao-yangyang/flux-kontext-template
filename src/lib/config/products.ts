// 🎯 产品配置管理系统
// 支持多支付平台的产品ID动态映射，避免硬编码

export interface ProductMapping {
  // 内部产品标识
  internal_id: string
  product_name: string
  description: string
  price: number
  currency: string
  credits: number
  billing_cycle?: 'monthly' | 'yearly' | 'one_time'
  
  // 支付平台产品ID映射
  stripe_product_id?: string
  stripe_price_id?: string
  creem_product_id?: string
  
  // 元数据
  is_active: boolean
  created_at?: Date
  updated_at?: Date
}

// 🔧 默认产品配置 - 可以被数据库配置覆盖
export const DEFAULT_PRODUCT_CONFIG: ProductMapping[] = [
  // 订阅产品
  {
    internal_id: 'plus_monthly',
    product_name: 'Plus Monthly Plan',
    description: 'Plus plan billed monthly',
    price: 9.90,
    currency: 'USD',
    credits: 1900,
    billing_cycle: 'monthly',
    stripe_product_id: 'prod_stripe_plus_monthly',
    stripe_price_id: 'price_stripe_plus_monthly',
    creem_product_id: 'prod_426VrOFIOZc6kZQukh6zj2', // 实际的Creem产品ID
    is_active: true
  },
  {
    internal_id: 'plus_yearly',
    product_name: 'Plus Yearly Plan',
    description: 'Plus plan billed yearly',
    price: 99.00,
    currency: 'USD',
    credits: 24000,
    billing_cycle: 'yearly',
    stripe_product_id: 'prod_stripe_plus_yearly',
    stripe_price_id: 'price_stripe_plus_yearly',
    creem_product_id: 'prod_1xe5segJqwLX9PMP1sPcyY',
    is_active: true
  },
  {
    internal_id: 'pro_monthly',
    product_name: 'Pro Monthly Plan',
    description: 'Pro plan billed monthly',
    price: 29.90,
    currency: 'USD',
    credits: 8900,
    billing_cycle: 'monthly',
    stripe_product_id: 'prod_stripe_pro_monthly',
    stripe_price_id: 'price_stripe_pro_monthly',
    creem_product_id: 'prod_1tSOKzqdhjeeOqSXNmbYze',
    is_active: true
  },
  {
    internal_id: 'pro_yearly',
    product_name: 'Pro Yearly Plan',
    description: 'Pro plan billed yearly',
    price: 299.00,
    currency: 'USD',
    credits: 120000,
    billing_cycle: 'yearly',
    stripe_product_id: 'prod_stripe_pro_yearly',
    stripe_price_id: 'price_stripe_pro_yearly',
    creem_product_id: 'prod_2qQ9ZPFWfO4l48zUIh1ads',
    is_active: true
  },
  
  // 积分包产品
  {
    internal_id: 'starter_pack',
    product_name: 'Starter Credit Pack',
    description: 'Starter credit pack for occasional use',
    price: 4.90,
    currency: 'USD',
    credits: 600,
    billing_cycle: 'one_time',
    stripe_product_id: 'prod_stripe_starter',
    stripe_price_id: 'price_stripe_starter',
    creem_product_id: 'prod_vqppA0sC44rrhwN5bXWsO',
    is_active: true
  },
  {
    internal_id: 'creator_pack',
    product_name: 'Creator Credit Pack',
    description: 'Creator credit pack for professionals',
    price: 15.00,
    currency: 'USD',
    credits: 4000,
    billing_cycle: 'one_time',
    stripe_product_id: 'prod_stripe_creator',
    stripe_price_id: 'price_stripe_creator',
    creem_product_id: 'prod_4snxLt65rTm7hhSwAcMrFS',
    is_active: true
  },
  {
    internal_id: 'business_pack',
    product_name: 'Business Credit Pack',
    description: 'Business credit pack for heavy users',
    price: 60.00,
    currency: 'USD',
    credits: 18000,
    billing_cycle: 'one_time',
    stripe_product_id: 'prod_stripe_business',
    stripe_price_id: 'price_stripe_business',
    creem_product_id: 'prod_5jWrmjopK5t302oQZo8y2B',
    is_active: true
  }
]

// 🔍 产品配置查询服务
export class ProductConfigService {
  private static config: ProductMapping[] = DEFAULT_PRODUCT_CONFIG

  /**
   * 根据内部产品ID获取产品配置
   */
  static getProductByInternalId(internal_id: string): ProductMapping | null {
    return this.config.find(p => p.internal_id === internal_id && p.is_active) || null
  }

  /**
   * 根据支付平台产品ID获取内部产品配置
   */
  static getProductByProviderId(provider: 'stripe' | 'creem', provider_product_id: string): ProductMapping | null {
    if (provider === 'stripe') {
      return this.config.find(p => 
        (p.stripe_product_id === provider_product_id || p.stripe_price_id === provider_product_id) 
        && p.is_active
      ) || null
    } else if (provider === 'creem') {
      return this.config.find(p => 
        p.creem_product_id === provider_product_id && p.is_active
      ) || null
    }
    return null
  }

  /**
   * 获取特定支付平台的产品ID
   */
  static getProviderProductId(internal_id: string, provider: 'stripe' | 'creem'): string | null {
    const product = this.getProductByInternalId(internal_id)
    if (!product) return null

    if (provider === 'stripe') {
      return product.stripe_product_id || null
    } else if (provider === 'creem') {
      return product.creem_product_id || null
    }
    return null
  }

  /**
   * 获取Stripe Price ID (专用于Stripe订阅)
   */
  static getStripePriceId(internal_id: string): string | null {
    const product = this.getProductByInternalId(internal_id)
    return product?.stripe_price_id || null
  }

  /**
   * 根据产品类型获取所有活跃产品
   */
  static getProductsByType(billing_cycle?: 'monthly' | 'yearly' | 'one_time'): ProductMapping[] {
    if (!billing_cycle) {
      return this.config.filter(p => p.is_active)
    }
    return this.config.filter(p => p.billing_cycle === billing_cycle && p.is_active)
  }

  /**
   * 从前端传递的产品信息映射到内部产品ID
   * 支持legacy的产品名称映射
   */
  static mapLegacyProductToInternal(productType: string, productId: string, billingCycle?: string): string | null {
    // 1. 尝试直接匹配内部ID
    if (this.getProductByInternalId(productId)) {
      return productId
    }

    // 2. 尝试匹配Creem产品ID
    const creemProduct = this.getProductByProviderId('creem', productId)
    if (creemProduct) {
      return creemProduct.internal_id
    }

    // 3. 兼容legacy映射规则
    const legacyMapping: Record<string, string> = {
      // 积分包映射
      'starter': 'starter_pack',
      'creator': 'creator_pack', 
      'business': 'business_pack',
      
      // 订阅映射
      'plus': billingCycle === 'yearly' ? 'plus_yearly' : 'plus_monthly',
      'pro': billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly',
    }

    return legacyMapping[productId] || null
  }

  /**
   * 更新产品配置 (可用于管理员界面)
   */
  static updateConfig(newConfig: ProductMapping[]): void {
    this.config = newConfig
    console.log('🔄 产品配置已更新:', newConfig.length, '个产品')
  }

  /**
   * 验证产品配置的完整性
   */
  static validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    for (const product of this.config) {
      if (!product.internal_id) {
        errors.push(`产品缺少 internal_id: ${product.product_name}`)
      }
      
      if (!product.creem_product_id && !product.stripe_product_id) {
        errors.push(`产品 ${product.internal_id} 没有配置任何支付平台ID`)
      }
      
      if (product.price <= 0) {
        errors.push(`产品 ${product.internal_id} 价格必须大于0`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取配置摘要
   */
  static getConfigSummary() {
    const active = this.config.filter(p => p.is_active)
    const stripeCount = active.filter(p => p.stripe_product_id).length
    const creemCount = active.filter(p => p.creem_product_id).length
    
    return {
      total: active.length,
      stripe_products: stripeCount,
      creem_products: creemCount,
      subscription_products: active.filter(p => p.billing_cycle !== 'one_time').length,
      credit_pack_products: active.filter(p => p.billing_cycle === 'one_time').length
    }
  }
} 