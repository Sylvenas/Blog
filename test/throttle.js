/* eslint-disable */

/**
 * 假设电梯运送人员，如果第一个人A进来，则等待10秒准时关闭电梯，开始上升
 * 中间10秒可以继续进来人，但是不会重新计时，到点之后准时关闭上升
 * 如果一直没有人进来，则待机
 * throttle可以保证在一定时间内至少执行一次
 * 
 * 使用场景：
 * 浏览器滚动条滚动：通过throttle来减少scroll事件的触发频率，限制在一定的时间内只能触发一次
 */

const throttle = (fun, delay) => {

	let timerId = null;

	return function () {
		const context = this;
		const args = arguments;

		if (!timerId) {
			fun.apply(context, args);

			timerId = setTimeout(() =>
				timerId = null, delay)
		}
	}
}