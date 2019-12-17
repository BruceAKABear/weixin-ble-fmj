<template>
	<view class="content">
		<!-- 运营商banner -->
		<view class="operator-banner">
			<image class="operator-banner-pic" :src="banner" mode="widthFix"></image>
		</view>
		<!-- 商品列表 -->
		<view class="goods-list">
			<view :class="goods.empty?styleEmpty:stylefull " v-for="(goods,index)  in goodsList " :key='index' @tap="selectedGoods(goods)">
				<!-- 根据available判断商品是否可用 -->
				<view class="goods-item-inner">
					<view class="">
						<image class="goods-item-inner-pic" :src="goods.goods.imgUrl?goods.goods.imgUrl:defaultImg"></image>
					</view>
					<view class="goods-item-inner-name">
						{{goods.goods.name}}
					</view>
					<view class="goods-item-inner-price">
						￥{{goods.goods.price}}
					</view>
				</view>

			</view>
		</view>
		<!-- 底部通过 -->
		<view class="bottom-info">
			<view class="bottom-item">
				<uni-icon type="home" color="#B2B2B2" size="50"></uni-icon>
				<text class="buy-text">旗舰店</text>
			</view>
			<view class="bottom-item" @tap="openUserPro()">
				<uni-icon type="email" color="#B2B2B2" size="50"></uni-icon>
				<text class="buy-text">用户协议</text>
			</view>
			<view class="bottom-item" @tap="callKefu()">
				<uni-icon type="contact" color="#B2B2B2" size="50"></uni-icon>
				<text class="buy-text">客服</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState
	} from 'vuex'
	import uniIcon from '../../components/uni-icons/uni-icons.vue'
	export default {
		data() {
			return {
				defaultImg: '../../static/chongdianqi.png',
				goodsList: [],
				banner: '',
				//商场地址
				mallUrl: '',
				servicePhone: '',
				userProtocol: '',
				stylefull: 'goods-item',
				styleEmpty: 'goods-item-empty'
			}
		},
		components: {
			uniIcon
		},
		methods: {
			...mapMutations(['setGoodsObjectArray', 'setMachObject', 'setVoucherState', 'setCommitGoodsArray']),

			openUserPro() {
				uni.showModal({
					title: '用户协议',
					content: this.userProtocol?this.userProtocol:'默认用户协议',
					showCancel: false,
					success: (res) => {
						if (res.confirm) {}
					}
				})
			},
			//选中商品
			selectedGoods(goods) {
				if (goods.empty) {
					uni.showModal({
						title: '',
						content: '此商品已经售空，请选择其他商品',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {}
						}
					})
					return
				}
				//购买的商品对象
				let pAndN = {}
				//货道号
				pAndN.cabinetNo = goods.id
				pAndN.goodsCount = 1
				pAndN.returnCount = 0
				pAndN.goodsId = goods.goods.id
				pAndN.goodsPrice = goods.goods.price
				pAndN.goodsName = goods.goods.name
				let gArray = []
				gArray.push(pAndN)

				let showObj = {}
				showObj.product = goods
				showObj.number = 1
				let showArray = []
				showArray.push(showObj)

				this.setCommitGoodsArray(gArray)
				this.setGoodsObjectArray(showArray)
				//选中商品，跳转订单页面，显示支付
				uni.navigateTo({
					url: '../order/order'
				})

			},
			callKefu() {
				uni.makePhoneCall({
					phoneNumber: this.servicePhone
				});

			},
			queryAllGoods() {
				var that = this
				uni.request({
					url: that.baseRequestUrl + 'infos/getMctIdByImei?deviceImei=' + that.deviceImei,
					method: 'GET',
					success: (resm) => {
						if (resm.data.status) {
							uni.request({
								url: that.baseRequestUrl + 'infos/getBrandInfoByMctId/?mctId=' + resm.data.data.mctId,
								method: 'GET',
								success: (resb) => {
									if (resb.data.status) {
										let wholedata = resb.data.data.brandInfo
										that.setMachObject(wholedata)
										uni.setNavigationBarTitle({
											title: wholedata.mobileTitle
										})
										that.servicePhone = wholedata.servicePhone
										that.userProtocol = wholedata.userProtocol
										that.mallUrl = wholedata.mallUrl
										let imageInfoArray = JSON.parse(wholedata.imgInfo)
										that.banner = imageInfoArray[0].url
										uni.request({
											url: that.baseRequestUrl + 'infos/getDeviceGoodsByImei?deviceImei=' + that.deviceImei,
											method: 'GET',
											success: (resg) => {
												if (resg.data.status) {
													that.goodsList = resg.data.data.goodsList
												} else {
													uni.showModal({
														title: '',
														content: resg.data.message,
														showCancel: false,
														success: (resgs) => {
															if (resgs.confirm) {
																uni.reLaunch({
																	url: '../index/index'
																})
															}
														}
													})
													return
												}
											}
										});
										//请求是否开启优惠券
										uni.request({
											url: that.baseRequestUrl + 'infos/getVoucherStateByMctId?mctId=' + wholedata.mctId,
											method: 'GET',
											success(res) {
												if (res.data.status) {
													if (res.data.data.state) {
														that.setVoucherState(true)
													}
												} else {
													uni.showModal({
														title: '',
														content: res.data.message,
														showCancel: false,
														success: (res) => {
															if (res.confirm) {
																uni.reLaunch({
																	url:'../index/index'
																})
															}
														}
													})
												}
											}
										})

									} else {
										uni.showModal({
											title: '',
											content: resb.data.message,
											showCancel: false,
											success: (resbs) => {
												if (resbs.confirm) {
													uni.reLaunch({
														url: '../index/index'
													})
												}
											}
										})
										return
									}
								}
							});

						} else {
							uni.showModal({
								title: '',
								content: resm.data.message,
								showCancel: false,
								success: (resms) => {
									if (resms.confirm) {
										uni.reLaunch({
											url: '../index/index'
										})
									}
								}
							})
						}

					}
				});
			}

		},
		computed: {
			...mapState(['deviceImei', 'baseRequestUrl'])
		},
		//页面加载时查询运营商的banner
		onLoad() {
			this.queryAllGoods()
		}
	}
</script>

<style>
	.buy-text {
		font-size: 28rpx;
	}

	.operator-banner {
		text-align: center;

	}

	.operator-banner-pic {
		width: 700rpx;
	}

	.goods-list {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		flex-direction: row;
		margin-bottom: 10vh;
	}

	.goods-item {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		text-align: center;
		width: 320rpx;
		padding: 5rpx;
		margin-left: 30rpx;
	}

	.goods-item-empty {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		text-align: center;
		width: 320rpx;
		padding: 5rpx;
		margin-left: 30rpx;
		opacity: 0.4;
	}

	.goods-item-inner {
		margin: 10rpx;
		background-color: #EEEEEE;
		padding: 10rpx;
	}

	.goods-item-inner-pic {
		width: 100rpx;
		height: 100rpx;
	}

	.goods-item-inner-name {
		font-size: 25rpx;
	}

	.goods-item-inner-price {
		font-size: 20rpx;
		color: #E80080;
	}

	.bottom-info {
		position: fixed;
		bottom: 0;
		display: flex;
		width: 100%;
		justify-content: center;
		padding-bottom: 10rpx;
		padding-top: 10rpx;
		border-top: solid 1rpx #BBBBBB;
		background-color: #FFFFFF;
	}

	.bottom-item {
		display: flex;
		flex-direction: column;
		font-size: 25rpx;
		color: #B2B2B2;
		width: 200rpx;
		text-align: center;
	}
</style>
