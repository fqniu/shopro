<template>
	<view class='main'>
		<!-- 店铺简介 -->
		<view class='head'>
			<view class='left'>
				<view class='title'>{{detailsList.name}}</view>
				<view class='info-wrapper'>
					<view class='info' v-if='detailsList.address'>
						<text :class='openTextState?"end-open":"start-open"'>
							{{detailsList.introduction ? detailsList.introduction : '没有简介' }}
						</text>
						<text class=info-open v-if='isOpen' @tap='isOpenChange'>{{isOpenText}}</text>
					</view>
				</view>
				<view class='address'>
					<text class='text-left' v-if='detailsList.address'>店铺地址:</text>
					<text class='text-right' @click="open">{{detailsList.address}}</text>
					<uni-popup ref="popup" type="center">
						<view class='slot-popup'>{{detailsList.address}}</view>
					</uni-popup>
				</view>
				<view class='phone'>
					<text class='phone-left' v-if='detailsList.phone'>联系电话:</text>
					<text class='phone-right'>{{detailsList.phone}}</text>
				</view>
				<view class='phone'>
					<text class='phone-left' v-if='detailsList.openhours'>营业时间</text>
					<text class='phone-right'>{{detailsList.openhours}}</text>
				</view>
			</view>
			<view class='right'>
				<image :src='detailsList.image_first' class='logo'></image>
			</view>
		</view>
		<!-- 地图 -->	
		<view class='map'>
			<map :scale='18' style="width: 100%;height: 300px;" :latitude="latitude" :longitude="longitude" :markers="covers"></map>
			<view class='map-view'>	
				<view class='view-left'>
					<image v-if='!isLoading' class='left-img' src='../../static/imgs/position.png'></image>
					<view class='left-content'>{{detailsList.address}}</view>
				</view>
				<view class='view-right'>
					<image v-if='!isLoading' class='right-img' src='../../static/imgs/phone.png'></image>
				</view>
			</view>
		</view>
		<!-- 分类列表 -->
		<view class='classification-list'>
			<view class='left'>
				<scroll-view class="scroll-view_H" scroll-x="true">
					<view @tap='getCSListData(item.id)' class='one-t' v-for='item in classificationList' :key='item.id'>
						{{item.name}}
					</view>
				</scroll-view>
			</view>
			<view class='right'></view>
		</view>
		<!-- 商品 -->
		<view class='gongge'>
			<view class='gongge-list'>
				<view class='list-item' v-for='item in goodsList' :key='item.id'>
					<shopro-goods-card :detail='item'></shopro-goods-card>
				</view>
			</view>
			<view v-if='!goodsList.length && !isLoading' class='empty'>
				<image :src='emptyData.img' mode='widthFix' class='img'></image>
				<text class='empty-text'>{{emptyData.tip}}</text>
			</view>
		</view>
		<!-- 动画 -->
		<shopro-load v-model="isLoading"></shopro-load>
	</view>
</template>

<script>
	import shoproLoad from '@/components/shopro-load/shopro-load.vue';
	import shoproGoodsCard from '@/components/shopro-goods-card/shopro-goods-card.vue'
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupMessage from '@/components/uni-popup/uni-popup-message.vue'
	import uniPopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	export default {
		data() {
			return {
				detailsList: {},
				isLoading: true,
				goodsList: [],
				emptyData: {
					img: '/static/imgs/empty/empty_goods.png',
					tip: '暂无该商品，还有更多好货等着你噢~'
				},
				//展开的显示和隐藏
				isOpen: false,
				//展开的文字
				isOpenText: '展开',
				//是否显示收起
				openTextState: false,
				//经纬度
				latitude:22.857379,
				longitude:113.030843,
				//商品二级分类
				classificationList: [],
				detailsId: 0,
				covers: [{
					latitude:22.857379,
					longitude:113.030843,
					iconPath: '../../static/imgs/position.png',
					width:20,
					height:20,
				}]
			}
		},
		methods: {
			open() {
				this.$refs.popup.open()
			},
			isOpenChange() {
				this.isOpenText = this.isOpenText == '收起' ? '展开' : '收起';
				this.openTextState = !this.openTextState
			},
			getDetailsList(obj) {
				let that = this;
				that.detailsList = [];
				that.isLoading = true;
				that.$api('store.storeDetails', obj).then(res => {
					//获取到商品列
					if (res.code === 1) {
						that.latitude = res.data.latitude * 1;
						that.longitude = res.data.longitude * 1;
						this.covers[0].latitude= res.data.latitude * 1;
						this.covers[0].longitude= res.data.longitude * 1;
						console.log(that.latitude,that.longitude,this.covers[0].latitude,this.covers[0].longitude)
						that.isLoading = false;
						that.detailsList = res.data;
						//判断是否显示展开
						if (that.detailsList.introduction.length > 45) {
							that.isOpen = true
						}
					}
				});
			},
			getGoodsList(obj) {
				let that = this;
				that.goodsList = [];
				that.isLoading = true;
				that.$api('goods.lists', obj).then(res => {
					//获取到商品列表
					if (res.code === 1) {
						that.isLoading = false;
						that.goodsList = res.data.data
					}
				});
			},
			//门店分类
			getClassificationList(obj) {
				let that = this;
				// that.isLoading = true;
				that.$api('store.scategory', obj).then(res => {
					//获取到商品列表
					if (res.code === 1) {
						this.classificationList = res.data
					}
				});
			},
			// 获取门店数据
			getCSListData(id) {
				this.getGoodsList({
					store_id: this.detailsId,
					scategory_id: id,
					page: 1
				})
			}
		},
		onLoad() {
			//获取店铺数据
			this.detailsId = this.$Route.query.id
			this.getDetailsList({
				store_id: this.detailsId
			})
			//获取商品列表数据
			this.getGoodsList({
				store_id: this.detailsId,
				page: 1,
			})
			//获取门店分类列表
			this.getClassificationList({
				store_id: this.detailsId
			})
		},
		components: {
			shoproLoad,
			shoproGoodsCard,
			uniPopup,
			uniPopupMessage,
			uniPopupDialog
		}
	}
</script>

<style lang='scss'>
	.main {
		background-color: #fff;

		.head {
			padding: 18rpx;
			box-sizing: border-box;
			display: flex;
			justify-content: space-between;
			font-family: PingFangSC-regular;

			.left {
				width: 512rpx;

				.title {
					margin-bottom: 16rpx;
					color: rgba(16, 16, 16, 100);
					font-size: 40rpx;
				}

				.info-wrapper {
					position: relative;

					.info {
						width: 100%;
						margin-bottom: 16rpx;
						color: rgba(110, 110, 110, 100);

						.start-open {
							display: block;
							height: 68rpx;
							font-size: 24rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
							transition: height .2s
						}

						.end-open {
							display: block;
							height: 150rpx;
							font-size: 24rpx;
							transition: height .2s
						}

						.info-open {
							position: absolute;
							bottom: 2rpx;
							right: -40rpx;
							font-size: 24rpx;
						}
					}
				}

				.address {
					display: flex;
					height: 34rpx;
					margin-bottom: 16rpx;
					color: rgba(110, 110, 110, 100);
					font-size: 24rpx;

					.text-left {
						width: 105rpx;
						color: rgba(110, 110, 110, 100);
					}

					.text-right {
						flex: 1;
						text-align: left;
						color: rgba(16, 16, 16, 100);
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.slot-popup {
						height: 200rpx;
						width: 300rpx;
						padding: 20rpx;
						box-sizing: border-box;
						display: flex;
						align-items: center;
						background-color: #fff;
						border-radius: 10rpx;
						color: #000;
					}
				}

				.phone {
					height: 34rpx;
					color: rgba(110, 110, 110, 100);
					font-size: 24rpx;

					.phone-left {
						color: rgba(110, 110, 110, 100);
					}

					.phone-right {
						color: rgba(16, 16, 16, 100);
					}
				}
			}

			.right {
				.logo {
					width: 126rpx;
					height: 126rpx;
				}
			}
		}

		.gongge {
			width: 100%;
			padding: 18rpx;
			position: relative;

			.gongge-title {
				position: relative;
				margin-bottom: 20rpx;
				color: rgba(16, 16, 16, 100);
				font-size: 36rpx;

				&::before {
					content: '';
					position: absolute;
					width: 70rpx;
					height: 10rpx;
					left: 0;
					bottom: -6rpx;
					background-color: rgba(234, 39, 20, 100);
					border-radius: 2px;
				}
			}

			.gongge-list {
				display: flex;
				height: 1046rpx;
				flex-wrap: wrap;
				justify-content: space-between;
				overflow-y: scroll;
				font-family: PingFangSC-bold;

				&::-webkit-scrollbar {
					width: 0;
				}

				.list-item {
					width: 50%;
				}
			}

			.empty {
				width: 600rpx;
				height: 500rpx;
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				margin: auto;

				.empty-text {
					display: block;
					width: 510rpx;
					margin: 0 auto;
				}
			}
		}

		.map {
			padding: 0 18rpx 0 18rpx;
			box-sizing: border-box;

			.map-view {
				height: 100rpx;
				width: 100%;
				display: flex;
				margin: 10rpx 0 10rpx 0;

				.view-left {
					width: 80%;
					display: flex;
					align-items: center;

					.left-img {
						width: 50rpx;
						height: 50rpx;
						margin: 0 auto;
					}

					.left-content {
						flex: 1;
						margin-left: 20rpx;
						font-size: 25rpx;
					}
				}

				.view-right {
					flex: 1;
					display: flex;
					align-items: center;

					.right-img {
						width: 50rpx;
						height: 50rpx;
						margin: 0 auto;
					}
				}
			}
		}

		.classification-list {
			width: 100%;
			padding: 0 18rpx 0 18rpx;
			box-sizing: border-box;

			.left {
				width: 100%;

				.scroll-view_H {
					white-space: nowrap;
					width: 100%;

					view {
						display: inline-block;
						width: 200rpx;
						height: 60rpx;
						line-height: 60rpx;
						font-size: 25rpx;
						text-align: center;
						background-color: #fff;
						box-shadow: 0px 0px 2px #888888;
						margin-right: 10rpx;
						border-radius: 10rpx;
					}
				}
			}
		}
	}
</style>
