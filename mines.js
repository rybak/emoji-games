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

function startGame() {
	const mineCount = generateMines();
	console.log("Starting with " + mineCount + " mines.");

	refreshEmoji();
	forEnumeratedTiles((i, j, tile) => {
		tile.oncontextmenu = (e) => {
			e.preventDefault();
			console.log("Right-clicked on ", i, j, tile);
			flipFlag(tile);
			checkWinningCondition(mineCount);
			return;
		};
		tile.onclick = (e) => {
			console.log("Clicked on ", i, j, tile);
			tile.dataset.hidden = false;
			if (isMine(tile)) {
				loseGame(tile);
				return;
			}
			const count = countNeighborMines(i, j);
			tile.dataset.type = count;
			if (count == 0) {
				propagateEmpty(i, j);
			}
			checkWinningCondition(mineCount);
			refreshEmoji();
		};
	});
}

function generateMines() {
	let count = 0;
	forAllTiles(tile => {
		tile.dataset.type = "unopened";
		tile.dataset.hidden = true;
		if (count >= 10) {
			return;
		}
		if (Math.random() > 0.9) {
			tile.dataset.type = "mine";
			count++;
		}
	});
	return count;
}

function refreshEmoji() {
	forAllTiles(tile => {
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
	let count = 0;
	forAllTiles(tile => {
		if (isHidden(tile)) {
			count++;
		}
	});
	return count;
}

function isFlagged(tile) {
	return tile.dataset.flagged;
}
function countFlaggedMines(tile) {
	let count = 0;
	forAllTiles(tile => {
		if (isMine(tile) && isFlagged(tile)) {
			count++;
		}
	});
	return count;
}
function flipFlag(tile) {
	if (!isHidden(tile)) {
		// don't do anything with uncovered number or empty tile
		return;
	}
	if (isFlagged(tile)) {
		delete tile.dataset.flagged;
	} else {
		tile.dataset.flagged = true;
	}
	refreshEmoji();
}

function propagateEmpty(i, j) {
	forAllNeighbors(i, j, (r, c, neighbor) => {
		if (!isHidden(neighbor)) {
			return;
		}
		if (isMine(neighbor)) {
			return;
		}
		const n = countNeighborMines(r, c);
		neighbor.dataset.hidden = false;
		neighbor.dataset.type = n;
		if (n == 0) {
			propagateEmpty(r, c);
		}
	});
}

function countNeighborMines(i, j) {
	let count = 0;
	forAllNeighbors(i, j, (r, c, neighbor) => {
		if (isMine(neighbor)) {
			count++;
		}
	});
	return count;
}

function loseGame(tile) {
	tile.dataset.type = "exploded";
	console.log("Lost.");
	forEnumeratedTiles((i, j, tile) => {
		tile.dataset.hidden = false;
		if (tile.dataset.type == "unopened") {
			tile.dataset.type = countNeighborMines(i, j);
		}
		tile.onclick = () => {};
	});
	refreshEmoji();
	console.log("Refresh for next game");
}

function winGame() {
	console.log("Won.");
	forAllTiles(tile => {
		if (tile.dataset.type == "0" || tile.dataset.type == "unopened") {
			tile.dataset.type = "party";
		}
		tile.onclick = () => {};
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
