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

let g;
let timer;
const GRID_ROWS = 6;
const GRID_COLUMNS = 5;

/**
 * Array of opened tiles, which are still in play.
 */
let openedTiles = [];

function startGame() {
	timer.reset();
	const pairsNeeded = g.getCellCount() / 2;
	if (EMOJIS.length < pairsNeeded) {
		console.error("Not enough emojis in " + EMOJIS);
		return;
	}
	generatePairs(pairsNeeded);

	g.forEnumeratedTiles((i, j, tile) => {
		tile.onclick = (e) => {
			console.log("Clicked on ", i, j, tile);
			openTile(tile);
			checkWinningCondition(i, j);
		};
	});
}

const EMOJIS = [
	"ℹ️", "✅️", "💟", "📅", "🔷",
	"🥶", "🥵", "🌞",
	"🍳", "🥗",
	"🎄", "🩻", "🛟", "📌",
	"⚛️", "🪐", "🚄", "🎋",
	"🫂", "🏹",
	"😻", "🦄", "🪁", "🍬", "🦔", "🚴", "🧗", "🐨", "🌚",
];
const EMOJIS_SQUARES = [ "⬛", "⬜", "🟥", "🟦", "🟧", "🟨", "🟩", "🟪", "🟫" ];
const EMOJIS_PARTY = [ "🥳", "🎊", "🎆", "🎉", "🌼" ];

function doubled(originalArray) {
	return [...originalArray, ...originalArray];
}

function replaceCard(tile, emoji, squareEmoji) {
	hideTile(tile);
	const front = document.createElement('div');
	const frontEmoji = document.createElement('div');
	frontEmoji.classList.add('frontEmoji');
	frontEmoji.append(emoji);

	if (emoji == "🌚") {
		const helper = document.createElement('div');
		helper.classList.add('moonDogHelper');
		frontEmoji.style = "position:relative;";
		frontEmoji.append(helper);
	}

	const frontBackground = document.createElement('div');
	frontBackground.classList.add('frontBackground');
	frontBackground.append(squareEmoji);
	front.classList.add('front');
	const back = document.createElement('div');
	back.classList.add('back');
	back.append(squareEmoji);
	front.append(frontEmoji, frontBackground);
	tile.replaceChildren(front, back);
}

function generatePairs(pairsNeeded) {
	let shuffledEmojis;
	if (!DEBUG) {
		shuffle(EMOJIS);
	}
	const emojisToUse = EMOJIS.slice(0, pairsNeeded);
	console.log("Using emojis: ", emojisToUse);
	if (DEBUG) {
		shuffledEmojis = doubled(emojisToUse);
	} else {
		shuffledEmojis = shuffled(doubled(emojisToUse));
	}
	console.log("Shuffled: ", shuffledEmojis);
	let i = 0;
	g.forAllTiles(tile => {
		tile.dataset.type = emojiIndexToCssClass(i);
		tile.dataset.emoji = shuffledEmojis[i];
		tile.dataset.hidden = true;
		i++;
	});
	const squareEmoji = randomInArray(EMOJIS_SQUARES);
	g.forAllTiles(tile => {
		const emojiIndex = getNumberFromTile(tile);
		const emoji = shuffledEmojis[emojiIndex];
		replaceCard(tile, emoji, squareEmoji);
	});
}

function openTile(tile) {
	if (!isHidden(tile) || openedTiles.includes(tile)) {
		return;
	}
	if (!timer.isGoing()) {
		timer.start();
	}
	tile.dataset.hidden = false;
	openedTiles.push(tile);
	if (openedTiles.length > 2) {
		while (openedTiles.length > 2) {
			extraOpenedTile = openedTiles[0];
			console.log("Too many opened tiles:", extraOpenedTile);
			hideTile(extraOpenedTile);
		}
	}
	tile.classList.add('frontUp');
	if (openedTiles.length == 2) {
		if (openedTiles[0].dataset.emoji == openedTiles[1].dataset.emoji) {
			const type = openedTiles[0].dataset.type;
			const emoji = openedTiles[0].dataset.emoji;
			console.log('Guessed a pair:', type, "Emoji:", emoji);
			// the second tile in the array hasn't gotten the timeout yet
			clearTimeout(openedTiles[0].dataset.timeoutId);
			// these two tiles are no longer in play => clear the array
			openedTiles = [];
			return;
		}
	}
	const timeoutId = setTimeout(() => {
		console.log("Opened for too long, hiding:", tile);
		hideTile(tile)
	}, 2000);
	tile.dataset.timeoutId = timeoutId;
}

function hideTile(tile) {
	tile.classList.remove('frontUp');
	const foundIndex = openedTiles.indexOf(tile);
	if (foundIndex > -1) {
		openedTiles.splice(foundIndex, 1);
	}
	tile.dataset.hidden = true;
	clearTimeout(tile.dataset.timeoutId);
	delete tile.dataset.timeoutId;
}

function isHidden(tile) {
	return tile.dataset.hidden == "true";
}

function countHidden() {
	let count = 0;
	g.forAllTiles(tile => {
		if (isHidden(tile)) {
			count++;
		}
	});
	return count;
}

function disableClicks(tile) {
	tile.oncontextmenu = () => {};
	tile.onclick = () => {};
}

function emojiIndexToCssClass(n) {
	return "number" + n;
}

function getNumberFromTile(tile) {
	return parseInt(tile.dataset.type.slice(6));
}

function flipDownEmojiFlipUp(emoji, tile, upDelay) {
	tile.classList.remove('frontUp');
	setTimeout(() => {
		tile.querySelector('.frontEmoji').replaceChildren(document.createTextNode(emoji));
	}, 200);
	setTimeout(() => {
		tile.classList.add('frontUp');
	}, 200 + upDelay);
}

function secondDistance(ignored1, ignored2, i2, j2) {
	return i2 + j2;
}
function manhattanDistance(i1, j1, i2, j2) {
	return Math.abs(i1 - i2) + Math.abs(j1 - j2);
}
function squareCircleDistance(i1, j1, i2, j2) {
	const horizontal = Math.abs(i1 - i2);
	const vertical = Math.abs(j1 - j2);
	return Math.max(horizontal, vertical);
}
function crossDistance(i1, j1, i2, j2) {
	const horizontal = Math.abs(i1 - i2);
	const vertical = Math.abs(j1 - j2);
	return Math.min(horizontal, vertical);
}

function emojiFlipAnimationByTile(emoji, multiplier, tileFn) {
	let animationMultiplier = 200 * multiplier;
	if (DEBUG) {
		animationMultiplier = 1000 * multiplier;
	}
	g.forEnumeratedTiles((i, j, tile) => {
		disableClicks(tile);
		setTimeout(() => {
			flipDownEmojiFlipUp(emoji, tile, 300);
		}, tileFn(i, j) * animationMultiplier + 500);
	});
}

function winAnimationByWinDistance(winI, winJ, winDistanceFn, multiplier) {
	const partyEmoji = randomInArray(EMOJIS_PARTY);
	emojiFlipAnimationByTile(partyEmoji, multiplier, (i, j) => {
		return winDistanceFn(winI, winJ, i, j);
	});
}

const WIN_ANIMATIONS = [
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, secondDistance, 1);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, manhattanDistance, 1.2);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, squareCircleDistance, 2);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, crossDistance, 2.5);
	},

	/*
	 * Spiral animation.
	 *
	 * Image https://i.stack.imgur.com/LTTO7.png was used to construct the formulas.
	 * The image comes from https://math.stackexchange.com/a/3162022/102687
	 *
	 * See also https://oeis.org/A174344
	 */
	function (winI, winJ) {
		const partyEmoji = randomInArray(EMOJIS_PARTY);
		let animationMultiplier = 50;
		const size = g.getCellCount();
		g.forEnumeratedTiles((i, j, tile) => {
			let n;
			disableClicks(tile);
			const layer = squareCircleDistance(winI, winJ, i, j);
			const previousNumber = 4 * (layer - 1) * layer;
			if (layer == 0) {
				// winI, winJ
				n = 0;
			} else if ((j - winJ) == layer && (i - winI) != layer) {
				// 49 -> 56
				n = previousNumber + layer     + (winI - i);
			} else if ((i - winI) == -layer) {
				// 56 -> 64
				n = previousNumber + 3 * layer + (winJ - j);
			} else if ((j - winJ) == -layer) {
				// 64 -> 72
				n = previousNumber + 5 * layer + (i - winI);
			} else if ((i - winI) == layer) {
				// 72 -> 80
				n = previousNumber + 7 * layer + (j - winJ);
			} else {
				console.error("Cannot find n for", i, j, tile);
				n = 50;
			}
			if (n > size * 1.5) {
				// cap the spiral, don't wait for the far away layers
				n = size * 1.5;
			}
			if (false) {
				const debug = document.createElement('span');
				debug.append('' + n);
				debug.style = `position:absolute; z-index:100; left:10px; top:10px; font-size:30%;`;
				tile.append(debug);
			}
			setTimeout(() => {
				flipDownEmojiFlipUp(partyEmoji, tile, 500);
			}, (Math.pow(n, 0.9) * animationMultiplier) + 100);
		});
	},
];

function winGame(i, j) {
	timer.stop();
	console.log("Won.");
	let winAnimation = randomInArray(WIN_ANIMATIONS);
	winAnimation(i, j);
	console.log("Refresh for next game");
}

function loseGame() {
	console.log("Lost");
	const lostEmoji = randomInArray(["🫤", "😵"]);
	emojiFlipAnimationByTile(lostEmoji, 1, (i, j) => i + j);
}

function checkWinningCondition(i, j) {
	const stillHidden = countHidden();
	if (stillHidden == 0) {
		winGame(i, j);
	}
}

function addSolver() {
	const animationMultiplier = 120;
	const controlsContainer = document.getElementById('controls');
	const solveButton = document.createElement('button');
	solveButton.innerText = "▶️";
	solveButton.onclick = () => {
		let count = 0;
		g.forEnumeratedTiles((i, j, tile) => {
			if (!isHidden(tile)) {
				return;
			}
			count++;
			const emoji = tile.dataset.emoji;
			for (let r = i; r < g.getRowCount(); r++) {
				for (let c = 0; c < g.getColumnCount(); c++) {
					if (r == i && c == j) {
						continue;
					}
					g.forTile(r, c, candidateTile => {
						if (emoji == candidateTile.dataset.emoji) {
							setTimeout(() => {
								openTile(tile);
							}, count * animationMultiplier);
							setTimeout(() => {
								openTile(candidateTile);
							}, count * animationMultiplier + animationMultiplier / 10);
						}
					});
				}
			}
		});
		setTimeout(() => {
			const i = randomZeroTo(g.getRowCount());
			const j = randomZeroTo(g.getColumnCount());
			checkWinningCondition(i, j);
		}, count * animationMultiplier + 200);
	};
	controlsContainer.append(solveButton);
}

document.addEventListener('DOMContentLoaded', function () {
	const table = document.getElementById('gridContainer');
	if (!DEBUG) {
		g = new Grid(GRID_ROWS, GRID_COLUMNS, table);
	} else {
		g = new Grid(3, 2, table);
	}
	if (false) {
		addSolver();
	}
	let gameDuration;
	if (DEBUG) {
		gameDuration = 10000;
	} else {
		gameDuration = 90000;
	}
	timer = new Timer(gameDuration, () => {
		loseGame();
	});
	startGame();
});
