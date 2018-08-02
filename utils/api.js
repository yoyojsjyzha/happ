import config from '../config/index';
import store from './store';
import util from './util';

const BASE_URL = config['dev'].server;
// api urls
const API_URL = {
  loginUrl: BASE_URL + '/user/login',
  decryptUrl: BASE_URL + '/user',
}

// blank function
const fn = function () { };

/**
 * 请求通用参数
 */
const getCommonParams = function () {
  return {
    token: store.getToken(),
    version: 1
  }
}

/**
 *
 * @param {Object} obj 请求参数P
 * @param {Boolean} login 是否需要登录
 */

const request = function (obj, login) {
  return new Promise(function (resolve, reject) {
    let { success, fail, complete, ...others } = obj;
    others.data = Object.assign({}, others.data, getCommonParams());
    if (others.url.match(/user\/login/)) {
      others.data.token = '';
    }
    others.data = util.rmBalnkParams(others.data);
    // 默认get
    others.method = others.method || 'GET';
    // 默认post的数据格式为 application/x-www-form-urlencoded
    if (others.method.match(/post/i) && (!others.header || !others.header['content-type'])) {
      others.header = Object.assign({}, others.header, {
        'content-type': 'application/x-www-form-urlencoded'
      });
    }
    wx.request(Object.assign(others, {
      success: function (res) {
        console.log(others, res);
        if (res.data && res.data.code == 400) {
          if (obj.url.match(/user\/login/)) {
            store.setToken(res.data.data.token)
          }
          reject(new Error('400'));
        } else {
          getApp().globalData.redirectTimes = 0;
          resolve(res);
        }
      },
      fail: function (res) {
        console.error(res);
        reject(res);
      },
    }));
  }).catch(e => {
    // token 过期
    if (e.message == 400 && !obj.url.match(/\/user\/login|\/user|\//)) {
      getApp().globalData.redirectTimes++;
      console.log(getApp().globalData)
      util.redirectToLogin();
    }
    throw e;
  })
}


const checkLogin = function (force) {
  return checkSession(force).then(function () {
    return store.getCurrentUserInfo();
  }, function () {
    return new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          if (res.code) {
            console.log('login_code=' + res.code)
            resolve(res.code);
          } else {
            console.log('no_login_code')
            reject();
          }
        },
        fail: function () {
          console.log('wx_login_fail')
          reject();
        }
      })
    })
  });
}

const login = function (force) {
  return checkLogin(force)
}

/**
 *
 * @param {Boolean} force 强制重新登录
 */
const checkSession = function (force) {
  return new Promise(function (resolve, reject) {
    if (force) {
      return reject();
    }
    wx.checkSession({
      success: function () {
        console.log('session有效')
        resolve();
      },
      fail: function () {
        console.warn('session过期')
        reject();
      }
    })
  })
}

/**
 * 获取小b的信息，当前用户或者b2c的b
 * @param {Boolean} force 是否强制登录
 * @param {String} shareUnionid 分享者的unionid
 */
const getCurrentUserInfo = function (force, shareUnionid) {
  if (typeof force === 'string') {
    shareUnionid = force;
    force = false;
  }
  if (!force && store.getCurrentUserInfo()) {
    return Promise.resolve(store.getCurrentUserInfo());
  } else {
    return login(true).then((code) => {
      return request({
        url: API_URL.loginUrl,
        data: {
          code
        }
      })
    })
      .then((res) => {
        // store userinfo
        if (res.data && res.data.data && res.data.data.token) {
          store.setToken(res.data.data.token);
        }
        if (res.data.code == 100) {
          let d = res.data.data;
          let { status, identity } = d;
          store.setCurrentUserInfo(Object.assign(d.userInfo, { status, identity }));
          return store.getCurrentUserInfo();
        } else {
          // 抛出错误
          // 400 需要解密userinfo
          // 500 服务器报错
          throw new Error(res.data.code)
        }
      })
      .catch(e => {
        // token 过期
        if (e.message == 400) {
          getApp().globalData.redirectTimes++;
          console.log(getApp().globalData)
          util.redirectToLogin();
        }
        throw e;
      });
  }
}

/**
 * 解密用户信息
 */
const decryptUserInfo = function ({
  encryptedData,
  iv
}) {
  return request({
    url: API_URL.decryptUrl,
    data: {
      encryptedData,
      iv
    }
  })
}

export { login, getCurrentUserInfo, decryptUserInfo, };