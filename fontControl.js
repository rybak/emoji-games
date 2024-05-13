const FONT_CONTROL_CONTAINER_CLASS = "fontControlContainer";
const FONT_CONTROL_CLASS = "fontControl";

function createOption(sampleEmojiText, fontFamily) {
	const o = document.createElement('option');
	o.appendChild(document.createTextNode(sampleEmojiText));
	o.style.fontFamily = fontFamily;
	return o;
}

function addFontControl(sampleEmojiText) {
	const maybe = document.querySelector(`.${FONT_CONTROL_CLASS}`);
	if (maybe) {
		return;
	}
	const container = document.querySelector(`.${FONT_CONTROL_CONTAINER_CLASS}`);
	const select = document.createElement('select');
	select.appendChild(createOption(sampleEmojiText, 'OpenMoji'));
	select.appendChild(createOption(sampleEmojiText, 'Noto Color Emoji'));
	select.appendChild(createOption(sampleEmojiText, 'Segoe UI Emoji'));
	select.addEventListener("change", (event) => {
		const selected = select.childNodes[select.selectedIndex];
		console.log(selected.style.fontFamily);
		document.body.style.fontFamily = selected.style.fontFamily;
	});
	container.appendChild(select);
}
