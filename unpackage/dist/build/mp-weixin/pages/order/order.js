(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/order/order"],{"1be8":function(e,n,i){},"31da":function(e,n,i){"use strict";(function(e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var t=i("16b0"),c=i("2f62");function r(e){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{},t=Object.keys(i);"function"===typeof Object.getOwnPropertySymbols&&(t=t.concat(Object.getOwnPropertySymbols(i).filter(function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable}))),t.forEach(function(n){o(e,n,i[n])})}return e}function o(e,n,i){return n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i,e}var s={data:function(){return{checkV:!0,defaultImg:"../../static/chongdianqi.png",youhuiCode:null,placeholder:"兑换码不区分大小写",cansubmit:!1,canSubmitClass:"submit-button",canNotSubmitClass:"can-not-submit"}},methods:r({},(0,c.mapMutations)(["setUserId","setDeviceId","setServiceId","setWriteServiceId","setNotifyServiceId","setCheckOnlineOrder","setDeviceName","setDeviceImei"]),{changeRadioV:function(){this.checkV=!this.checkV},oepnxieyi:function(){e.showModal({title:"用户协议",content:this.machObject.userProtocol,showCancel:!1,success:function(e){e.confirm}})},gotoPay:function(){var n=this;if(n.cansubmit)if(n.phoneBlueToothCanUse){if(!n.checkV)return void e.showToast({title:"请同意用户协议",icon:"none",mask:!0,duration:1500});if(n.cansubmit=!1,!n.bleConnectedStatus||""==n.writeServiceId)return void e.showModal({title:"",content:"设备连接中,请稍后重试",showCancel:!1,success:function(e){e.confirm&&(n.cansubmit=!0)}});e.showLoading({title:"加载中"}),n.startService()}else n.judgeBlueToothCanUse()},commitOrderRequstNetWork:function(){var n=this;e.request({url:n.baseRequestUrl+"microProgramOrder/commitWeixinMicroOrder",method:"POST",data:{orderFrom:"wx_fmj",userId:n.userId,deviceImei:n.deviceImei,voucherCode:n.youhuiCode,goodsInfo:JSON.stringify(n.commitGoodsArray)},success:function(i){var c=i.data;1===c.code?e.requestPayment({provider:"wxpay",timeStamp:c.timeStamp,nonceStr:c.nonceStr,package:"prepay_id="+c.prepayId,signType:"MD5",paySign:c.sign,success:function(i){e.request({url:n.baseRequestUrl+"order/getRealOrder?sysOrderId="+c.sysOrderId,success:function(i){if(1===i.data.code){var c=i.data.order;e.writeBLECharacteristicValue({deviceId:n.deviceId,serviceId:n.serviceId,characteristicId:n.writeServiceId,value:(0,t.String2Ab)(c),success:function(i){var r=setInterval(function(){-1!=c.indexOf(n.responseOrder)&&(clearInterval(r),clearTimeout(o),e.writeBLECharacteristicValue({deviceId:n.deviceId,serviceId:n.serviceId,characteristicId:n.writeServiceId,value:(0,t.String2Ab)(n.confirmOrder),success:function(i){e.closeBLEConnection({deviceId:n.deviceId,success:function(e){console.log(e)}}),e.hideLoading(),e.reLaunch({url:"../buyfinish/buyfinish"})}}))},200),o=setTimeout(function(){-1===c.indexOf(n.responseOrder)&&(clearInterval(r),e.hideLoading(),e.showModal({title:"",content:"蓝牙响应失败,请重新扫码",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}}))},3e3)}})}else e.showModal({title:"",content:"服务器开小差,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})}})},fail:function(i){e.hideLoading(),n.cansubmit=!0,console.error("支付失败"+JSON.stringify(i))}}):e.showModal({title:"",content:c.message,showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})},fail:function(n){e.showModal({title:"",content:"服务器开小差,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})}})},startService:function(){var n=this;e.notifyBLECharacteristicValueChange({state:!0,deviceId:n.deviceId,serviceId:n.serviceId,characteristicId:n.notifyServiceId,success:function(i){e.writeBLECharacteristicValue({deviceId:n.deviceId,serviceId:n.serviceId,characteristicId:n.writeServiceId,value:(0,t.String2Ab)(n.checkOnlineOrder),success:function(i){var t=setInterval(function(){-1!=n.checkOnlineOrder.indexOf(n.responseOrder)&&(clearInterval(t),clearTimeout(c),n.commitOrderRequstNetWork())},200),c=setTimeout(function(){-1===n.checkOnlineOrder.indexOf(n.responseOrder)&&(clearInterval(t),e.showModal({title:"",content:"蓝牙功能异常,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}}))},5e3)}})},fail:function(e){console.log("开启notify功能失败",e)}})},judgeBlueToothCanUse:function(){var n=this;setTimeout(function(){n.phoneBlueToothCanUse?n.sanAndConnectBle():e.showModal({title:"",content:"请开启手机蓝牙功能",showCancel:!1,success:function(e){e.confirm&&n.judgeBlueToothCanUse()}})},1500)},sanAndConnectBle:function(){var n=this;e.startBluetoothDevicesDiscovery({success:function(i){setTimeout(function(){e.stopBluetoothDevicesDiscovery({success:function(e){}}),e.getBluetoothDevices({success:function(i){for(var t=i.devices,c=!1,r=0;r<t.length;r++){if(!t[r].name)break;-1!=t[r].name.indexOf(n.deviceNamePrefix)&&-1!=n.deviceImei.indexOf(t[r].name.substring(n.deviceNamePrefix.length))&&(c=!0,n.setDeviceName(t[r].name),n.setDeviceId(t[r].deviceId),n.connectBle()),r!==t.length-1||c||e.showModal({title:"",content:"未搜索到设备,请靠近设备后重试",showCancel:!1,success:function(n){n.confirm&&e.redirectTo({url:"../index/index"})}})}}})},2e3),e.onBluetoothDeviceFound(function(e){})},fail:function(n){e.showModal({title:"",content:"开启蓝牙搜索功能失败,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})}})},connectBle:function(){var n=this;n.bleConnectedStatus?e.getBLEDeviceServices({deviceId:n.deviceId,success:function(i){for(var t=i.services,c=0;c<t.length;c++)-1!=t[c].uuid.toUpperCase().indexOf(n.serviceIdPrefix)&&(n.setServiceId(t[c].uuid),e.getBLEDeviceCharacteristics({deviceId:n.deviceId,serviceId:n.serviceId,success:function(e){for(var i=e.characteristics,t=0;t<i.length;t++)-1!=i[t].uuid.toUpperCase().indexOf(n.notifyIdPrefix)?n.setNotifyServiceId(i[t].uuid):-1!=i[t].uuid.toUpperCase().indexOf(n.writeIdPrefix)&&n.setWriteServiceId(i[t].uuid);n.cansubmit=!0},fail:function(n){e.showModal({title:"",content:"读取蓝牙特征失败,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.redirectTo({url:"../index/index"})}})}}))},fail:function(n){e.showModal({title:"",content:"读取蓝牙服务失败,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})}}):e.createBLEConnection({deviceId:n.deviceId,success:function(i){e.getBLEDeviceServices({deviceId:n.deviceId,success:function(i){for(var t=i.services,c=0;c<t.length;c++)-1!=t[c].uuid.toUpperCase().indexOf(n.serviceIdPrefix)&&(n.setServiceId(t[c].uuid),e.getBLEDeviceCharacteristics({deviceId:n.deviceId,serviceId:n.serviceId,success:function(e){for(var i=e.characteristics,t=0;t<i.length;t++)-1!=i[t].uuid.toUpperCase().indexOf(n.notifyIdPrefix)?n.setNotifyServiceId(i[t].uuid):-1!=i[t].uuid.toUpperCase().indexOf(n.writeIdPrefix)&&n.setWriteServiceId(i[t].uuid),n.cansubmit=!0},fail:function(n){e.showModal({title:"",content:"读取蓝牙特征失败,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.redirectTo({url:"../index/index"})}})}}))},fail:function(n){e.showModal({title:"",content:"读取蓝牙服务失败,请稍后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})}})},fail:function(i){10003===i.errCode?(e.closeBLEConnection({deviceId:n.deviceId,success:function(e){console.log("10003中连接断开")}}),n.sanAndConnectBle()):e.showModal({title:"",content:"蓝牙连接失败,请检查蓝牙后重试",showCancel:!1,success:function(n){n.confirm&&e.reLaunch({url:"../index/index"})}})}})}}),computed:r({},(0,c.mapState)(["phoneBlueToothCanUse","baseRequestUrl","charging","deviceNamePrefix","notifyIdPrefix","writeIdPrefix","serviceIdPrefix","deviceImei","deviceName","deviceId","serviceId","notifyServiceId","writeServiceId","bleConnectedStatus","responseOrder","checkOnlineOrder","confirmOrder","goodsObjectArray","commitGoodsArray","userId"]),{totalPrice:function(){for(var e=0,n=this.goodsObjectArray,i=0;i<n.length;i++){var t=n[i];e+=t.product.goods.price*t.number}return e},buttonMsg:function(){return this.cansubmit?"立即支付":"订单加载中"}}),onLoad:function(){this.judgeBlueToothCanUse()}};n.default=s}).call(this,i("543d")["default"])},"4bc8":function(e,n,i){"use strict";i.r(n);var t=i("6031"),c=i("6f3f");for(var r in c)"default"!==r&&function(e){i.d(n,e,function(){return c[e]})}(r);i("bd55");var o=i("2877"),s=Object(o["a"])(c["default"],t["a"],t["b"],!1,null,null,null);n["default"]=s.exports},6031:function(e,n,i){"use strict";var t=function(){var e=this,n=e.$createElement;e._self._c},c=[];i.d(n,"a",function(){return t}),i.d(n,"b",function(){return c})},"6f3f":function(e,n,i){"use strict";i.r(n);var t=i("31da"),c=i.n(t);for(var r in t)"default"!==r&&function(e){i.d(n,e,function(){return t[e]})}(r);n["default"]=c.a},bd55:function(e,n,i){"use strict";var t=i("1be8"),c=i.n(t);c.a},f85d:function(e,n,i){"use strict";(function(e){i("abb7"),i("921b");t(i("66fd"));var n=t(i("4bc8"));function t(e){return e&&e.__esModule?e:{default:e}}e(n.default)}).call(this,i("543d")["createPage"])}},[["f85d","common/runtime","common/vendor"]]]);