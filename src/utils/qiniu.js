const qiniu = require('qiniu')

const ak = process.env.QINIU_AK || '7Tvo3zwn6vJNJe3tbH766dRQ3ciNw_SsZv_RKfom'
const sk = process.env.QINIU_SK || 'Jis1AWf1Ut8xxRV23wxZjYWiSjlJNjmLNYIPs1hY'
const bucket = process.env.QINIU_BUCKET || "yuexioaquan";
const domain = process.env.QINIU_DOMAIN || 'teyy0lgeq.hn-bkt.clouddn.com'

const mac = new qiniu.auth.digest.Mac(ak, sk)

/**
 * 生成七牛云上传凭证
 */
function generateUploadToken() {
  const options = {
    scope: bucket,
    expires: 7200 // 2小时
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)
  return { token: uploadToken, domain }
}

/**
 * 获取七牛云上传接口地址（华东浙江二区）
 */
function getUploadUrl() {
  const config = new qiniu.conf.Config({
    zone: qiniu.zone.Zone_z1
  })
  const formUploader = new qiniu.form_up.FormUploader(config)
  return formUploader
}

module.exports = { generateUploadToken, getUploadUrl, domain, bucket }
