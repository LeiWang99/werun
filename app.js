//app.js
var WXBizDataCrypt = require('utils/RdWXBizDataCrypt');

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if(res.code){
          var APPID = 'wx83583d8561defc52'
          var SECRET = '35a0fca29809ef484ed44c2180be9111'
          var JSCODE= res.code
          var session_key
          console.log("JSCODE "+JSCODE)
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + APPID + '&secret=' + SECRET + '&js_code=' + JSCODE +'&grant_type=authorization_code',
            data: {
              //code: res.code
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              console.log("res.data "+res.data)
              session_key = res.data.session_key
              console.log("session_key: "+session_key)
              wx.getWeRunData({
                success(res){
                  const encryptedRunData = res.encryptedData
                  const runiv=res.iv
                  console.log("加密的数据: "+encryptedRunData)
                  //var WXBizDataCrypt = require('utils/WXBizDataCrypt')
                  var pc = new WXBizDataCrypt(APPID, session_key)
                  var tmpdata = pc.decryptData(encryptedRunData, runiv)
                  console.info('解密后data：' + JSON.stringify(tmpdata))
                }
              })
            }
          })
        }else {
          console.log('失败' + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              var encryptedData = res.encryptedData
              //this.globalData.iv = res.iv
              var raw_data = res.rawData
              //console.log(encryptedData)
              console.log(raw_data)
              //console.log("iv: " + this.globalData.iv)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    iv : null,
    appId : 'wx83583d8561defc52',
    session_key : null
  }
})