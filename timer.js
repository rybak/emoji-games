/*
 * Copyright (C) 2023 Andrei Rybak
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class Timer {
	static #INTERVAL_LENGTH = 1000;
	static #HOURGLASS_ID = 'timerHourglass';
	static #HOURGLASS_DONE = "⌛";
	static #HOURGLASS_GOING = "⏳";

	#startingMilliseconds;
	#milliseconds;
	#intervalId;
	#numberRenderer;
	#timerEndFn;
	#hourglassElement;

	constructor(startingMilliseconds, timerEndFn) {
		this.#startingMilliseconds = startingMilliseconds;
		this.#timerEndFn = timerEndFn;
		const container = document.getElementById('timerContainer');
		this.#hourglassElement = document.createElement('span');
		this.#hourglassElement.id = Timer.#HOURGLASS_ID;
		this.#hourglassElement.style = 'display:inline-block; margin-right:1rem;';
		const counterElement = document.createElement('span');
		container.replaceChildren(this.#hourglassElement, counterElement);
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
		this.#hourglassElement.innerText = Timer.#HOURGLASS_GOING;
		this.#hourglassElement.classList.add('animatedHourglass');
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
		this.#resetHourglass();
	}

	reset() {
		this.stop();
		this.#milliseconds = this.#startingMilliseconds;
		this.#updateRendering();
	}

	#resetHourglass() {
		this.#hourglassElement.classList.remove('animatedHourglass');
		this.#hourglassElement.innerText = Timer.#HOURGLASS_DONE;
	}

	#updateRendering() {
		this.#numberRenderer.render(this.#milliseconds / 1000);
	}

	getHourglassElement() {
		return this.#hourglassElement;
	}
}
