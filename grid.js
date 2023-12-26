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
/* table rows */
const rows = [];
/* table cells */
const cells = [];
/* elements inside the cells */
const grid = [];
const DEBUG = false;

function prepareEmptyGrid() {
	const table = document.getElementById('gridContainer');
	for (let i = 0; i < GRID_ROWS; i++) {
		grid[i] = [];
		cells[i] = [];
		rows[i] = document.createElement('tr');
		table.append(rows[i]);
	}
	forGrid((i, j) => {
		cells[i].push(document.createElement('td'));
		rows[i].append(cells[i][j]);
		const newTile = document.createElement('span');
		grid[i][j] = newTile;
		const gridItem = document.createElement('div');
		gridItem.className = 'gridItem';
		gridItem.append(newTile);
		cells[i][j].append(gridItem);
	});
}

function forGrid(f) {
	for (let i = 0; i < GRID_ROWS; i++) {
		for (let j = 0; j < GRID_COLUMNS; j++) {
			f(i, j);
		}
	}
}

function forEnumeratedTiles(f) {
	forGrid((i, j) => {
		const tile = grid[i][j];
		f(i, j, tile);
	});
}

function forAllTiles(f) {
	forEnumeratedTiles((i, j, tile) => {
		f(tile);
	});
}

const TYPES = new Map([
	["mine", "💣"],
	["flag", "🚩"],
	["hidden", "⬛"],
	["0", "⬜"],
	["1", "\u0031\uFE0F\u20E3"],
	["2", "\u0032\uFE0F\u20E3"],
	["3", "\u0033\uFE0F\u20E3"],
	["4", "\u0034\uFE0F\u20E3"],
	["5", "\u0035\uFE0F\u20E3"],
	["6", "\u0036\uFE0F\u20E3"],
	["7", "\u0037\uFE0F\u20E3"],
	["8", "\u0038\uFE0F\u20E3"],
	["debugMine", "🟧"],
	["exploded", "💥"],
	["party", "🎉"],
]);

function setTile(tile, emojiType) {
	if (tile.dataset.previousRender === emojiType) {
		return;
	}
	tile.replaceChildren(document.createTextNode(TYPES.get(emojiType)));
	tile.dataset.previousRender = emojiType;
}

function forAllNeighbors(i, j, f) {
	const minRow = Math.max(i - 1, 0);
	const maxRow = Math.min(i + 1, GRID_ROWS - 1);
	const minCol = Math.max(j - 1, 0);
	const maxCol = Math.min(j + 1, GRID_COLUMNS - 1);
	for (let row = minRow; row <= maxRow; row++) {
		for (let col = minCol; col <= maxCol; col++) {
			if (row == i && col == j) {
				continue;
			}
			f(row, col, grid[row][col]);
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	prepareEmptyGrid();
	startGame();
});
