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

const DEBUG = false;

class Grid {
	#rowCount;
	#columnCount;
	/**
	 * Two-dimensional array of tiles on the grid.
	 */
	#grid = [];

	constructor(rowCount, columnCount, table) {
		this.#rowCount = rowCount;
		this.#columnCount = columnCount;
		/**
		 * <tr> elements -- rows of the <table> that render the grid.
		 */
		const rows = [];
		/**
		 * Individual <td> elements -- cells of the <table>.
		 */
		const cells = [];
		for (let i = 0; i < rowCount; i++) {
			this.#grid[i] = [];
			cells[i] = [];
			rows[i] = document.createElement('tr');
			table.append(rows[i]);
		}
		this.forGrid((i, j) => {
			cells[i].push(document.createElement('td'));
			rows[i].append(cells[i][j]);
			const newTile = document.createElement('span');
			this.#grid[i][j] = newTile;
			const gridItem = document.createElement('div');
			gridItem.className = 'gridItem';
			gridItem.append(newTile);
			cells[i][j].append(gridItem);
		});
	}

	forGrid(f) {
		for (let i = 0; i < this.#rowCount; i++) {
			for (let j = 0; j < this.#columnCount; j++) {
				f(i, j);
			}
		}
	}

	forEnumeratedTiles(f) {
		this.forGrid((i, j) => {
			const tile = this.#grid[i][j];
			f(i, j, tile);
		});
	}

	forAllTiles(f) {
		this.forEnumeratedTiles((i, j, tile) => {
			f(tile);
		});
	}

	forAllNeighbors(i, j, f) {
		const minRow = Math.max(i - 1, 0);
		const maxRow = Math.min(i + 1, this.#rowCount - 1);
		const minCol = Math.max(j - 1, 0);
		const maxCol = Math.min(j + 1, this.#columnCount - 1);
		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				if (row == i && col == j) {
					continue;
				}
				f(row, col, this.#grid[row][col]);
			}
		}
	}
}

function setTile(tile, emojiType) {
	tile.className = emojiType;
}
