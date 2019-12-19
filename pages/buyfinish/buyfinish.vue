<template>
	<view class="content">
		<view class="buyfinish-main">
			<!-- 头信息 -->
			<view class="buyfinish-main-header-box">
				<image class="buyfinish-main-pic" src="../../static/buyfinish.png" mode="widthFix"></image>
				<text>支付成功</text>
			</view>
			<view class="buyfinish-main-info">
				<view class="buyfinish-main-info-header">
					<text>订单信息</text>
				</view>
				<view class="buyfinish-main-info-body">
					<view class="buyfinish-main-info-body-goods-item" v-for="(goodsoObj,index) in goodsObjectArray" :key="index">
						<view class="product-pic">
							<image style="width: 150rpx;" :src="goodsoObj.product.goods.imgUrl?goodsoObj.product.goods.imgUrl:defaultImg"
							 mode="widthFix"></image>
						</view>
						<view class="product-info">
							<text class="product-info-name">{{goodsoObj.product.goods.name}}</text>
							<text class="product-info-desc"></text>
						</view>
						<view class="product-number">
							<text>X{{goodsoObj.number}}</text>
							<text style="color: #E80080;">￥{{goodsoObj.product.goods.price}}</text>
						</view>
					</view>
				</view>
				<view class="buyfinish-main-info-foot">
					<text>共计支付</text>
					<text style="margin-left: 10rpx;color: #E80080;">￥{{totalPrice}}元</text>
				</view>
			</view>
			<!-- <view class="buyfinish-main-callservice-box">
				<text class="buyfinish-main-callservice-text">若售货机未开门,请联系客服</text>
			</view> -->
			<view class="buyfinish-main-call-box" @tap="lianxikefu()">
				<image class="buyfinish-main-callservice-kefunv"  src="../../static/kefunv.png"  mode="widthFix"></image>
				<text>联系客服</text>
			</view>
			<view class="buyfinish-main-gobackindex-box" @tap="gobackmian()">
				<image class="buyfinish-main-callservice-kefunv" src="../../static/fanhuishouye.png" mode="widthFix"></image>
				<text>返回首页</text>
			</view>
			<!-- 加盟信息 -->
			<view class="agent">
				<view class="agent-inner">
					<view>
						了解更多共享蓝牙新零售合作、代理等
					</view>
					<view>
						请关注微信公众号<text style="color:#29c1c2;">【亿联物联】</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				defaultImg: '../../static/prod.png'
			}
		},
		methods: {
			lianxikefu() {
				uni.makePhoneCall({
					phoneNumber: this.machObject.servicePhone
				})
			},
			gobackmian() {
				uni.reLaunch({
					url: '../index/index'
				})
			}

		},
		onShow() {
			//页面再次显示的时候直接跳转到主页
			// uni.reLaunch({
			// 	url: '../index/index'
			// })
		},
		computed: {
			...mapState(['userId', 'goodsObjectArray', 'machObject']),
			totalPrice() {
				let pric = 0
				let goa = this.goodsObjectArray
				for (var i = 0; i < goa.length; i++) {
					let singleProduc = goa[i]
					pric += singleProduc.product.goods.price * singleProduc.number
				}
				return pric
			}
		}
	}
</script>

<style scoped>
	.buyfinish-main-header-box {
		position: absolute;
		top: 2%;
		left: 50%;
		transform: translate(-50%);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 50rpx;
		color: #999999;
	}

	.buyfinish-main-pic {
		width: 60rpx;
		margin-right: 10rpx;
	}

	.buyfinish-main-info {
		position: absolute;
		left: 50%;
		top: 20%;
		transform: translate(-50%);
		width: 600rpx;
		height: 400rpx;
		display: flex;
		flex-direction: column;

	}

	.buyfinish-main-info-header {
		text-align: left;
		color: #999999;
		padding-top: 20rpx;
		padding-bottom: 25rpx;
	}

	.buyfinish-main-info-body {
		border-top: solid 2rpx #BBBBBB;
	}

	.buyfinish-main-info-body-goods-item {
		display: flex;
		flex-direction: row;
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: solid 2rpx #BBBBBB;
	}

	.product-pic {
		width: 30%;
	}

	.product-info {
		width: 50%;
		display: flex;
		flex-direction: column;
		text-align: left;

	}

	.product-info-name {
		font-size: 40rpx;
		max-width: 250rpx;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.product-info-desc {
		color: #999999;
		font-size: 30rpx;
	}


	.product-number {
		width: 20%;
		display: flex;
		flex-direction: column;
		text-align: right;

	}

	.buyfinish-main-info-foot {
		color: #999999;
		padding: 20rpx;
		text-align: right;

	}

	.buyfinish-main-callservice-box {
		position: absolute;
		bottom: 5%;
		left: 50%;
		transform: translate(-50%);
	}

	.buyfinish-main-callservice-text {
		color: #BBBBBB;
		font-size: 28rpx;
		padding: 5rpx;
	}

	.buyfinish-main-call-box {
		position: absolute;
		bottom: 18%;
		right: -50rpx;
		width: 220rpx;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
		padding-right: 18rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #BBBBBB;
		border-radius: 55rpx;
		box-shadow: 0 0 10rpx #FFD700;
		height: 100rpx;

	}

	.buyfinish-main-call-box:active {
		color: #FFFFFF;
		background-color: rgba(0, 0, 0, 0.3);
		opacity: .9;
		z-index: 99;

	}

	.buyfinish-main-callservice-kefunv {
		width: 50rpx;
		margin-bottom: 6rpx;
	}

	.buyfinish-main-gobackindex-box {
		position: absolute;
		bottom: 18%;
		left: -50rpx;
		width: 220rpx;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
		padding-left: 18rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #BBBBBB;
		border-radius: 55rpx;
		box-shadow: 0 0 10rpx #007AFF;
		height: 100rpx;
	}

	.buyfinish-main-gobackindex-box:active {
		color: #FFFFFF;
		background-color: rgba(0, 0, 0, 0.3);
		opacity: .9;
		z-index: 99;

	}

	.agent {
		position: fixed;
		bottom: 2%;
		display: flex;
		width: 100%;
		justify-content: center;

	}

	.agent-inner {
		text-align: center;
		color: #BBBBBB;
		font-size: 28rpx;
	}
</style>
