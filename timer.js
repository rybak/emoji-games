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
			// this.#numberRenderer.renderScaryZero();
			this.#timerEndFn();
		}
	}

	stop() {
		clearInterval(this.#intervalId);
		this.#intervalId = null;
	}

	reset() {
		this.stop();
		this.#milliseconds = this.#startingMilliseconds;
		this.#updateRendering();
	}

	#updateRendering() {
		this.#numberRenderer.render(this.#milliseconds / 1000);
	}
}
