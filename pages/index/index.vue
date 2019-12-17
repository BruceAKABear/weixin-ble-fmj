<template>
	<view class="content">
		<!-- 显示主页 -->
		<view class="showIndex">
			<!-- 广告或者是其他什么信息,如果需要显示那么在页面加载的时候请求数据 -->
			<view class="adorbanner">

			</view>
			<image class="backgroundPic" src="../../static/index.jpg" mode="widthFix"></image>
			<!-- 扫码按钮 -->
			<view class="sanButtom" @tap="openSacan">
				<uni-icon type='scan' color="#FFFFFF" size='40'></uni-icon>
				<text style="color: #FFFFFF;margin-left: 10rpx;font-size: 38rpx;">扫码购买</text>
			</view>
			<!-- 加盟组件 -->
			<join-us :hotline="joinPhone"></join-us>

		</view>
	</view>
</template>

<script>
	import uniIcon from "../../components/uni-icons/uni-icons.vue"
	import joinUs from "../../components/join-us/join-us.vue"
	import {
		mapState
	} from 'vuex'
	export default {
		data() {
			return {

			}
		},
		components: {
			uniIcon,
			joinUs
		},
		computed: {
			...mapState(['joinPhone', 'projectName', 'baseUrl'])
		},
		methods: {
			//打开扫一扫功能扫码
			openSacan() {
				// 只允许通过相机扫码
				uni.scanCode({
					onlyFromCamera: true,
					success: (res) => {
						//判断二维码是否是本公司密码
						let scanUrlIndex = res.result
						if (scanUrlIndex.indexOf(this.baseUrl + this.projectName) != -1) {
							let imeiFromIndex = scanUrlIndex.substring(scanUrlIndex.indexOf('imei=') + 5)
							uni.redirectTo({
								url: '../loadding/loadding?imei=' + imeiFromIndex
							});
						} else {
							uni.showModal({
								title: '',
								content: '请扫描正确的二维码',
								showCancel: false,
								success: (res) => {}
							});
						}
					}
				});

			}
		}
	}
</script>

<style>
	.backgroundPic {
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0rpx;
		top: 0rpx;
	}

	.sanButtom {
		position: absolute;
		bottom: 25%;
		left: 50%;
		transform: translate(-50%);
		width: 600rpx;
		background-color: #007AFF;
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10rpx;
		padding-top: 22rpx;
		padding-bottom: 22rpx;
	}

	.sanButtom:active {
		opacity: 0.5;
	}

	.sanButtom text {
		margin-left: 7rpx;
	}
</style>
