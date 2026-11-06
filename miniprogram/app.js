// app.js —— 全局逻辑
const config = require('./config/index');

App({
  globalData: {
    brand: config.BRAND,
    user: null,
    // 布局基准：状态栏 / 自定义导航栏 / 安全区（供自定义导航页使用）
    system: {
      statusBarHeight: 20,
      navBarHeight: 44,
      safeBottom: 0
    }
  },

  onLaunch() {
    this.measureSystem();

    // 演示模式：初始化模拟数据
    if (config.USE_MOCK) {
      const mock = require('./utils/mock');
      mock.init();
    }
  },

  /**
   * 自定义导航栏需要精确的状态栏高度与胶囊按钮位置，
   * 取不到时退化为经验值，保证页面不塌。
   */
  measureSystem() {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      const statusBarHeight = info.statusBarHeight || 20;
      const safeBottom = info.screenHeight && info.safeArea
        ? Math.max(0, info.screenHeight - info.safeArea.bottom)
        : 0;

      let navBarHeight = 44;
      if (wx.getMenuButtonBoundingClientRect) {
        const menu = wx.getMenuButtonBoundingClientRect();
        if (menu && menu.height) {
          navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height;
        }
      }

      this.globalData.system = { statusBarHeight, navBarHeight, safeBottom };
    } catch (e) {
      // 保留默认值
    }
  }
});
