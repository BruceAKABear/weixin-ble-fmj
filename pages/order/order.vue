<template>
	<view class="content">
		<view class="order">
			<view class="goods-list">
				<view class="list-header">
					<text class="text">商品清单</text>
				</view>
				<view class="list-content" v-for="(goodsoObj,index) in goodsObjectArray" :key="index">
					<image class="list-content-pic" :src="goodsoObj.product.goods.imgUrl?goodsoObj.product.goods.imgUrl:defaultImg"></image>
					<view class="list-content-name">
						<text class="text">{{goodsoObj.product.goods.name}}</text>
					</view>
					<view class="list-content-number">
						<view class="real-number">
							<text class="text">X{{goodsoObj.number}}</text>
						</view>
						<view class="real-price">
							<text class="text" style="color: #E80080;">￥{{goodsoObj.product.goods.price}}</text>
						</view>
					</view>
				</view>
				<view class="list-summery">
					<text class="text">小计</text>
					<span class="count-price">￥{{totalPrice}}</span>
				</view>
				<!-- 是否显示输入优惠码 -->
				<view class="youhui-code" v-if="voucherState">
					<view class="youhui-code-text">
						<text>使用兑换码:</text>
					</view>
					<view class="youhui-code-input">
						<input type="text" v-model="youhuiCode" class="inpclass" :placeholder="placeholder" placeholder-class="pclass" />
					</view>
				</view>
			</view>
			<view class="pay-agree">
				<view class="use-code">

				</view>

				<view :class="checkV&&cansubmit?canSubmitClass:canNotSubmitClass" @tap="gotoPay()">
					<text>{{buttonMsg}}</text>
				</view>
				<view class="agree-doc">
					<view class="inner-agree-doc">
						<view @tap="changeRadioV()">
							<radio :value="checkV" :checked="checkV" />
						</view>
						我已阅读并同意<view @tap="oepnxieyi" class="yonghuxieyi">《用户协议》</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		String2Ab,
		Ab2String
	} from '../../utils/index.js'
	import {
		mapMutations,
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				checkV: true,
				defaultImg: '../../static/chongdianqi.png',
				youhuiCode: null,
				placeholder: '兑换码不区分大小写',
				cansubmit: false,
				canSubmitClass: 'submit-button',
				canNotSubmitClass: 'can-not-submit'

			}
		},
		methods: {
			...mapMutations([
				'setUserId', 'setDeviceId', 'setServiceId', 'setWriteServiceId', 'setNotifyServiceId', 'setCheckOnlineOrder',
				'setDeviceName', 'setDeviceImei'
			]),
			changeRadioV() {
				this.checkV = !this.checkV
			},
			oepnxieyi() {
				uni.showModal({
					title: '用户协议',
					content: this.machObject.userProtocol,
					showCancel: false,
					success: (res) => {
						if (res.confirm) {}
					}
				})
			},
			/**
			 * 提交订单支付
			 */
			gotoPay() {
				var that = this
				if (that.cansubmit) {
					if (that.phoneBlueToothCanUse) {
						//需要同意用户协议
						if (!that.checkV) {
							uni.showToast({
								title: '请同意用户协议',
								icon: 'none',
								mask: true,
								duration: 1500
							});
							return
						}
						//按钮不可点
						that.cansubmit = false
						if (that.bleConnectedStatus && that.writeServiceId != '') {
							uni.showLoading({
								title: '加载中'
							});
							that.startService()
						} else {
							//蓝牙未连接，重新连接
							uni.showModal({
								title: '',
								content: '设备连接中,请稍后重试',
								showCancel: false,
								success: (res) => {
									if (res.confirm) {
										that.cansubmit = true
									}
								}
							})
							return
						}
					} else {
						that.judgeBlueToothCanUse()
					}
				}
			},


			/**
			 * 提交订单，请求网络
			 */
			commitOrderRequstNetWork() {
				var that = this
				//发起网络请求提交订单
				uni.request({
					url: that.baseRequestUrl + 'microProgramOrder/commitWeixinMicroOrder',
					method: 'POST',
					data: {
						orderFrom: 'wx_fmj',
						userId: that.userId,
						deviceImei: that.deviceImei,
						voucherCode: that.youhuiCode,
						goodsInfo: JSON.stringify(that.commitGoodsArray)
					},
					success: (res) => {
						let param = res.data
						if (param.code === 1) {
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: param.timeStamp,
								nonceStr: param.nonceStr,
								package: 'prepay_id=' + param.prepayId,
								signType: 'MD5',
								paySign: param.sign,
								success: function(res) {
									//请求实际命令
									uni.request({
										url: that.baseRequestUrl + 'order/getRealOrder?sysOrderId=' + param.sysOrderId,
										success: (res) => {
											if (res.data.code === 1) {
												let chargeTimeOrder = res.data.order
												console.log('实际命令长度为',chargeTimeOrder.length)
												if (chargeTimeOrder.length <= 40) {
													uni.writeBLECharacteristicValue({
														deviceId: that.deviceId,
														serviceId: that.serviceId,
														characteristicId: that.writeServiceId,
														value: String2Ab(chargeTimeOrder),
														success(res) {
															//监听响应的命令
															//定时判断是否相同
															var chargeIntervalTimmerId = setInterval(function() {
																if (chargeTimeOrder.indexOf(that.responseOrder) != -1) {
																	//设置在充电中
																	clearInterval(chargeIntervalTimmerId)
																	clearTimeout(chargeTimeOutTimmerId)
																	//下发Q06=1@
																	uni.writeBLECharacteristicValue({
																		deviceId: that.deviceId,
																		serviceId: that.serviceId,
																		characteristicId: that.writeServiceId,
																		value: String2Ab(that.confirmOrder),
																		success(res) {
																			//关闭蓝牙连接
																			uni.closeBLEConnection({
																				deviceId: that.deviceId,
																				success(res) {
																					console.log(res)
																				}
																			})
																			uni.hideLoading();
																			//跳转到充电页面
																			uni.reLaunch({
																				url: '../buyfinish/buyfinish'
																			})
																		}
																	})
																}
															}, 200)
															//定时判断,如果5秒以后还不对，那么就是伪造的直接推出
															var chargeTimeOutTimmerId = setTimeout(function() {
																if (chargeTimeOrder.indexOf(that.responseOrder) === -1) {
																	clearInterval(chargeIntervalTimmerId)
																	//关闭蓝牙连接
																	uni.hideLoading();
																	uni.showModal({
																		title: '',
																		content: '蓝牙响应失败,请重新扫码',
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
															}, 3000);
														}
													})

												} else {
													let orderTime = Math.floor(chargeTimeOrder.length / 40)
													for (let i = 0; i <= orderTime; i++) {
														console.log('实际命令为',chargeTimeOrder)
														console.log('第' + i + '次的命令', chargeTimeOrder.substring(i * 40, (i+1)*40))

														uni.writeBLECharacteristicValue({
															deviceId: that.deviceId,
															serviceId: that.serviceId,
															characteristicId: that.writeServiceId,
															value: String2Ab(chargeTimeOrder.substring(i * 40, (i+1)*40)),
															success(res) {
																//监听响应的命令
																//定时判断是否相同
																// var chargeIntervalTimmerId = setInterval(function() {
																// 	if (chargeTimeOrder.indexOf(that.responseOrder) != -1) {
																		//设置在充电中
																		// clearInterval(chargeIntervalTimmerId)
																		// clearTimeout(chargeTimeOutTimmerId)
																		//下发Q06=1@
																		// uni.writeBLECharacteristicValue({
																		// 	deviceId: that.deviceId,
																		// 	serviceId: that.serviceId,
																		// 	characteristicId: that.writeServiceId,
																		// 	value: String2Ab(that.confirmOrder),
																		// 	success(res) {
																		// 		//关闭蓝牙连接
																		// 		uni.closeBLEConnection({
																		// 			deviceId: that.deviceId,
																		// 			success(res) {
																		// 				console.log(res)
																		// 			}
																		// 		})
																		// 		uni.hideLoading();
																		// 		//跳转到充电页面
																		// 		uni.reLaunch({
																		// 			url: '../buyfinish/buyfinish'
																		// 		})
																		// 	}
																		// })
																// 	}
																// }, 200)
																//定时判断,如果5秒以后还不对，那么就是伪造的直接推出
																var chargeTimeOutTimmerId = setTimeout(function() {
																	if (chargeTimeOrder.indexOf(that.responseOrder) === -1) {
																		//clearInterval(chargeIntervalTimmerId)
																		//关闭蓝牙连接
																		uni.hideLoading();
																		uni.showModal({
																			title: '',
																			content: '蓝牙响应失败,请重新扫码',
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
																}, 3000);
															}
														})
													}
												}

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

										}
									})
								},
								fail: function(err) {
									uni.hideLoading()
									that.cansubmit = true
									//支付失败的话跳转到首页
									console.error('支付失败' + JSON.stringify(err));
								}
							});
						} else {
							uni.showModal({
								title: '',
								content: param.message,
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
				})

			},


			startService() {
				var that = this
				uni.notifyBLECharacteristicValueChange({
					state: true,
					deviceId: that.deviceId,
					serviceId: that.serviceId,
					characteristicId: that.notifyServiceId,
					success(res) {
						// 下发在线命令
						uni.writeBLECharacteristicValue({
							deviceId: that.deviceId,
							serviceId: that.serviceId,
							characteristicId: that.writeServiceId,
							value: String2Ab(that.checkOnlineOrder),
							success(res) {
								//定时判断是否相同
								var intervalTimmerId = setInterval(function() {
									if (that.checkOnlineOrder.indexOf(that.responseOrder) != -1) {
										//关闭蓝牙连接，以免创建多次连接系统级别会出问题
										clearInterval(intervalTimmerId)
										clearTimeout(timoutTimmerId)
										//提交订单
										that.commitOrderRequstNetWork()
									}
								}, 200)
								//定时判断,如果5秒以后还不对，那么就是伪造的直接推出
								var timoutTimmerId = setTimeout(function() {
									if (that.checkOnlineOrder.indexOf(that.responseOrder) === -1) {
										clearInterval(intervalTimmerId)
										uni.showModal({
											title: '',
											content: '蓝牙功能异常,请稍后重试',
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
								}, 5000);
							}
						})

					},
					fail(res) {
						console.log('开启notify功能失败', res)
					}
				})

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
						that.sanAndConnectBle()
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
			sanAndConnectBle() {
				var that = this
				uni.startBluetoothDevicesDiscovery({
					//开启蓝牙搜索服务
					success: (res) => {
						setTimeout(() => {
							uni.stopBluetoothDevicesDiscovery({
								success(res) {}
							})
							uni.getBluetoothDevices({
								success(res) {
									//判断是否是自己的设备,只能通过name来判断
									var devicesArray = res.devices
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
										if ((i === devicesArray.length - 1) && (!deviceFound)) {
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
						}, 2000)
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
											that.cansubmit = true
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
														that.cansubmit = true
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

			}

		},
		computed: {
			...mapState(['phoneBlueToothCanUse', 'baseRequestUrl', 'charging', 'deviceNamePrefix', 'notifyIdPrefix',
				'writeIdPrefix', 'serviceIdPrefix',
				'deviceImei', 'deviceName', 'deviceId',
				'serviceId', 'notifyServiceId', 'writeServiceId', 'bleConnectedStatus', 'responseOrder', 'checkOnlineOrder',
				'confirmOrder',
				'goodsObjectArray', 'commitGoodsArray', 'userId'
			]),
			totalPrice() {
				let pric = 0
				let goa = this.goodsObjectArray
				for (var i = 0; i < goa.length; i++) {
					let singleProduc = goa[i]
					pric += singleProduc.product.goods.price * singleProduc.number
				}
				return pric
			},
			buttonMsg() {
				return this.cansubmit ? '立即支付' : '订单加载中'
			}
		},
		onLoad() {
			//2.判断蓝牙是否可用
			this.judgeBlueToothCanUse()
		}
	}
</script>

<style>
	.order {
		padding: 30rpx;
	}

	.list-header {
		padding-bottom: 12rpx;
		border-bottom: solid 1rpx #BBBBBB;
	}

	.list-content {
		display: flex;
		padding-top: 30rpx;
		padding-bottom: 30rpx;
		border-bottom: solid 1rpx #BBBBBB;
	}

	.list-content-pic {
		width: 80rpx;
		height: 80rpx;
	}

	.list-content-name {
		margin-left: 20rpx;
		padding: 0;
		max-width: 350rpx;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.list-content-number {
		position: absolute;
		right: 10%;
		text-align: left;
		display: flex;
		flex-direction: column;
	}

	.list-summery {
		padding: 30rpx;
		text-align: right;
	}

	.count-price {
		font-size: 28rpx;
		color: #E80080;
		margin-left: 40rpx;
	}

	.submit-button {
		position: absolute;
		left: 50%;
		transform: translate(-50%);
		bottom: 40%;
		width: 600rpx;
		text-align: center;
		padding: 30rpx;
		background-color: #007AFF;
		border-radius: 10rpx;
		color: #FFFFFF;
	}

	.submit-button:active {
		opacity: 0.4;
	}

	.can-not-submit {
		position: absolute;
		left: 50%;
		transform: translate(-50%);
		bottom: 40%;
		width: 600rpx;
		text-align: center;
		padding: 30rpx;
		background-color: #555555;
		border-radius: 10rpx;
		color: #FFFFFF;
	}

	.text {
		color: black;
		font-size: 28rpx;
	}

	.youhui-code {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-direction: row;
		margin-top: 60rpx;
		margin-bottom: 20rpx;
	}

	.youhui-code-text {
		font-size: 30rpx;
	}

	.youhui-code-input {
		border: solid 1rpx #BBBBBB;
		margin-left: 20rpx;
	}

	.agree-doc {
		position: absolute;
		left: 50%;
		width: 600rpx;
		transform: translate(-50%);
		bottom: 33%;
		display: flex;
		justify-content: center;
		font-size: 30rpx;
		color: #B2B2B2;
	}

	.inner-agree-doc {
		display: flex;
		flex-direction: row;
	}

	.inpclass {
		font-size: 30rpx;
		padding-left: 20rpx;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
	}


	.yonghuxieyi {
		color: #E80080;
	}

	.pclass {
		font-size: 30rpx;
	}
</style>
