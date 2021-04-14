import Request from './request'
import apiList from './shopro'
import store from '@/common/store/index.js'

export default function api(url, data = {}) {
	const request = new Request();
	// 过滤url	
	let api = getApiObj(url);
	/* 请求之前拦截器 */
	request.interceptor.request((config, cancel) => {
		//如果api.auth === false
		if (api.auth) {
			// 获取token
			let token = uni.getStorageSync('token');
			// 判断有没有token,没有登入
			if (!token) {
				store.commit('LOGIN_TIP', true)
				store.commit('OUT_LOGIN');
				throw('暂未登录,已阻止此次API请求~');
			}
		}
		// 如果有token 添加token 并发送请求
		if (uni.getStorageSync('token')) {
			config.header.token = uni.getStorageSync('token');
		}
		return config
	});

	request.interceptor.response((response) => { /* 请求之后拦截器 */
		if (response.data.code === 0) { // 服务端返回的状态码不等于200，则reject()
			uni.showToast({
				title: response.data.msg || '请求出错,稍后重试',
				icon: 'none',
				duration: 1000,
				mask: true
			});
		}

		if (response.data.code === 401) { // 服务端返回的状态码不等于200，则reject()
			uni.removeStorageSync('token');
			store.commit('LOGIN_TIP', true)
		}
		// if (response.config.custom.verification) { // 演示自定义参数的作用
		//   return response.data
		// }
		return response
	}, (response) => { // 预留可以日志上报
		return response
	})

	return request.request({
		url: api.url,
		data,
		method: api.method
	})

}

// 过滤
function getApiObj(url) {;
	let apiArray = url.split(".");
	let api = apiList;
	apiArray.forEach(v => {
		api = api[v];
	});
	return api;
}
