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

function randomZeroTo(n) {
	return Math.floor(Math.random() * n);
}

function randomInArray(a) {
	return a[randomZeroTo(a.length)];
}
