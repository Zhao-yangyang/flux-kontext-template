#!/usr/bin/env node

import fetch from 'node-fetch';
import { config } from 'dotenv';

// 🔧 加载环境变量
config();

// 🔧 配置检查
const CONFIG = {
  WEBHOOK_URL: 'http://localhost:3000/api/webhooks/creem',
  SUCCESS_URL: 'http://localhost:3000/payment/success',
  FAILED_URL: 'http://localhost:3000/payment/failed',
  CREEM_API_KEY: process.env.CREEM_API_KEY,
  CREEM_API_URL: process.env.CREEM_API_URL,
  CREEM_WEBHOOK_SECRET: process.env.CREEM_WEBHOOK_SECRET
};

// 🧪 验证CREEM配置
async function verifyCreemConfig() {
  console.log('🔍 CREEM配置验证\n');
  console.log('============================================================');

  // 1️⃣ 检查环境变量
  console.log('📋 1. 环境变量检查');
  console.log('──────────────────────────────────────');
  
  const envChecks = [
    { name: 'CREEM_API_KEY', value: CONFIG.CREEM_API_KEY, required: true },
    { name: 'CREEM_API_URL', value: CONFIG.CREEM_API_URL, required: true },
    { name: 'CREEM_WEBHOOK_SECRET', value: CONFIG.CREEM_WEBHOOK_SECRET, required: true }
  ];

  let envPassed = 0;
  for (const check of envChecks) {
    const status = check.value ? '✅' : '❌';
    const preview = check.value ? 
      (check.name.includes('SECRET') ? '***已配置***' : check.value.substring(0, 20) + '...') : 
      '未配置';
    
    console.log(`${status} ${check.name}: ${preview}`);
    if (check.value) envPassed++;
  }

  console.log(`\n📊 环境变量: ${envPassed}/${envChecks.length} 已配置\n`);

  // 2️⃣ 检查Webhook端点
  console.log('📡 2. Webhook端点检查');
  console.log('──────────────────────────────────────');
  
  try {
    const response = await fetch(CONFIG.WEBHOOK_URL, {
      method: 'GET',
      headers: { 'User-Agent': 'CreemConfigVerifier/1.0' }
    });
    
    const data = await response.json();
    
    console.log(`✅ Webhook端点: ${response.status === 200 ? '正常' : '异常'}`);
    console.log(`📍 URL: ${CONFIG.WEBHOOK_URL}`);
    console.log(`🔧 状态: ${data.status || 'unknown'}`);
    console.log(`📅 时间: ${data.timestamp || 'unknown'}`);
  } catch (error) {
    console.log(`❌ Webhook端点: 连接失败`);
    console.log(`🔍 错误: ${error.message}`);
  }

  console.log('');

  // 3️⃣ 检查回调页面
  console.log('📄 3. 回调页面检查');
  console.log('──────────────────────────────────────');
  
  const pageChecks = [
    { name: '支付成功页面', url: CONFIG.SUCCESS_URL },
    { name: '支付失败页面', url: CONFIG.FAILED_URL }
  ];

  for (const check of pageChecks) {
    try {
      const response = await fetch(check.url, {
        method: 'GET',
        headers: { 'User-Agent': 'CreemConfigVerifier/1.0' }
      });
      
      const status = response.status === 200 ? '✅ 正常' : `❌ 异常(${response.status})`;
      console.log(`${status} ${check.name}: ${check.url}`);
    } catch (error) {
      console.log(`❌ 异常 ${check.name}: 连接失败`);
    }
  }

  console.log('');

  // 4️⃣ CREEM API连接测试
  console.log('🔌 4. CREEM API连接测试');
  console.log('──────────────────────────────────────');
  
  if (CONFIG.CREEM_API_KEY && CONFIG.CREEM_API_URL) {
    try {
      // 测试简单的API调用
      const response = await fetch(`${CONFIG.CREEM_API_URL}/products`, {
        method: 'GET',
        headers: {
          'x-api-key': CONFIG.CREEM_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ CREEM API: 连接成功');
        console.log(`📍 URL: ${CONFIG.CREEM_API_URL}`);
        console.log(`🔑 认证: 成功`);
      } else {
        console.log(`❌ CREEM API: 连接失败 (${response.status})`);
        const errorText = await response.text();
        console.log(`🔍 错误: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ CREEM API: 网络错误`);
      console.log(`🔍 错误: ${error.message}`);
    }
  } else {
    console.log('❌ CREEM API: 配置不完整');
  }

  console.log('');

  // 📋 配置总结
  console.log('============================================================');
  console.log('📋 CREEM后台配置建议');
  console.log('============================================================');
  console.log('');
  console.log('🔧 在CREEM后台需要配置以下URL:');
  console.log('');
  console.log('📡 Webhook设置:');
  console.log(`   Webhook URL: ${CONFIG.WEBHOOK_URL}`);
  console.log(`   Webhook Secret: ${CONFIG.CREEM_WEBHOOK_SECRET ? '***已配置***' : '需要配置'}`);
  console.log('');
  console.log('📄 支付回调设置:');
  console.log(`   Success URL: ${CONFIG.SUCCESS_URL}`);
  console.log(`   Cancel URL: ${CONFIG.FAILED_URL}`);
  console.log('');
  console.log('🎯 支持的事件类型:');
  console.log('   ☑️ checkout.completed');
  console.log('   ☑️ checkout.failed');
  console.log('   ☑️ checkout.cancelled');
  console.log('   ☑️ subscription.created');
  console.log('   ☑️ subscription.updated');
  console.log('   ☑️ subscription.cancelled');
  console.log('');
  console.log('🏁 配置完成后，支付流程将完全正常工作！');
}

// 🚀 运行验证
verifyCreemConfig().catch(console.error); 