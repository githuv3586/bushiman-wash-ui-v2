// config/index.js —— 全局配置
module.exports = {
  // 演示模式：true = 全部使用本地模拟数据（可脱离后端运行）
  // 上线前置为 false 并配置 BASE_URL
  USE_MOCK: true,

  // 后端接口根域名（必须 HTTPS 且完成 ICP 备案）
  BASE_URL: 'https://api.your-domain.com',

  BRAND: {
    name: '布仕曼洗护',
    slogan: '让每件装备都有故事',
    // TODO: 替换为真实门店信息
    address: '【门店地址】',
    phone: '【门店电话】',
    hours: '09:00 - 19:00'
  }
};
