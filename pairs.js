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
const DEBUG_SHUFFLING = false;

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

	refreshEmoji();
	g.forEnumeratedTiles((i, j, tile) => {
		tile.onclick = (e) => {
			console.log("Clicked on ", i, j, tile);
			openTile(tile);
			checkWinningCondition(pairsNeeded);
			refreshEmoji();
		};
	});
	if (DEBUG_SHUFFLING) {
		g.forAllTiles(tile => {
			tile.dataset.hidden = false;
		});
		refreshEmoji();
	}
}

const EMOJIS = [
	"ℹ️", "✅️", "💟", "📅", "🔷",
	"🥶", "🥵", "🌞",
	"🍳", "🥗",
	"🎄", "🩻", "🛟", "📌",
	"⚛️", "🪐", "🚄", "🎋",
	"🫂", "🏹",
	"😻", "🦄", "🪁", "🍬", "🦔", "🚴", "🧗", "🐨",
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

function generateRandomEmojiStyle(emojis, className) {
	const emoji = randomInArray(emojis);
	return `.gridItem .${className}::after {
		content: "${emoji}";
	}`;
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
	let style = '';
	g.forAllTiles(tile => {
		const cssClassName = tile.dataset.type;
		const emojiIndex = getNumberFromTile(tile);
		const emoji = shuffledEmojis[emojiIndex];
		style += `.gridItem .${cssClassName}::after {
			content: "${emoji}";
		}`;
	});
	style += generateRandomEmojiStyle(EMOJIS_SQUARES, "hidden");
	style += generateRandomEmojiStyle(EMOJIS_PARTY, "party");
	const styleSheet = getStyleSheet(EMOJI_STYLESHEET_ID);
	styleSheet.innerText = style;
}

function openTile(tile) {
	console.debug("Opened before:", openedTiles);
	if (!isHidden(tile) || openedTiles.includes(tile)) {
		return;
	}
	tile.dataset.hidden = false;
	openedTiles.push(tile);
	console.debug("Opened after:", openedTiles);
	if (openedTiles.length > 2) {
		while (openedTiles.length > 2) {
			extraOpenedTile = openedTiles[0];
			console.log("Too many opened tiles:", extraOpenedTile);
			hideTile(extraOpenedTile);
		}
		refreshEmoji();
	}
	refreshEmoji();
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
		refreshEmoji();
	}, 2000);
	tile.dataset.timeoutId = timeoutId;
}

function hideTile(tile) {
	const foundIndex = openedTiles.indexOf(tile);
	if (foundIndex > -1) {
		openedTiles.splice(foundIndex, 1);
	}
	tile.dataset.hidden = true;
	clearTimeout(tile.dataset.timeoutId);
	delete tile.dataset.timeoutId;
}

function refreshEmoji() {
	g.forAllTiles(tile => {
		if (isHidden(tile)) {
			setTile(tile, "hidden");
			return;
		}
		setTile(tile, tile.dataset.type);
		return;
	});
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

function winGame() {
	console.log("Won.");
	g.forAllTiles(tile => {
		tile.dataset.type = "party";
		disableClicks(tile);
	});
	refreshEmoji();
	console.log("Refresh for next game");
}

function checkWinningCondition() {
	const stillHidden = countHidden();
	if (stillHidden == 0) {
		winGame();
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
