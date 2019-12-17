<script>
	//引入vuex
	import {
		mapState,
		mapMutations
	} from "vuex"
	//导入工具类
	import {
		Ab2String
	} from './utils/index.js'
	export default {
		onLaunch: function() {
			//首先检查是否有更新
			this.checkUpdateAndApply()
			//小程序启动时开始监听
			this.openBlueToothAdapterAndListenState()
			this.listenBLEConnectionStateChange()
			this.listenResponseOrder()
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			...mapMutations([
				'setPhoneBlueToothCanUse', 'setBleConnectedStatus', 'setResponseOrder'
			]),
			/**
			 * 开启蓝牙适配器，并监听手机蓝牙是否可用
			 */
			openBlueToothAdapterAndListenState() {
				var that = this
				//1. 开启蓝牙适配器
				uni.openBluetoothAdapter({
					success(res) {
						that.setPhoneBlueToothCanUse(true)
					},
					fail(res) {
						that.setPhoneBlueToothCanUse(false)
					}
				})
				//2. 监听适配器的改变
				uni.onBluetoothAdapterStateChange(function(res) {
					//如果蓝牙可用了以后，将蓝牙状态改为可用
					that.setPhoneBlueToothCanUse(res.available)
				})
			},
			/**
			 * 监听手机蓝牙连接状态
			 */
			listenBLEConnectionStateChange() {
				var that = this
				uni.onBLEConnectionStateChange(function(res) {
					that.setBleConnectedStatus(res.connected)
					// 该方法回调中可以用于处理连接意外断开等异常情况
				})
			},
			listenResponseOrder() {
				var that = this
				uni.onBLECharacteristicValueChange(function(res) {
					//监听到的值
					let resOrder = Ab2String(res.value)
					console.log('监听到的响应命令为:', resOrder)
					that.setResponseOrder(resOrder)
				})
			},
			/**
			 * 检查并应用更新
			 */
			checkUpdateAndApply() {
				const updateManager = uni.getUpdateManager();
				//检查新版本
				updateManager.onCheckForUpdate(function(res) {
					//如果有新版本，那么强制更新
					if (res.hasUpdate) {
						uni.showLoading({
							title: '新版本安装中',
						});
					}
					//下载更新并重启
					updateManager.onUpdateReady(function(res) {
						updateManager.applyUpdate();
					});
				});
				//当下载更新失败，提示用户重启小程序
				updateManager.onUpdateFailed(function(res) {
					uni.hideLoading();
					uni.showModal({
						title: '更新失败',
						content: '更新失败,请重启小程序',
						showCancel: false,
						success: function(res) {
							if (res.confirm) {
								console.log('用户点击确定');
							}
						}
					});
					// 新的版本下载失败
					console.error('更新下载失败')
				});
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import '../../common/uni.css'

	/*每个页面公共css */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
