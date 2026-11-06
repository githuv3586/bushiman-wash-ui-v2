// 知识详情：文末挂对应服务入口（内容即下单入口）
const api = require('../../utils/request');
const icons = require('../../utils/icons');

Page({
  data: { icons, article: null, paras: [], svc: null, loading: true },

  onLoad(query) {
    api.get('/article', { id: query.id }).then((article) => {
      wx.setNavigationBarTitle({ title: '养护知识' });
      const paras = article.content.map((raw, i) => ({
        no: i < 9 ? '0' + (i + 1) : String(i + 1),
        // 正文自带「1. 2.」序号时剥掉，避免与左侧编号列重复
        text: String(raw).replace(/^\s*\d+\s*[.、)）]\s*/, '')
      }));
      this.setData({ article, paras, loading: false });
      if (article.serviceId) {
        api.get('/service', { id: article.serviceId }).then((svc) => this.setData({ svc }));
      }
    });
  },

  goSvc() {
    wx.navigateTo({ url: '/pages/service-detail/service-detail?id=' + this.data.svc.id });
  },

  onShareAppMessage() {
    const a = this.data.article;
    return { title: a ? a.title : '养护知识', path: '/pages/article-detail/article-detail?id=' + (a && a.id) };
  }
});
