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
const GRID_ROWS = 6;
const GRID_COLUMNS = 5;
const EMOJI_STYLESHEET_ID = 'theEmojiStylesheet';

/**
 * Array of opened tiles, which are still in play.
 */
let openedTiles = [];

function startGame() {
	const pairsNeeded = g.getRowCount() * g.getColumnCount() / 2;
	if (EMOJIS.length < pairsNeeded) {
		console.error("Not enough emojis in " + EMOJIS);
		return;
	}
	generatePairs(pairsNeeded);

	g.forEnumeratedTiles((i, j, tile) => {
		tile.onclick = (e) => {
			console.log("Clicked on ", i, j, tile);
			openTile(tile);
			checkWinningCondition(i, j, tile);
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
const EMOJIS_PARTY = [ "🥳", "🎊", "🎆", "🎉" ];

function doubled(originalArray) {
	return [...originalArray, ...originalArray];
}

function shuffled(originalArray) {
	const a = [...originalArray];
	shuffle(a);
	return a;
}
function shuffle(a) {
	let i = a.length;
	let r;
	while (i > 0) {
		r = Math.floor(Math.random() * i);
		i--;
		[a[i], a[r]] = [a[r], a[i]];
	}
}

function randomInArray(a) {
	return a[Math.floor(Math.random() * a.length)];
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

function flipDownPartyFlipUp(partyEmoji, tile) {
	tile.classList.remove('frontUp');
	setTimeout(() => {
		tile.querySelector('.frontEmoji').replaceChildren(document.createTextNode(partyEmoji));
	}, 200);
	setTimeout(() => {
		tile.classList.add('frontUp');
	}, 500);
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
	return 2 * Math.max(horizontal, vertical);
}

function winAnimationByWinDistance(winI, winJ, winDistanceFn) {
	const partyEmoji = randomInArray(EMOJIS_PARTY);
	let animationMultiplier = 200;
	if (DEBUG) {
		animationMultiplier = 1000;
	}
	g.forEnumeratedTiles((i, j, tile) => {
		disableClicks(tile);
		setTimeout(() => {
			flipDownPartyFlipUp(partyEmoji, tile);
		}, winDistanceFn(winI, winJ, i, j) * animationMultiplier + 500);
	});
}

const WIN_ANIMATIONS = [
	function (winI, winJ, winTile) {
		winAnimationByWinDistance(winI, winJ, secondDistance);
	},
	function (winI, winJ, winTile) {
		winAnimationByWinDistance(winI, winJ, manhattanDistance);
	},
	function (winI, winJ, winTile) {
		winAnimationByWinDistance(winI, winJ, squareCircleDistance);
	},
];

function winGame(i, j, tile) {
	console.log("Won.");
	let winAnimation = randomInArray(WIN_ANIMATIONS);
	winAnimation(i, j, tile);
	console.log("Refresh for next game");
}

function checkWinningCondition(i, j, tile) {
	const stillHidden = countHidden();
	if (stillHidden == 0) {
		winGame(i, j, tile);
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const table = document.getElementById('gridContainer');
	if (!DEBUG) {
		g = new Grid(GRID_ROWS, GRID_COLUMNS, table);
	} else {
		g = new Grid(3, 2, table);
	}
	startGame();
});
