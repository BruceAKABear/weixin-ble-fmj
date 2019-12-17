<template>
	<!-- 加盟代理 -->
	<view class="agent-box">
		<view class="agent-box-info">
			<text>了解更多共享便民设备合作、加盟、代理</text>
		</view>
		<view class="agent-box-contact">
			<text>请电联或关注微信公众号</text>
			<view @tap="callForJoin()">
				<text style="color:#29c1c2;">【亿联物联】</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'JoinUs',
		props: {
			hotline: {
				type: String,
				default: '4000032400'
			}
		},
		methods: {
			//加盟咨询
			callForJoin() {
				uni.makePhoneCall({
					phoneNumber: this.hotline
				});
			}

		}


	}
</script>

<style>
	.agent-box {
		position: fixed;
		bottom: 8%;
		left: 50%;
		transform: translate(-50%);
		justify-content: center;
		font-size: 25rpx;
		color: #BBBBBB;
	}

	.agent-box-info {
		display: flex;
		justify-content: center;
		text-align: center;

	}

	.agent-box-contact {
		display: flex;
		justify-content: center;
		text-align: center;
		width: 600rpx;
	}
</style>
