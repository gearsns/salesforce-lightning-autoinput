function _sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
async function quickSearchElement(doc, cond, tagname) {
	let el = doc.getElementsByTagName(tagname)
	for (let i = 0; i < el.length; ++i) {
		let item = el[i]
		if (item.outerHTML.match(cond)) {
			return item
		}
	}
	return null
}

async function searchElement(doc, cond, tagname) {
	for (let count = 0; count < 100; ++count) {
		let el = doc.getElementsByTagName(tagname)
		for (let i = 0; i < el.length; ++i) {
			let item = el[i]
			if (item.outerHTML.match(cond)) {
				return item
			}
		}
		await _sleep(100)
	}
	return null
}
async function run(key, value) {
	g_running = true;
	console.log(key)
	console.log(window)
	if (key === "url") {
		document.location = value;
	} else if (key === "保存") {
		await import('https://autoinput.visualforce.com/salesforce-lightning-autoinput.js').then(async res => {
			if (!g_cancel) {
				g_cancel = new res.CancellationToken();
			}
			const slai = new res.SalesforceLightningAutoinput(null, g_cancel);
			await slai.run({ type: "button", wait: true }, "保存 & 新規");
		});
	} else {
		await import('https://autoinput.visualforce.com/salesforce-lightning-autoinput.js').then(async res => {
			if (!g_cancel) {
				g_cancel = new res.CancellationToken();
			}
			const slai = new res.SalesforceLightningAutoinput(null, g_cancel);
			await slai.run(key, value);
		});
	}
	console.log("end" + key)
	g_running = false;
	if (g_cancel) {
		g_cancel.reset();
	}
}

