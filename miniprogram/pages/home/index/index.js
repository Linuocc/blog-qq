const {
  formatTime
} = require("../../../utils/util");

const cloud = wx.cloud;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    style: [{ //分类列表的颜色和图标
        color: 'cyan',
        icon: 'newsfill'
      },
      {
        color: 'blue',
        icon: 'colorlens'
      },
      {
        color: 'purple',
        icon: 'font'
      },
      {
        color: 'mauve',
        icon: 'icon'
      },
      {
        color: 'pink',
        icon: 'btn'
      },
      {
        color: 'brown',
        icon: 'tagfill'
      },
      {
        color: 'red',
        icon: 'myfill'
      },
      {
        color: 'orange',
        icon: 'icloading'
      },
      {
        color: 'olive',
        icon: 'copy'
      },
      {
        color: 'green',
        icon: 'loading2'
      }
    ],
    cardCur: 0, //轮播图当前显示的item的index
    CategoriesList: [], //分类数据
    articlesList: [], //轮播区域文章列表
  },

  //轮播发生变化
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },

  //点击轮播图打开文章详情页
  openArticleDetile(option) {
    const index = option.currentTarget.dataset.index;
    const data = this.data.articlesList[index];
    wx.navigateTo({
      url: '/pages/home/detail/detail?aid=' + data.aid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData(() => {

    })
  },

  //获取轮播图展示的文章数据
  getData(callback) {
    qq.showLoading({
      title: '加载中',
      mask: true
    })
    Promise.all([ //保证两个数据都请求成功
      cloud.callFunction({ //获取文章数据
        name: "getList",
        data: {
          type: 2,
          page: 1,
          limit: 5
        }
      }), cloud.callFunction({ //获取分类数据
        name: "getList",
        data: {
          type: 1, //1获取文章分类列表，2获取文章列表
          page: 1,
          limit: 20
        }
      })

    ]).then(res => {
      let articlesList = res[0].result.data
      let reg = /<\/?.+?\/?>/ig;
      for (let i = 0; i < articlesList.length; i++) { //去掉内容里面的html标签，截取前120长度的字符串作为描述信息
        let str = articlesList[i].htmlContent;
        let time = articlesList[i].createdTime;
        str = str.replace(reg, '');
        str = str.substring(0, 120);
        articlesList[i].description = str;
        articlesList[i].createdTime = formatTime(new Date(time));
      }

      this.setData({
        articlesList,
        CategoriesList: res[1].result.data
      })
      wx.hideLoading({
        success: (res) => {
          callback()
        },
      })
    }).catch(err => {
      wx.showToast({
        title: '数据加载失败',
        icon: "none",
        mask: true
      })
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.getData(() => {
      wx.showToast({
        title: '刷新成功',
        icon: "success",
        duration: 500
      })
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})