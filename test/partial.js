/* eslint-disable */

const Log = console.log;

const partial = (fn, ...presetArgs) => {
	const placeholder = '_';

	const bound = function () {

		let position = 0;
		const length = presetArgs.length;
		const args = Array(length);

		for (let i = 0; i < length; i++) {
			args[i] = presetArgs[i] === placeholder ?
				arguments[position++] : presetArgs[i]
		}

		while (position < arguments.length) {
			args.push(arguments[position++])
		}

		return fn.apply(this, args)
	};

	return bound;
}


String.prototype.first = partial(String.prototype.substring, 0, '_');

String.prototype.last = partial(String.prototype.slice, '_');

String.prototype.asName = partial(String.prototype.replace, /(\w+)\s(\w+)/, '$2, $1')

Array.prototype.compute = partial(Array.prototype.map)


Log('abcdef'.first(3).last(-1));

Log('zhao tao'.asName());

Log([1, 2].compute(x => x * 3))
