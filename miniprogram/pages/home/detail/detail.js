const {
  formatTime
} = require("../../../utils/util");

let startPoint;
const app = getApp();
const cloud = wx.cloud;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0, //scroll-view
    imageArray: [], //图片数组
    isLoad: false, //是否加载完成
    showImgBtn: false, //显示图片列表
    goTopBtnShow: false //显示返回顶部按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cloud.callFunction({ //调用获取数据的云函数
      name: "getList",
      data: {
        type: 3, //3表示获取文章详情
        aid: options.aid, //文章aid
      }
    }).then(res => {
      const data = res.result;
      // console.log(data)
      this.setData({
        title: data.title,
        node: this.formatHtml(data.htmlContent),
        aid: data.aid,
        author: data.author,
        createdTime: formatTime(new Date(data.createdTime)), //对时间进行格式化
        isLoad: true
      }, () => {
        wx.setNavigationBarTitle({ //设置导航栏标题
          title: data.title,
        })
      })

    })
  },

  // 对文章的内容进行格式化（部分标签添加类名，提取所有图片地址）
  formatHtml(htmlContent) {
    htmlContent = htmlContent.replace(/<pre>/ig, '<div class="pre">')
    htmlContent = htmlContent.replace(/<\/pre>/ig, '</div>')
    htmlContent = htmlContent.replace(/<code[^>]*>/ig, '<code class="code">')
    htmlContent = htmlContent.replace(/<h2[^>]*>/ig, '<h2 class="h2">')
    htmlContent = htmlContent.replace(/<p>/ig, '<p class="p">')
    htmlContent = htmlContent.replace(/<img/ig, '<img class="img" ')
    htmlContent = htmlContent.replace(/<table>/ig, '<table border="1" class="table">')
    htmlContent = htmlContent.replace(/<td/ig, '<td class="td"')
    htmlContent = `<div class="wrap" contenteditable="true">${htmlContent}</div>`
    let arr = [];
    // let reg = /(?<=(src="))[^"]*?(?=")/ig;
    let reg = new RegExp(`((src="))[^"]*?(?=")`, 'gi');
    let allSrc = htmlContent.match(reg); //匹配所有的图片的src内容
    if (allSrc != null) {
      for (let i = 0; i < allSrc.length; i++) {
        allSrc[i] = allSrc[i].substring(5)
        arr.push(allSrc[i])
        this.setData({
          imageArray: arr
        })
      }
      this.setData({
        showImgBtn: true
      })
    }
    return htmlContent;

  },

  // 预览图片
  previewImage(option) {
    wx.previewImage({
      urls: this.data.imageArray,
      current: this.data.imageArray[option.currentTarget.dataset.index]
    })
  },
  // 显示图片列表
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      showImgBtn: false
    })
  },
  // 隐藏图片列表
  hideModal(e) {
    this.setData({
      modalName: null,
      showImgBtn: true
    })
  },

  // 返回顶部事件
  goTop() {
    this.setData({
      scrollTop: 0
    })
  },

  // 监听内容区域的滚动
  handleScroll(event) {
    const scrollTop = event.detail.scrollTop;

    if (scrollTop > 500) { //判断滚动的位置
      this.setData({
        goTopBtnShow: true
      })
    } else {
      this.setData({
        goTopBtnShow: false
      })
    }
  },

  /**
   * 分享
   * 生命周期函数
   */
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      path: `/pages/home/detail/detail?aid=${this.data.aid}`
    }
  }
})