/* eslint-disable */

/**
 * 假设电梯运送人员，如果电梯有人A进来，则等待10秒关闭电梯，开始上升；
 * 但是如果再在10秒之内又有B进入电梯，则需要从新计时10秒，
 * 有人C、D、E等等不断进来，则需继续等待，直到10秒内没有人进来，则电梯开始上升
 * 
 * 使用场景：
 * 用户输入智能搜索方面：只有在用户停止输入之后一段时间，才开始发送ajax，进行查询，避免发送海量的无效查询
 * 浏览器窗口resize事件：当浏览器不断的resize之后，只在停顿较长时间之后(认为用户已经完成了浏览器大小的调整)，触发回调函数进行逻辑处理
 */

/**
 * debounce tool function
 * @param {Function} fun 需要防抖debounce的函数
 * @param {Number} delay 延迟的时间
 */

const debounce = (fun, delay) => {

	let timerId = null;

	return function () {
		const context = this;
		const args = arguments;

		clearTimeout(timerId);

		timerId = setTimeout(() =>
			fun.apply(context, args), delay)
	}
}

const Log = console.log;

const debouncedResize = debounce((e) => Log('resize', e), 1500)

window.onresize = debouncedResize