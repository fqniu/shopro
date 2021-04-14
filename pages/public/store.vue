<template>
	<view>
		<!-- 头部表单 红色 -->
		<view class='nav-wrap' :style="{'padding-top':statusBarHeight + 'px'}">
			<view class='nav-bottom'>
				<view class='select'>
					<region-picker @tap='region_tap' @change="region_change" :value="[0,0,0]" @cancel='cancelButton'>
						<view class="picker">
							<view class='picker-slot'>
								<view class='picker-name'>{{currentPosition}}</view>
								<text v-if='currentPosition' :class='isclick?"isclick":""' class="yticon cuIcon-fold xia"></text>
							</view>
						</view>
					</region-picker>
				</view>
				<view class='nav-input'>
					<icon type='search' class='search' size="17"></icon>
					<input class="uni-input" @input="onKeyInput" placeholder="户外背包" />
				</view>
			</view>
		</view>

		<!-- 主体内容 -->
		<view class='mian'>
			<!-- 下拉框组 -->
			<sh-filter @change='shFilterData'>dd</sh-filter>
			<!-- 列表组件  -->
			<view class="goods-list">
				<view class="goods-item" v-for="shop in shopList" :key="shop.id" @tap="jump('pages/public/store-details', { id: shop.id })">
					<view class='data-left'>
						<image class='img' :src="shop.image_first"></image>
					</view>
					<view class='data-main'>
						<view class='main-title one-t'>{{shop.name}}</view>
						<view class='main-score one-t'>月销 {{shop.salesNum}}</view>
						<view class='main-info one-t'>{{shop.introduction}}</view>
					</view>
					<view class='data-right'>{{shop.distance_text}}</view>
				</view>
			</view>
			<!-- 空白页 -->
			<shopro-empty v-if="!shopList.length && !isLoading" :emptyData="emptyData"></shopro-empty>
			<!-- 加载更多 -->
			<view v-if="shopList.length" class="cu-load text-gray" :class="loadStatus"></view>
			<!-- load -->
			<shopro-load v-model="isLoading"></shopro-load>
			<!-- 没有了 -->
			<view v-if='shopListsIsNull' class='dataNull'>没有更多了</view>
		</view>
	</view>
</template>

<script>
	//引入加载中组件
	import shoproLoad from '@/components/shopro-load/shopro-load.vue';
	import shFilter from './children/sh-filter.vue';
	import regionPicker from "@/components/region-picker/region-picker.vue";
	import shoproEmpty from '@/components/shopro-empty/shopro-empty.vue';

	export default {
		data() {
			return {
				statusBarHeight: 0,
				//商品列表数据
				shopList: [],
				// 定位地址
				currentPosition: '',
				//箭头
				isclick: false,
				longitudeLatitude: {
					longitude: 0,
					latitude: 0,
					page: 1
				},
				emptyData: {
					img: '/static/imgs/empty/empty_goods.png',
					tip: '暂无该商品，还有更多好货等着你噢~'
				},
				isLoading: true,
				loadStatus: '',
				scrollTop: 0,
				shopListsIsNull: false
			};
		},
		methods: {
			// 搜索
			onKeyInput(e) {
				this.value = e.detail.value;
				this.shopList = [];
				this.shopListsIsNull = false;
				this.longitudeLatitude.page = 1;
				let obj = { ...this.longitudeLatitude,
					keywords: this.value
				}
				this.getGoodsList(obj)
			},
			//排序
			shFilterData(val) {
				if (val.salesOrder === 1) {
					this.shFilterDataFun('asc', 'salesNum')
				}
				if (val.salesOrder === 2) {
					this.shFilterDataFun('desc', 'salesNum')
				}
				// 附近排序
				if (val.newProdcutOrder === 1) {
					this.shFilterDataFun('asc', 'distance')
				}
				if (val.newProdcutOrder === 2) {
					this.shFilterDataFun('desc', 'distance')
				}
			},
			//排序fun
			shFilterDataFun(order, field) {
				this.shopList = [];
				this.shopListsIsNull = false;
				this.longitudeLatitude.page = 1;
				let obj = { ...this.longitudeLatitude,
					order: order,
					field: field
				}
				this.getGoodsList(obj)
			},
			//请求数据
			getGoodsList(obj) {
				let that = this;
				that.isLoading = true;
				that.$api('store.nearby', obj).then(res => {
					//获取到商品列表
					if (res.code === 1) {
						that.isLoading = false;
						//获取到门店列表 赋值
						if (res.data.rows.length) {
							that.shopList.push(...res.data.rows);
							that.shopListsIsNull = false
						} else {
							that.shopListsIsNull = true
						}
					}
				});
			},
			//城市转经纬度
			getLongitudeLatitude(obj) {
				this.$api('store.addressinfo', obj).then(res => {
					if (res.code === 1) {
						let arr = res.data.location.split(",");
						//发请求获取经纬度附近的店铺信息
						this.shopList = [];
						this.getGoodsList({
							'longitude': arr[0],
							'latitude': arr[1]
						});
						//获取城市名称
						this.getCityName({
							'longitude': arr[0],
							'latitude': arr[1]
						});
					}
				})
			},
			//经纬度转城市
			getCityName(obj) {
				this.$api('store.addressinfo', obj).then(res => {
					if (res.code === 1) {
						this.areaCode = res.data.adcode;
					}
				})
			},
			//获取选择的地址
			region_change(val) {
				let address = val.detail.value.join('');
				let city = val.detail.value[val.detail.value.length - 1];
				//获取经纬度
				this.getLongitudeLatitude({
					address,
					city
				})
				this.isclick = false;
			},
			region_tap() {
				this.isclick = true;
			},
			//取消
			cancelButton() {
				this.isclick = false;
			},
			//跳转到详情页
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			}

		},
		onLoad() {
			this.statusBarHeight = wx.getSystemInfoSync()['statusBarHeight']
			//获取经纬度
			let _this = this
			uni.getLocation({
				type: 'wgs84',
				geocode: true, //设置该参数为true可直接获取经纬度及城市信息
				success: function(res) {
					_this.longitudeLatitude.longitude = res.longitude;
					_this.longitudeLatitude.latitude = res.latitude;
					_this.getGoodsList(_this.longitudeLatitude);
					_this.getCityName({
						longitude: _this.longitudeLatitude.longitude,
						latitude: _this.longitudeLatitude.latitude
					})
				},
				fail: function() {
					uni.showToast({
						title: '获取地址失败，将导致部分功能不可用',
						icon: 'none'
					});
				}
			});
		},
		//监听下拉触底事件
		onReachBottom() {
			if (!this.shopListsIsNull) {
				this.longitudeLatitude.page = this.longitudeLatitude.page + 1
				this.getGoodsList(this.longitudeLatitude);
				// 跳转滚动条位置
				uni.pageScrollTo({
					scrollTop: this.scrollTop
				})
			}
		},
		// 记录滚动条的位置
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		},
		components: {
			shFilter,
			shoproLoad,
			regionPicker,
			shoproEmpty
		}
	};
</script>

<style lang='scss' scoped>
	/* 1rpx = 0.5px */
	.nav-wrap {
		background-color: #E73823;

		.nav-bottom {
			display: flex;
			height: 80rpx;
			box-sizing: border-box;

			.select {
				display: flex;
				width: 140rpx;
				justify-content: center;
				align-items: center;

				.picker {
					.picker-slot {
						color: #fff;
						display: flex;

						.picker-name {
							width: 90rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						.xia {
							margin-top: 2rpx;
							transform: rotate(180deg);
							transition: transform .5s;
						}

						.isclick {
							transform: rotate(0deg);
							transition: transform .5s;
						}
					}
				}
			}

			.nav-input {
				flex: 1;
				position: relative;
				display: flex;
				align-items: center;

				.search {
					width: 36rpx;
					height: 36rpx;
					position: absolute;
					top: 26rpx;
					left: 20rpx;
				}

				.uni-input {
					width: 400rpx;
					height: 62rpx;
					padding-left: 70rpx;
					background-color: #fff;
					border-radius: 80px;
					color: rgba(136, 136, 136, 100);
					font-size: 13px;
					text-align: justify;
					font-family: Arial;
				}
			}
		}
	}

	.drop-down-list {
		display: flex;
		align-items: center;
		height: 100rpx;

		.drop-list-ele {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			line-height: 100rpx;
			color: rgba(16, 16, 16, 100);
			font-size: 12px;
			font-family: SourceHanSansSC-bold;
		}

		.triangle {
			width: 0;
			height: 0;
			border-left: 10rpx solid transparent;
			border-right: 10rpx solid transparent;
			border-top: 10rpx solid #000;
			margin-left: 10rpx;
		}
	}

	.drop-data {
		box-sizing: border-box;
		background-color: #fff;
		border-radius: 20rpx;

		.drop-item {
			height: 80rpx;
			padding-left: 40rpx;
			line-height: 80rpx;
			border-bottom: 1rpx solid;
		}
	}

	.mian {
		background-color: #fff;

		.goods-list {
			display: flex;
			flex-direction: column;

			.goods-item {
				display: flex;
				height: 248rpx;

				.data-left {
					flex: 1;
					display: flex;

					.img {
						width: 170rpx;
						height: 170rpx;
						margin: auto;
						display: block;
					}
				}

				.data-main {
					width: 179px;
					height: 170rpx;
					margin: auto;
					display: flex;
					flex-direction: column;
					justify-content: space-between;

					.main-title {
						width: 242rpx;
						height: 50rpx;
						line-height: 50rpx;
						color: rgba(16, 16, 16, 100);
						font-size: 36rpx;
					}

					.main-score {
						height: 34rpx;
						line-height: 34rpx;
						color: rgba(110, 110, 110, 100);
						font-size: 24rpx;
					}

					.main-info {
						width: 358rpx;
						height: 68rpx;
						line-height: 34rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						overflow: hidden;
						color: rgba(110, 110, 110, 100);
						font-size: 24rpx;
						font-weight: 700;
					}
				}

				.data-right {
					flex: 1;
					line-height: 248rpx;
					color: rgba(21, 21, 21, 100);
					margin-right: 26rpx;
					font-size: 28rpx;
					text-align: right;

					.isclick {}
				}
			}
		}

		.dataNull {
			height: 50rpx;
			line-height: 50rpx;
			text-align: center;
		}

	}
</style>
