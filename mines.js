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

const GRID_COLUMNS = 10;
const GRID_ROWS = 10;
let g;
let mineCounterRenrerer;

const EASY_DIFFICULTY = [10, 9, 9]; // 10 mines on 9x9 grid -- MS Minesweeper and minesweeper.online
const NORMAL_DIFFICULTY = [40, 16, 16];
const HARD_DIFFICULTY = [99, 16, 30];

function startGame(difficulty) {
	const table = document.getElementById('gridContainer');
	const mineCount = difficulty[0];
	const rowsCount = difficulty[1];
	const columnCount = difficulty[2];
	g = new Grid(rowsCount, columnCount, table);
	mineCounterRenrerer = new NumberRenderer(document.getElementById('mineCounter'), HARD_DIFFICULTY[0]);
	mineCounterRenrerer.render(mineCount);
	generateMines(mineCount);
	console.log("Starting with " + mineCount + " mines.");

	refreshEmoji();
	g.forEnumeratedTiles((i, j, tile) => {
		tile.oncontextmenu = (e) => {
			e.preventDefault();
			flipFlag(tile, mineCount);
			openNeighborsAroundNumber(i, j, tile, mineCount);
			checkWinningCondition(mineCount);
			refreshEmoji();
			return;
		};
		tile.onclick = (e) => {
			openTile(i, j, tile, mineCount);
			checkWinningCondition(mineCount);
			refreshEmoji();
		};
	});
}

function generateMines(mineCount) {
	const size = g.getCellCount();
	const a = new Array(size).fill(false);
	for (let i = 0; i < mineCount; i++) {
		a[i] = true;
	}
	shuffle(a);
	let i = 0;
	g.forAllTiles(tile => {
		tile.dataset.type = "unopened";
		tile.dataset.hidden = true;
		delete tile.dataset.flagged;
		if (a[i]) {
			tile.dataset.type = "mine";
		}
		i++;
	});
}

function updateTileNumber(i, j, tile) {
	if (isMine(tile)) {
		return NaN;
	}
	const count = countNeighborMines(i, j);
	tile.dataset.type = mineNumberToCssClass(count);
	return count;
}

function openTile(i, j, tile, mineCount) {
	tile.dataset.hidden = false;
	delete tile.dataset.flagged;
	if (isMine(tile)) {
		loseGame(tile);
		return;
	}
	if (tile.dataset.type == "dead") {
		return;
	}
	const count = updateTileNumber(i, j, tile);
	if (count == 0) {
		propagateEmpty(i, j);
	}
}

function refreshEmoji() {
	g.forAllTiles(tile => {
		if (isExploded(tile)) {
			setTile(tile, "exploded");
			return;
		}
		if (isHidden(tile) && isFlagged(tile)) {
			setTile(tile, "flag")
			return;
		}
		if (isHidden(tile)) {
			setTile(tile, "hidden");
			if (DEBUG && isMine(tile)) {
				setTile(tile, "debugMine");
			}
			return;
		}
		setTile(tile, tile.dataset.type);
	});
}

function isExploded(tile) {
	return tile.dataset.type == "exploded";
}

function isMine(tile) {
	return tile.dataset.type == "mine" || tile.dataset.type == "exploded";
}

function isHidden(tile) {
	return tile.dataset.hidden == "true";
}

function countHidden() {
	return countTilesPredicate(isHidden);
}

function isFlagged(tile) {
	return tile.dataset.flagged;
}

function countFlaggedMines() {
	return countTilesPredicate(tile => isMine(tile) && isFlagged(tile));
}

function countFlaggedTiles() {
	return countTilesPredicate(isFlagged);
}

function countTilesPredicate(predicate) {
	let count = 0;
	g.forAllTiles(tile => {
		if (predicate(tile)) {
			count++;
		}
	});
	return count;
}

function flipFlag(tile, mineCount) {
	if (!isHidden(tile)) {
		// don't do anything with uncovered number or empty tile
		return;
	}
	if (isFlagged(tile)) {
		delete tile.dataset.flagged;
	} else {
		tile.dataset.flagged = true;
	}
	const unflaggedMineCount = mineCount - countFlaggedTiles();
	if (unflaggedMineCount >= 0) {
		mineCounterRenrerer.render(unflaggedMineCount);
	} else {
		mineCounterRenrerer.renderScaryZero();
	}
}

function openNeighborsAroundNumber(i, j, tile, mineCount) {
	if (isHidden(tile)) {
		return;
	}
	const numberOnTile = getNumberFromTile(tile);
	console.log("numberOnTile = ", numberOnTile);
	if (numberOnTile == 0) {
		return;
	}
	let flagCountAround = 0;
	g.forAllNeighbors(i, j, (r, c, neighbor) => {
		if (isFlagged(neighbor)) {
			flagCountAround++;
		}
	});
	console.log("flagCountAround = ", flagCountAround);
	if (flagCountAround == numberOnTile) {
		g.forAllNeighbors(i, j, (r, c, neighbor) => {
			if (isFlagged(neighbor)) {
				return;
			}
			openTile(r, c, neighbor, mineCount);
		});
	}
}

function propagateEmpty(i, j) {
	g.forAllNeighbors(i, j, (r, c, neighbor) => {
		if (!isHidden(neighbor)) {
			return;
		}
		if (isMine(neighbor)) {
			return;
		}
		neighbor.dataset.hidden = false;
		const n = updateTileNumber(r, c, neighbor);
		if (n == 0) {
			propagateEmpty(r, c);
		}
	});
}

function countNeighborMines(i, j) {
	let count = 0;
	g.forAllNeighbors(i, j, (r, c, neighbor) => {
		if (isMine(neighbor)) {
			count++;
		}
	});
	return count;
}

function disableClicks(tile) {
	tile.oncontextmenu = () => {};
	tile.onclick = () => {};
}

function loseGame(tile) {
	tile.dataset.type = "exploded";
	console.log("Lost.");
	g.forEnumeratedTiles((i, j, tile) => {
		if (isFlagged(tile)) {
			if (isMine(tile)) {
				// preserve correct flag as a hidden tile
			} else {
				// show wrong flags to the player
				tile.dataset.type = "wrong";
				tile.dataset.hidden = false;
			}
		} else {
			// simply uncover everything else
			tile.dataset.hidden = false;
		}
		if (tile.dataset.type == "unopened") {
			updateTileNumber(i, j, tile);
		}
		if (tile.dataset.type == mineNumberToCssClass(0)) {
			// show fancy game over "screen"
			tile.dataset.type = "dead";
		}
		disableClicks(tile);
	});
	refreshEmoji();
	console.log("Refresh for next game");
}

function mineNumberToCssClass(n) {
	return "number" + n;
}
function getNumberFromTile(tile) {
	return parseInt(tile.dataset.type.slice(6));
}

function winGame() {
	console.log("Won.");
	g.forAllTiles(tile => {
		if (tile.dataset.type == mineNumberToCssClass(0) || tile.dataset.type == "unopened") {
			tile.dataset.type = "party";
		}
		disableClicks(tile);
	});
	refreshEmoji();
	console.log("Refresh for next game");
}

function checkWinningCondition(mineCount) {
	const stillHidden = countHidden();
	const flaggedMines = countFlaggedMines();
	if (flaggedMines == mineCount && stillHidden == mineCount) {
		winGame();
		return;
	}
}

document.addEventListener('DOMContentLoaded', function () {
	startGame(EASY_DIFFICULTY);
});
