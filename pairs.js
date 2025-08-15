/*
 * Copyright (C) 2023-2024 Andrei Rybak
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
let secretClickCount = 0;

function startGame() {
	timer.reset();
	secretClickCount = 0;
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

function createEmojiHolder(className, emoji) {
	const res = document.createElement('span');
	res.classList.add(className);
	res.replaceChildren(document.createTextNode(emoji));
	return res;
}

function createCard(emojis) {
	const card = document.createElement('div');
	card.classList.add('card');
	if (emojis.length >= 1) {
		card.append(createEmojiHolder('backgroundEmojiHolder', emojis[0]));
	}
	if (emojis.length >= 2) {
		card.append(createEmojiHolder('regularEmojiHolder', emojis[1]));
	}
	if (emojis.length >= 3) {
		card.append(createEmojiHolder('overlayEmojiHolder', emojis[2]));
	}
	return card;
}

function replaceCard(tile, emoji, squareEmoji) {
	hideTile(tile);
	const front = document.createElement('div');
	front.classList.add('front');
	/* front face has two or three emoji glyphs */
	const frontEmojis = [squareEmoji, emoji];
	if (emoji == "🌚") {
		frontEmojis.push("🐶");
	}
	front.replaceChildren(createCard(frontEmojis));
	const back = document.createElement('div');
	back.classList.add('back');
	/* back face has only one emoji glyph */
	back.replaceChildren(createCard([squareEmoji]));
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
		const card = tile.querySelector('.front .card');
		card.children[1].replaceChildren(document.createTextNode(emoji));
		if (card.children.length >= 3) {
			// get rid of text inside .overlayEmojiHolder
			card.children[2].replaceChildren();
		}
	}, 200);
	setTimeout(() => {
		tile.classList.add('frontUp');
	}, 200 + upDelay);
}

function dotProduct(i1, j1, i2, j2) {
	return i1 * i2 + j1 * j2;
}

function euclidDistance(i1, j1, i2, j2) {
	const a = i2 - i1;
	const b = j2 - j1;
	return Math.sqrt(a * a + b * b);
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
function verticalFirst(i1, j1, i2, j2) {
	return 0.2 * Math.abs(i1 - i2) + 3.5 * Math.abs(j1 - j2);
}
function horizontalFirst(i1, j1, i2, j2) {
	return 2.5 * Math.abs(i1 - i2) + 0.1 * Math.abs(j1 - j2);
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
// too similar to manhattanDistance, too boring
//	function (winI, winJ) {
//		winAnimationByWinDistance(winI, winJ, secondDistance, 1);
//	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, manhattanDistance, 1.2);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, squareCircleDistance, 2);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, crossDistance, 2.5);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, verticalFirst, 1.0);
	},
	function (winI, winJ) {
		winAnimationByWinDistance(winI, winJ, horizontalFirst, 1.0);
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
			}, (Math.pow(n, 0.9) * animationMultiplier) + 1000);
		});
	},

	/*
	 * Radar animation
	 */
	function (winI, winJ) {
		let farI = winI;
		let farJ = winJ;
		// special cases for edges of the grid
		if (winI == 0) {
			farJ = -100;
		} else if (winJ == GRID_COLUMNS - 1) {
			// confusing, because i-axis points down, unlike y-axis
			farI = -100;
		} else if (winJ == 0) {
			farI = 100;
		} else {
			farJ = 100;
		}
		console.log(winI, winJ);
		console.log(farI, farJ);
		const x1 = farI - winI;
		const y1 = farJ - winJ;
		const multiplier = 1.5 - euclidDistance(2, 2, winI, winJ) / 7;
		function radarDistance(i1, j1, i2, j2) {
			if (i1 == i2 && j1 == j2) {
				return 0;
			}
			const x2 = i2 - i1;
			const y2 = j2 - j1;
			const dot = dotProduct(x1, y1, x2, y2);
			const det = x1 * y2 - y1 * x2;
			const angle = Math.atan2(det, dot);
			let fakeAngle = angle + Math.PI;
			if (false) {
				console.info(i2, j2, angle, fakeAngle * 180/Math.PI);
				g.forTile(i2, j2, tile => {
					tile.title = angle + " " + fakeAngle;
				});
			}
			return fakeAngle;
		}
		winAnimationByWinDistance(winI, winJ, radarDistance, multiplier);
	}
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
			let i = randomZeroTo(g.getRowCount());
			let j = randomZeroTo(g.getColumnCount());
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
		gameDuration = 5000;
	} else {
		gameDuration = 90000;
	}
	timer = new Timer(gameDuration, () => {
		loseGame();
	});
	startGame();
	timer.getHourglassElement().onclick = () => {
		secretClickCount++;
		if (secretClickCount == 7) {
			addSolver();
		}
	};
	addFontControl("♊⏳");
});
