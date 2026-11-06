// 养护知识列表
const api = require('../../utils/request');
const icons = require('../../utils/icons');

const TEX = ['tex-bead', 'tex-rain', 'tex-grid', 'tex-stitch'];

Page({
  data: {
    icons,
    list: [],
    featured: null,
    loading: true
  },

  onLoad() {
    api.get('/articles').then((list) => {
      const decorated = list.map((a, i) => Object.assign({}, a, {
        tex: TEX[i % TEX.length],
        no: i < 9 ? '0' + (i + 1) : String(i + 1),
        read: Math.max(3, Math.round(a.content.length * 1.2))
      }));
      this.setData({
        featured: decorated[0] || null,
        list: decorated.slice(1),
        loading: false
      });
    });
  },

  go(e) {
    wx.navigateTo({ url: '/pages/article-detail/article-detail?id=' + e.currentTarget.dataset.id });
  }
});
