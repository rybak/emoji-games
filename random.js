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
