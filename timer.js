class Timer {
	static #INTERVAL_LENGTH = 1000;

	#startingMilliseconds;
	#milliseconds;
	#intervalId;
	#numberRenderer;
	#timerEndFn;

	constructor(startingMilliseconds, timerEndFn) {
		this.#startingMilliseconds = startingMilliseconds;
		this.#timerEndFn = timerEndFn;
		const container = document.getElementById('timerContainer');
		const counterElement = document.createElement('span');
		container.replaceChildren(counterElement);
		this.#numberRenderer = new NumberRenderer(counterElement, startingMilliseconds / 1000);
		this.reset();
	}

	isGoing() {
		return this.#intervalId != null;
	}

	start() {
		if (this.isGoing()) {
			return;
		}
		this.#milliseconds = this.#startingMilliseconds;
		this.#intervalId = setInterval(() => this.#decrement(), Timer.#INTERVAL_LENGTH);
	}

	#decrement() {
		this.#milliseconds -= Timer.#INTERVAL_LENGTH;
		this.#updateRendering();
		if (this.#milliseconds <= 0) {
			this.stop();
			/*
			 * Doesn't work well, because 🅾️ has different width to key-cap emojis
			 */
			// this.#numberRenderer.renderScaryZero();
			this.#timerEndFn();
		}
	}

	stop() {
		clearInterval(this.#intervalId);
		this.#intervalId = null;
	}

	reset() {
		this.#milliseconds = this.#startingMilliseconds;
		this.#updateRendering();
	}

	#updateRendering() {
		this.#numberRenderer.render(this.#milliseconds / 1000);
	}
}

class NumberRenderer {
	static #EMOJI_DIGITS = [
		"0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣",
	];
	static #SCARY_ZERO = "🅾️";

	#max;
	#targetElement;
	#width;

	constructor(targetElement, max) {
		if (max < 0) {
			throw new Error("Negative numbers are not supported: max=" + max);
		}
		this.#targetElement = targetElement;
		this.#width = Math.floor(Math.log10(max)) + 1;
		this.#max = max;
	}

	render(number) {
		if (number > this.#max) {
			console.warn(`Got number greater than max: number=${number} max=${max}`);
		}
		const digits = Array.from(String(number), Number);
		while (digits.length < this.#width) {
			digits.unshift(0);
		}
		let s = "";
		for (const digit of digits) {
			s += NumberRenderer.#EMOJI_DIGITS[digit];
		}
		this.#replaceText(s);
	}

	renderScaryZero() {
		const s = NumberRenderer.#SCARY_ZERO.repeat(this.#width);
		this.#replaceText(s);
	}

	#replaceText(s) {
		this.#targetElement.replaceChildren(document.createTextNode(s));
	}
}
