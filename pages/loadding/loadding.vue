<template>
	<view class="content">
		<!-- 加载动图部分 -->
		<view class="loadding-frame">
			<view class="loadding-frame-inner">
				<image class="loaddingPic" src="../../static/chongdian.png"></image>
				<view>
					<image class="loadProgress" src="../../static/load.gif"></image>
				</view>
				<view class="loadding-desc">
					<text>正在连接设备，请勿关闭页面</text>
				</view>
			</view>
			<!-- 加盟组件 -->
			<join-us :hotline="joinPhone"></join-us>
		</view>
	</view>
</template>

<script>
	import joinUs from "../../components/join-us/join-us.vue"
	//导入工具类
	import {
		Ab2String,
		String2Ab
	} from '../../utils/index.js'
	//状态管理
	import {
		mapMutations,
		mapState
	} from 'vuex'
	export default {
		data() {
			return {

			}
		},
		components: {
			joinUs
		},
		methods: {
			...mapMutations([
				'setUserId', 'setDeviceId', 'setServiceId', 'setWriteServiceId', 'setNotifyServiceId', 'setCheckOnlineOrder',
				'setDeviceName', 'setDeviceImei'
			]),
			/**
			 * 从请求中封装数据
			 */
			setDeviceIdFromPath(param) {
				if (typeof(param.q) != 'undefined') {
					//微信直接扫码进入
					let sanUrl = decodeURIComponent(param.q)
					let scanImei = sanUrl.substring(sanUrl.indexOf('imei=') + 5)
					this.setDeviceImei(scanImei)
				} else {
					//从index扫码跳转
					this.setDeviceImei(param.imei)
				}
			},
			/**
			 * 判断蓝牙是否可用,使用到了递归，只有开启蓝牙以后才进行蓝牙的初始化
			 */
			judgeBlueToothCanUse() {
				var that = this
				//为了用户体验，延时1.5秒
				setTimeout(function() {
					if (that.phoneBlueToothCanUse) {
						//搜索并连接蓝牙
						that.userLogin()
					} else {
						//手机蓝牙未打开
						uni.showModal({
							title: '',
							content: '请开启手机蓝牙功能',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									that.judgeBlueToothCanUse()
								}
							}
						})

					}
				}, 1500);
			},
			/**
			 * 用户登录
			 */
			userLogin() {
				var that = this
				uni.login({
					success: function(loginRes) {
						let weixinCode = loginRes.code
						uni.request({
							url: that.baseRequestUrl + 'userInfo/getWxUserInfo?code=' + weixinCode + '&requestFrom=wx_fmj',
							success: (res) => {
								//数据响应成功
								if (res.data.status) {
									that.setUserId(res.data.data.openid)
									that.queryInUse(that.deviceImei, that.userId)
								} else {
									//服务器响应失败
									uni.showModal({
										title: '',
										content: res.data.message,
										showCancel: false,
										success: (res) => {
											if (res.confirm) {
												uni.reLaunch({
													url: '../index/index'
												})
											}
										}
									})
								}
							},
							fail(res) {
								//服务器响应失败
								uni.showModal({
									title: '',
									content: '服务器开小差了,请稍后重试',
									showCancel: false,
									success: (res) => {
										if (res.confirm) {
											uni.reLaunch({
												url: '../index/index'
											})
										}
									}
								})
							}
						});
					}
				});
			},
			/**	
			 * 查询设备是否在使用中
			 * 
			 * @param {Object} imei
			 * @param {Object} userId
			 * 
			 */

			queryInUse(imei, userId) {
				var that = this
				//1. 如果页面还存在没有被销毁，那么直接判断
				if (that.charging) {
					uni.reLaunch({
						url: '../charge/charge'
					})
				} else {
					//2. 如果页面被销毁了
					uni.request({
						url: that.baseRequestUrl + 'microProgramOrder/queryInUse?deviceImei=' + imei,
						success: (reso) => {
							//数据响应成功
							if (reso.data.status) {
								if (reso.data.data.using) {
									if (reso.data.data.userId === userId) {
										//如果是自己，那么就跳转到充电页面
										uni.reLaunch({
											url: '../charge/charge'
										})
									} else {
										//如果不是自己，那么就显示别人正在充电
										uni.showModal({
											title: '',
											content: '设备正在被使用中,请稍后再试',
											showCancel: false,
											success: (res) => {
												if (res.confirm) {
													uni.reLaunch({
														url: '../index/index'
													})

												}
											}
										})

									}
								} else {
									//搜索并连接蓝牙
									that.sanAndConnectBle()
									that.startService()
								}
							} else {
								uni.showModal({
									title: '',
									content: reso.data.message,
									showCancel: false,
									success: (res) => {
										if (res.confirm) {
											uni.reLaunch({
												url: '../index/index'
											})
										}
									}
								})
							}
						},
						fail() {
							uni.showModal({
								title: '',
								content: '服务器开小差了,请稍后重试',
								showCancel: false,
								success: (res) => {
									if (res.confirm) {
										uni.reLaunch({
											url: '../index/index'
										})

									}
								}
							})
						}
					});

				}
			},
			/**
			 * 开启每个页面的实际服务
			 */
			startService() {
				var that = this
				//必须要先去判断蓝牙是否开启成功
				var serviceCheckTimmer = setInterval(function() {
					if (that.bleConnectedStatus && that.notifyServiceId != '' && that.serviceId != '') {
						clearInterval(serviceCheckTimmer)
						//启动监听服务，但是启动监听服务之后，需要延时2S,否则系统层面会出问题
						uni.notifyBLECharacteristicValueChange({
							state: true,
							deviceId: that.deviceId,
							serviceId: that.serviceId,
							characteristicId: that.notifyServiceId,
							success(res) {
								//请求在线命令
								//蓝牙连接成功以后立即请求服务器下发在线命令
								uni.request({
									url: that.baseRequestUrl + 'order/getOnlineOrder',
									method: 'POST',
									data: {
										bleMac: that.deviceName
									},
									success: (res) => {
										if (res.data.status) {
											//请求成功
											let orderString = res.data.data.order;
											//将多次使用的命令缓存一下
											that.setCheckOnlineOrder(orderString.toUpperCase())
											//写数据
											uni.writeBLECharacteristicValue({
												deviceId: that.deviceId,
												serviceId: that.serviceId,
												characteristicId: that.writeServiceId,
												value: String2Ab(that.checkOnlineOrder),
												success(res) {
													var onlineOrderTimeOutId = setTimeout(function() {
														if (that.checkOnlineOrder.indexOf(that.responseOrder) == -1) {
															clearInterval(intervalTimmerId)
															uni.showModal({
																title: '',
																content: '蓝牙设备未响应数据,请稍后重试',
																showCancel: false,
																success: (res) => {
																	if (res.confirm) {
																		uni.reLaunch({
																			url: '../index/index'
																		})

																	}
																}
															})
														}
													}, 2000);
													//定时判断是否相同
													var intervalTimmerId = setInterval(function() {
														if (that.checkOnlineOrder.indexOf(that.responseOrder) != -1) {
															clearInterval(intervalTimmerId)
															clearTimeout(onlineOrderTimeOutId)
															uni.redirectTo({
																url: '../buy/buy'
															})
														}
													}, 500)
												},
												fail(res) {
													//服务器响应失败
													uni.showModal({
														title: '',
														content: '向蓝牙设备写入数据失败,请稍后重试',
														showCancel: false,
														success: (res) => {
															if (res.confirm) {
																uni.reLaunch({
																	url: '../index/index'
																})

															}
														}
													})
												}
											})
										} else {
											//服务器响应失败
											uni.showModal({
												title: '',
												content: '服务器开小差,请稍后重试',
												showCancel: false,
												success: (res) => {
													if (res.confirm) {
														uni.reLaunch({
															url: '../index/index'
														})

													}
												}
											})

										}
									},
									fail: (res) => {
										uni.showModal({
											title: '',
											content: '服务器开小差,请稍后重试',
											showCancel: false,
											success: (res) => {
												if (res.confirm) {
													uni.reLaunch({
														url: '../index/index'
													})

												}
											}
										})
									}

								});
							},
							fail(res) {
								console.log('监听服务开启失败', res)
							}
						})
					}
				}, 500)

			},
			sanAndConnectBle() {
				var that = this
				uni.startBluetoothDevicesDiscovery({
					//开启蓝牙搜索服务
					success: (res) => {
						//1. 超时自动关闭蓝牙发现服务省电，10秒没有搜索到自己的蓝牙设备的话就直接关闭
						setTimeout(() => {
							//2.2.2 关闭蓝牙搜索服务
							uni.stopBluetoothDevicesDiscovery({
								success(res) {}
							})
							uni.getBluetoothDevices({
								success(res) {
									//判断是否是自己的设备,只能通过name来判断
									var devicesArray = res.devices
									//长度为零就是没找到任何设备
									if (devicesArray.length == 0) {
										uni.showModal({
											title: '',
											content: '未搜索到设备,请靠近设备后重试',
											showCancel: false,
											success: (res) => {
												if (res.confirm) {
													uni.redirectTo({
														url: '../index/index'
													})

												}
											}
										})
									}
									var deviceFound = false
									for (let i = 0; i < devicesArray.length; i++) {
										//2.1 如果设备名不存在直接跳出继续下次判断
										if (!devicesArray[i].name) {
											break
										}
										//2.2 查找自己的设备
										if (devicesArray[i].name.indexOf(that.deviceNamePrefix) != -1 && that.deviceImei.indexOf(devicesArray[
													i].name
												.substring(that.deviceNamePrefix.length)) != -1) {
											deviceFound = true
											that.setDeviceName(devicesArray[i].name)
											//2.3 封装实际的设备地址deviceId
											that.setDeviceId(devicesArray[i].deviceId)
											that.connectBle()
										}
										if ((i == devicesArray.length - 1) && (!deviceFound)) {
											uni.showModal({
												title: '',
												content: '未搜索到设备,请靠近设备后重试',
												showCancel: false,
												success: (res) => {
													if (res.confirm) {
														uni.redirectTo({
															url: '../index/index'
														})

													}
												}
											})
										}
									}
								}
							})
						}, 4000)
						//2. 会异步回调这个方法
						uni.onBluetoothDeviceFound((res) => {})
					},
					fail(res) {
						uni.showModal({
							title: '',
							content: '开启蓝牙搜索功能失败,请稍后重试',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									uni.reLaunch({
										url: '../index/index'
									})

								}
							}
						})
					}
				})

			},
			connectBle() {
				var that = this
				//如果已经连接，那么久不创建连接了
				if (that.bleConnectedStatus) {
					uni.getBLEDeviceServices({
						deviceId: that.deviceId,
						success: (res) => {
							let bluetoothServiceArray = res.services
							for (let i = 0; i < bluetoothServiceArray.length; i++) {
								if (bluetoothServiceArray[i].uuid.toUpperCase().indexOf(that.serviceIdPrefix) != -1) {
									that.setServiceId(bluetoothServiceArray[i].uuid)
									uni.getBLEDeviceCharacteristics({
										deviceId: that.deviceId,
										serviceId: that.serviceId,
										success(res) {
											let characteristicArray = res.characteristics
											for (let i = 0; i < characteristicArray.length; i++) {
												if (characteristicArray[i].uuid.toUpperCase().indexOf(that.notifyIdPrefix) != -1) {
													that.setNotifyServiceId(characteristicArray[i].uuid)
												} else if (characteristicArray[i].uuid.toUpperCase().indexOf(that.writeIdPrefix) != -
													1) {
													that.setWriteServiceId(characteristicArray[i].uuid)
												}
											}
										},
										fail(res) {
											uni.showModal({
												title: '',
												content: '读取蓝牙特征失败,请稍后重试',
												showCancel: false,
												success: (res) => {
													if (res.confirm) {
														uni.redirectTo({
															url: '../index/index'
														})

													}
												}
											})
										}
									})
								}
							}
						},
						fail: (res) => {
							uni.showModal({
								title: '',
								content: '读取蓝牙服务失败,请稍后重试',
								showCancel: false,
								success: (res) => {
									if (res.confirm) {
										uni.reLaunch({
											url: '../index/index'
										})

									}
								}
							})
						}
					})

				} else {
					uni.createBLEConnection({
						deviceId: that.deviceId,
						success(res) {
							//查询所有蓝牙服务
							uni.getBLEDeviceServices({
								deviceId: that.deviceId,
								success: (res) => {
									let bluetoothServiceArray = res.services
									for (let i = 0; i < bluetoothServiceArray.length; i++) {
										if (bluetoothServiceArray[i].uuid.toUpperCase().indexOf(that.serviceIdPrefix) != -1) {
											that.setServiceId(bluetoothServiceArray[i].uuid)
											uni.getBLEDeviceCharacteristics({
												deviceId: that.deviceId,
												serviceId: that.serviceId,
												success(res) {
													let characteristicArray = res.characteristics
													for (let i = 0; i < characteristicArray.length; i++) {
														if (characteristicArray[i].uuid.toUpperCase().indexOf(that.notifyIdPrefix) != -1) {
															that.setNotifyServiceId(characteristicArray[i].uuid)
														} else if (characteristicArray[i].uuid.toUpperCase().indexOf(that.writeIdPrefix) != -
															1) {
															that.setWriteServiceId(characteristicArray[i].uuid)
														}
													}
												},
												fail(res) {
													uni.showModal({
														title: '',
														content: '读取蓝牙特征失败,请稍后重试',
														showCancel: false,
														success: (res) => {
															if (res.confirm) {
																uni.redirectTo({
																	url: '../index/index'
																})

															}
														}
													})
												}
											})
										}
									}
								},
								fail: (res) => {
									uni.showModal({
										title: '',
										content: '读取蓝牙服务失败,请稍后重试',
										showCancel: false,
										success: (res) => {
											if (res.confirm) {
												uni.reLaunch({
													url: '../index/index'
												})

											}
										}
									})
								}
							})
						},
						fail(res) {
							//处理10003
							if (res.errCode === 10003) {
								console.log('连接10003')
								//1. 断连接
								uni.closeBLEConnection({
									deviceId: that.deviceId,
									success(res) {
										console.log('10003中连接断开')
									}
								})
								that.sanAndConnectBle()

							} else {
								uni.showModal({
									title: '',
									content: '蓝牙连接失败,请检查蓝牙后重试',
									showCancel: false,
									success: (res) => {
										if (res.confirm) {
											uni.reLaunch({
												url: '../index/index'
											})

										}
									}
								})
							}

						}

					})
				}

			},
			judgeLocationOpen(params) {
				var that = this
				//兼容微信奇怪的要求，使用蓝牙需要开启位置权限
				uni.getLocation({
					type: 'wgs84',
					success: function(res) {
						//1. 封装设备imei
						that.setDeviceIdFromPath(params)
						//3. 判断蓝牙功能是否打开，蓝牙打开以后才能进行蓝牙初始化
						that.judgeBlueToothCanUse()
					},
					fail() {
						uni.showModal({
							title: '',
							content: '请授予小程序获取位置功能',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									uni.openSetting({
										success(res) {
											uni.authorize({
												scope: 'scope.userLocation',
												success() {
													uni.getLocation({
														type: 'wgs84',
														success: function(res) {
															//1. 封装设备imei
															that.setDeviceIdFromPath(params)
															//3. 判断蓝牙功能是否打开，蓝牙打开以后才能进行蓝牙初始化
															that.judgeBlueToothCanUse()
														}
													})
												},
												fail() {
													uni.showModal({
														title: '',
														content: '请授予小程序获取位置功能后重试',
														showCancel: false,
														success: (res) => {
															if (res.confirm) {
																uni.reLaunch({
																	url: '../index/index'
																})

															}
														}
													})
												}
											})
										}
									})
								}
							}
						})
					}
				})
			}



		},
		computed: {
			...mapState(['phoneBlueToothCanUse', 'baseRequestUrl', 'charging', 'deviceNamePrefix', 'notifyIdPrefix',
				'writeIdPrefix', 'serviceIdPrefix',
				'deviceImei', 'deviceName', 'deviceId',
				'serviceId', 'notifyServiceId', 'writeServiceId', 'bleConnectedStatus', 'responseOrder', 'checkOnlineOrder',
				'userId'
			])
		},
		//页面加载时的生命周期函数
		onLoad(params) {
			this.judgeLocationOpen(params)

		}
	}
</script>

<style>
	.loadding-frame {
		position: fixed;
		top: 0;
		display: flex;
		width: 100%;
		justify-content: center;
		padding-top: 40rpx;
	}

	.loadding-frame-inner {
		text-align: center;
	}

	.loaddingPic {
		width: 300rpx;
		height: 300rpx;
		margin-top: 100rpx;
	}

	.loadding-desc {
		margin-top: 10rpx;
		font-size: 22rpx;
		color: #BBBBBB;
	}

	.loadProgress {
		height: 10rpx;
		width: 300rpx;
	}

	.text {
		color: #BBBBBB;
		font-size: 28rpx;
		padding: 5rpx;
	}
</style>
