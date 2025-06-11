#!/usr/bin/env node

// 🔍 产品配置验证脚本
// 运行: node scripts/validate-product-config.js
// 功能: 验证实际的产品配置文件和前端pricing配置的一致性

const fs = require('fs')
const path = require('path')

console.log("🔧 产品配置验证开始...")
console.log("=" * 50)

// 读取真实的配置文件
function loadConfigurations() {
  try {
    // 1. 读取前端pricing配置
    const pricingPath = path.join(__dirname, '../src/lib/content/pricing.json')
    const pricingConfig = JSON.parse(fs.readFileSync(pricingPath, 'utf8'))
    
    // 2. 读取环境变量配置
    const envPath = path.join(__dirname, '../.env.local')
    const envConfig = {}
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
          envConfig[key.trim()] = value.trim().replace(/"/g, '')
        }
      })
    }
    
    console.log("✅ 成功加载配置文件:")
    console.log(`   - pricing.json: ${pricingConfig.plans.length + pricingConfig.creditPacks.length} 个产品`)
    console.log(`   - .env.local: ${Object.keys(envConfig).length} 个环境变量`)
    
    return { pricingConfig, envConfig }
  } catch (error) {
    console.error("❌ 加载配置文件失败:", error.message)
    process.exit(1)
  }
}

// 验证配置完整性
function validateConfigurations(pricingConfig, envConfig) {
  const errors = []
  const warnings = []
  
  console.log("\n🔍 验证支付系统配置:")
  
  // 1. 验证环境变量
  const requiredEnvVars = [
    'CREEM_API_KEY',
    'CREEM_API_URL', 
    'NEXT_PUBLIC_ENABLE_CREEM',
    'NEXT_PUBLIC_ENABLE_STRIPE'
  ]
  
  for (const envVar of requiredEnvVars) {
    if (!envConfig[envVar]) {
      if (envVar.includes('CREEM') && envConfig['NEXT_PUBLIC_ENABLE_CREEM'] !== 'true') {
        continue // 如果Creem未启用，跳过Creem相关变量
      }
      if (envVar.includes('STRIPE') && envConfig['NEXT_PUBLIC_ENABLE_STRIPE'] !== 'true') {
        continue // 如果Stripe未启用，跳过Stripe相关变量
      }
      warnings.push(`缺少环境变量: ${envVar}`)
    }
  }
  
  // 2. 验证前端产品配置
  const allProducts = [...pricingConfig.plans, ...pricingConfig.creditPacks]
  
  console.log("📊 前端产品配置摘要:")
  console.log(`- 订阅计划: ${pricingConfig.plans.length} 个`)
  console.log(`- 积分包: ${pricingConfig.creditPacks.length} 个`)
  console.log(`- 总产品数: ${allProducts.length}`)
  
  console.log("\n🔍 详细验证:")
  
  // 验证订阅计划
  for (const plan of pricingConfig.plans) {
    console.log(`\n📦 验证订阅计划: ${plan.name}`)
    
    // 检查是否为免费计划
    const isFree = plan.monthlyPrice === 0 && plan.yearlyPrice === 0
    
    if (isFree) {
      console.log(`  🆓 检测到免费计划: ${plan.name}`)
      if (plan.creemProductIds) {
        warnings.push(`免费计划 ${plan.name} 不应该配置支付产品ID`)
      }
    } else {
      // 付费计划验证
      if (!plan.creemProductIds) {
        warnings.push(`付费计划 ${plan.name} 缺少 creemProductIds 配置`)
      } else {
        if (!plan.creemProductIds.monthly) {
          errors.push(`付费计划 ${plan.name} 缺少月度产品ID`)
        }
        if (!plan.creemProductIds.yearly) {
          errors.push(`付费计划 ${plan.name} 缺少年度产品ID`)
        }
        
        // 检查产品ID格式
        if (plan.creemProductIds.monthly && !plan.creemProductIds.monthly.includes('_')) {
          warnings.push(`订阅计划 ${plan.name} 的月度产品ID看起来像是内部ID格式: ${plan.creemProductIds.monthly}`)
        }
        if (plan.creemProductIds.yearly && !plan.creemProductIds.yearly.includes('_')) {
          warnings.push(`订阅计划 ${plan.name} 的年度产品ID看起来像是内部ID格式: ${plan.creemProductIds.yearly}`)
        }
      }
      
      // 价格验证（仅付费计划）
      if (plan.monthlyPrice <= 0 || plan.yearlyPrice <= 0) {
        errors.push(`付费计划 ${plan.name} 价格必须大于0`)
      }
    }
    
    // 年费折扣检查
    const monthlyTotal = plan.monthlyPrice * 12
    const savings = monthlyTotal - plan.yearlyPrice
    const savingsPercent = (savings / monthlyTotal) * 100
    
    if (savingsPercent < 10) {
      warnings.push(`订阅计划 ${plan.name} 年费折扣较少: ${savingsPercent.toFixed(1)}%`)
    }
    
    console.log(`  ✅ ${plan.name} - 月费:$${plan.monthlyPrice} 年费:$${plan.yearlyPrice} (省${savingsPercent.toFixed(1)}%)`)
  }
  
  // 验证积分包
  for (const pack of pricingConfig.creditPacks) {
    console.log(`\n📦 验证积分包: ${pack.name}`)
    
    if (!pack.creemProductId) {
      errors.push(`积分包 ${pack.name} 缺少 creemProductId`)
    } else {
      // 检查产品ID格式
      if (!pack.creemProductId.includes('_')) {
        warnings.push(`积分包 ${pack.name} 的产品ID看起来像是内部ID格式: ${pack.creemProductId}`)
      }
    }
    
    if (pack.price <= 0) {
      errors.push(`积分包 ${pack.name} 价格必须大于0`)
    }
    
    if (pack.credits <= 0) {
      errors.push(`积分包 ${pack.name} 积分必须大于0`)
    }
    
    // 积分价值比检查
    const creditsPerDollar = pack.credits / pack.price
    if (creditsPerDollar < 50 || creditsPerDollar > 500) {
      warnings.push(`积分包 ${pack.name} 的积分比例异常: ${creditsPerDollar.toFixed(2)} 积分/美元`)
    }
    
    console.log(`  ✅ ${pack.name} - $${pack.price} - ${pack.credits}积分 (${creditsPerDollar.toFixed(0)}积分/美元)`)
  }
  
  return { errors, warnings }
}

// 主执行函数
function main() {
  try {
    // 加载配置
    const { pricingConfig, envConfig } = loadConfigurations()
    
    // 执行验证
    const { errors, warnings } = validateConfigurations(pricingConfig, envConfig)

    console.log("\n" + "=" * 50)
    console.log("🎯 验证结果:")

    if (errors.length > 0) {
      console.log(`\n❌ 发现 ${errors.length} 个错误:`)
      errors.forEach(error => console.log(`  • ${error}`))
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  发现 ${warnings.length} 个警告:`)
      warnings.forEach(warning => console.log(`  • ${warning}`))
    }

    if (errors.length === 0) {
      console.log("\n✅ 配置验证通过！")
      console.log("📝 建议:")
      console.log("  • 定期检查支付平台的产品ID有效性")
      console.log("  • 监控前端配置与后端产品服务的一致性")
      console.log("  • 考虑根据市场反馈调整价格策略")
      
      if (warnings.length > 0) {
        console.log("  • 建议修复上述警告以提升配置质量")
      }
    } else {
      console.log("\n🔴 配置存在严重问题，请修复后重试")
      process.exit(1)
    }

    console.log("\n🎉 真实配置验证完成！")
    
  } catch (error) {
    console.error("❌ 验证过程出错:", error.message)
    process.exit(1)
  }
}

// 运行主函数
main() 