const FONT_CONTROL_CONTAINER_CLASS = "fontControlContainer";
const FONT_CONTROL_CLASS = "fontControl";
const FONT_FAMILIES = [
	'OpenMoji',
	'Noto Color Emoji',
	'"Noto Emoji", "Noto Color Emoji"',
	'Segoe UI Emoji',
];

function createOption(fontFamily) {
	const o = document.createElement('input');
	o.type = 'radio';
	o.name = 'fontFamily';
	o.id = fontFamily;
	o.value = fontFamily;
	o.appendChild;
	o.addEventListener("change", (event) => {
		event.preventDefault();
		console.log(fontFamily);
		document.body.style.fontFamily = fontFamily;
	});
	return o;
}

function createLabel(fontFamily, sampleEmojiText) {
	const label = document.createElement('label');
	label.htmlFor = fontFamily;
	label.style.fontFamily = fontFamily;
	label.append(document.createTextNode(sampleEmojiText));
	return label;
}

function addFontControl(sampleEmojiText) {
	const maybe = document.querySelector(`.${FONT_CONTROL_CLASS}`);
	if (maybe) {
		return;
	}
	const container = document.querySelector(`.${FONT_CONTROL_CONTAINER_CLASS}`);
	const div = document.createElement('div');
	for (const ff of FONT_FAMILIES) {
		div.append(createOption(ff));
		div.append(createLabel(ff, sampleEmojiText));
	}
	container.appendChild(div);
}
