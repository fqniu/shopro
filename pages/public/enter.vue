<template>
	<view class="page_box" style="overflow-x: hidden;">
		<view class="head_box"></view>
		<view class="content_box">
			<view class="address-item x-f">
				<label class="x-f flex-sub">
					<text class="item-title">姓名：</text>
					<input class="inp flex-sub" placeholder="请输入您的姓名" type="text" v-model="enter.name" />
				</label>
			</view>
			<view class="address-item x-f">
				<label class="x-f flex-sub">
					<text class="item-title">联系电话：</text>
					<input class="inp flex-sub" placeholder="请输入您的电话,方便我们后续联系您" type="number" v-model="enter.phone"/>
				</label>
			</view>
			<view class="address-item x-f" @tap="selCity">
				<label class="x-f flex-sub">
					<text class="item-title">{{ city }}：</text>
					<input class="inp flex-sub" disabled type="text" :placeholder="clickCity" v-model="enter.area_text"/>
				</label>
			</view>
		</view>
		<view class="foot_box">
			<view class="protocol">
				<label>
					<radio @click="checkbox" :checked="dis"/>
				</label>
				<text style="color: rgb(153, 153, 153);">我已阅读并同意</text>
				<text style="color: blue;">《共享蓝星合作协议》</text>
			</view>
			<button class="cu-btn add-btn" @tap="saveAddress">提交</button>
		</view>
		<shopro-picker ref="shoproCityPicker" :pickerValueDefault="cityPickerValueDefault" @onCancel="onCancel" @onConfirm="onConfirm"></shopro-picker>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			enter : {
				name : '',
				phone : '',
				type : false,
				area_text: '',
				area_id: ''
			},
			is_default: '',
			city: '所在城市',
			clickCity: '请点击所在城市',
			// 城市
			cityPickerValueDefault: [0, 0, 0],
			from: '',
			dis: false
		};
	},
	computed: {},
	onLoad() {
		let type = this.$Route.query.type;
		var title;
		this.enter.type = type;
		if(type == 1 ){
			title = '招募代理商';
			this.city = '代理城市';
			this.clickCity = "请点击代理城市";
		}else{
			title = '招募合伙人';
			this.city = '所在城市';
			this.clickCity = "请点击所在城市"
		}
		uni.setNavigationBarTitle({
			title: title
		});
	},
	methods: {
		// 编辑添加地址
		saveAddress() {
			let that = this;
			if(that.dis == false){
				this.$tools.toast('请先勾选同意协议');
				return;
			}
			this.$api('enter', that.enter).then(res => {
				if(res.code == 1){
					this.$tools.toast(res.msg);
					setTimeout(function(){
						that.$Router.back();
					}, 900);	
				}
			});
		},
		checkbox(){
			if(this.dis){
				this.dis = false;
			}else{
				this.dis = true;
			}
		},
		onSwitch() {
			this.is_default = !this.is_default;
		},
		selCity() {
			this.$refs.shoproCityPicker.show();
		},
		onConfirm(e) {
			this.enter.area_id = e.cityCode;
			this.enter.area_text = e.label;
		},
		onCancel(e) {
			this.enter.area_id = e.cityCode;
			this.enter.area_text = e.label;
		}
	}
};
</script>

<style lang="scss">
// 点击定位

.location-item {
	font-size: 28rpx;
	font-family: PingFang SC;
	font-weight: 500;
	background-color: #fff;
	color: rgba(167, 111, 13, 1);
	.address-box {
		border-radius: 6rpx;
		height: 72rpx;
		padding: 0 30rpx;
		width: 340rpx;
	}

	.cuIcon-focus,
	.cuIcon-location {
		font-size: 34rpx;
		margin-right: 10rpx;
	}
	.cuIcon-right {
		font-size: 32rpx;
	}
}
.protocol{
	font-size: 12px;
	radio{
		transform:scale(0.7);
	}
	text:last-child{
		color: rgb(0, 118, 255);
	}
}
.address-item {
	height: 96rpx;
	background: #fff;
	border-bottom: 1rpx solid rgba(#dfdfdf, 0.5);
	padding: 0 25rpx;

	.item-title {
		color: #333;
		font-size: 28rpx;
		white-space: nowrap;
	}
	.inp {
		color: #333;
		font-size: 28rpx;
	}
}
.area-box {
	min-height: 120rpx;
	padding-bottom: 60rpx;
	background: #fff;
	padding: 30rpx 25rpx;
	.item-title {
		font-size: 28rpx;
		line-height: 28rpx;
		vertical-align: middle;
		white-space: nowrap;
	}
	.area-inp {
		color: #333;
		font-size: 28rpx;
		vertical-align: middle;
		margin-top: 8rpx;
		width: 550rpx;
	}
}
.default-box {
	height: 100rpx;
	padding: 0 25rpx;
	background: #fff;
	margin-top: 20rpx;
	.title {
		font-size: 28rpx;
	}
	.switch {
		transform: scale(0.8);
	}
}
.foot_box {
	padding: 20rpx;

	.add-btn {
		width: 710rpx;
		height: 80rpx;
		background: red;
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
	}
	.delete-btn {
		width: 432rpx;
		height: 70rpx;
		background: linear-gradient(93deg, rgba(208, 19, 37, 1), rgba(237, 60, 48, 1));
		box-shadow: 0px 7rpx 6rpx 0px rgba(#ed3c30, 0.22);
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(255, 255, 255, 1);
		border-radius: 35rpx;
		padding: 0;
		margin-right: 20rpx;
	}
	.save-btn {
		width: 432rpx;
		height: 70rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>
