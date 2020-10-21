// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise');
cloud.init()

const base_url = "http://xuyang.run/openAPI";

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 1:
      return await rp({
        uri: base_url + "/category/findCategoriesByPage",
        qs: event,
        json: true
      }).then(res => {
        return res
      }).catch(err => {
        return err
      })
      break;
    case 2:
      return await rp({
        uri: base_url + "/article/findArticlesByPageWithCondition",
        qs: event,
        json: true
      }).then(res => {
        return res
      }).catch(err => {
        return err
      })
      break;
    case 3:
      return await rp({
        uri: base_url + "/article/"+event.aid,
        // qs: event,
        json: true
      }).then(res => {
        return res
      }).catch(err => {
        return err
      })
      break;
  }
}