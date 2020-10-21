const {
  formatTime
} = require("../../../utils/util")

const cloud = wx.cloud
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage: 1, //当前页数
    limit: 5, //每页数据条数
    articlesList: [], //文章列表
    end: false, //列表分页结束
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      cid: options.cid,
    })
    qq.setNavigationBarTitle({
      title:options.title
    })
    const {
      currentPage,
      limit
    } = this.data;

    //调用获取文章列表的方法
    this.getArticleList(currentPage, limit, options.cid, () => {})
  },


  /**
   * 获取文章列表
   * @param {Number} cureentPage 
   * @param {Number} limit 
   * @param {Number} cid 
   * @param {Function} callback 
   */
  getArticleList(cureentPage, limit, cid, callback) {
    if (!this.data.end) { //判断是否加载分页结束
      cloud.callFunction({ //调用获取文章列表的云函数
        name: "getList",
        data: {
          type: 2, //2表示获取文章列表
          page: cureentPage, //当前页码
          limit, //每页数据量
          cid, //分类id
        }
      }).then(res => {
        let {
          articlesList
        } = this.data;

        let {
          data
        } = res.result;


        //循环遍历获取到的数据，除去html标签，截取前100位作为文字描述
        let reg = /<\/?.+?\/?>/ig;
        // let reg = new RegExp("<\/?.+?\/?>",'g')

        for (let i = 0; i < data.length; i++) {
          let str = data[i].htmlContent;
          let time = data[i].createdTime;
          str = str.replace(reg, '');
          str = str.substring(0, 100);
          data[i].description = str;
          data[i].createdTime = formatTime(new Date(time));
        }

        articlesList.push(...data); //新的数据追加在之前的数据后边
        this.setData({
          articlesList,
          currentPage: this.data.currentPage + 1,
          end: res.result.data.length < limit
        })
        callback(); //触发回调函数
      })
    }
  },

  //打开文章详情页事件
  openArticleDetile(option) {
    const index = option.currentTarget.dataset.index;
    const data = this.data.articlesList[index];
    wx.navigateTo({
      url: '/pages/home/detail/detail?aid=' + data.aid,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    const {
      currentPage,
      limit,
      cid
    } = this.data;

    // 调用文章列表获取数据方法
    this.getArticleList(currentPage, limit, cid, () => {
      // wx.hideLoading()
    })
  },

  //下拉刷新
  onPullDownRefresh() {
    this.setData({ //将当前页码设置为1，文章列表清空，加载状态设置为加载中
      currentPage: 1,
      articlesList: [],
      end: false
    }, () => {
      this.getArticleList(this.data.currentPage, this.data.limit, this.data.cid, () => {
        wx.stopPullDownRefresh({
          success: (res) => {},
        })
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})