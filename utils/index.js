//16进制字符串转2进制
export function String2Ab(str) {
	str = str.toUpperCase()
	var pos = 0;
	var len = str.length;
	if (len % 2 != 0) {
		return null;
		console.error('命令长度异常')
	}
	len /= 2;
	let buffer = new ArrayBuffer(len)
	let dataView = new DataView(buffer)
	for (let i = 0; i < len; i++) {
		let s = str.substr(pos, 2);
		dataView.setUint8(i, parseInt(s, 16))
		pos += 2;
	}
	console.log('下发的数据：', str.toUpperCase())
	return buffer;
}
//二进制转16进制字符串
export function Ab2String(arr) {
	let view = new DataView(arr);
	let str = "";
	for (let i = 0; i < arr.byteLength; i++) {
		let tmp = view.getUint8(i).toString(16);
		if (tmp.length == 1) {
			tmp = "0" + tmp;
		}
		str += tmp;
	}
	console.log('响应的数据为：', str.toUpperCase())

	return str.toUpperCase();
}
