function _sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

async function FindAllDescendants(node, func) {
	async function f(n) {
		var nodes = n.childNodes;
		if (nodes) {
			for (let item of [...nodes]) {
				node = await func(item);
				if (node) {
					return node;
				}
				node = await f(item);
				if (node) {
					return node;
				}
			}
			if (n.shadowRoot) {
				return await f(n.shadowRoot);
			}
		}
		return null;
	}
	return await f(node);
}

async function getActionBodyElement() {
	for (let i = 0; i < 50; i++) {
		let e = document.querySelector(".actionBody");
		if (e) {
			return e;
		}
		await _sleep(500);
	}
	return null;
}

async function getLabel(node, label_name) {
	return await FindAllDescendants(node, async c_node => {
		if (c_node && c_node.className && c_node.className.match && c_node.className.match(/(^| +)slds\-form\-element__label($| +)/)
			&& (c_node.innerText === `*${label_name}` || c_node.innerText === label_name)
		) {
			return c_node;
		}
		return null;
	})
}

async function inputValue(el_actionbody, label_name, input_value) {
	return await FindAllDescendants(el_actionbody, async node => {
		if (!node || !node.tagName || !node.tagName.match) {
			return null;
		}
		if (node.tagName.match(/lightning\-textarea/i)) {
			if (!await getLabel(node, label_name)) {
				return null;
			}
			let el_input = await FindAllDescendants(node, async c_node => {
				if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/textarea/i)) {
					return c_node;
				}
				return null;
			});
			if (el_input) {
				el_input.value = input_value;
				el_input.click();
				el_input.dispatchEvent(new Event("blur"));
				return node;
			}
		} else if (node.tagName.match(/lightning\-combobox/i)) {
			if (!await getLabel(node, label_name)) {
				return null;
			}
			let el_input = await FindAllDescendants(node, async c_node => {
				if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/input/i)) {
					return c_node;
				}
				return null;
			});
			if (el_input && el_input.className === "slds-input slds-combobox__input") {
				for (let i = 0; i < 50; i++) {
					el_input.click();
					let el_item = await FindAllDescendants(node, async c_node => {
						if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/lightning\-base\-combobox\-item/i)
							&& c_node.getAttribute("data-value") === input_value) {
							return c_node;
						}
						return null;
					});
					if (el_item) {
						el_item.click();
						el_input.dispatchEvent(new Event("blur"));
						return node;
					}
					await _sleep(500);
				}
			}
		} else if (node.tagName.match(/lightning\-grouped\-combobox/i)) {
			if (!await getLabel(node, label_name)) {
				return null;
			}
			let el_input = await FindAllDescendants(node, async c_node => {
				if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/input/i)) {
					return c_node;
				}
				return null;
			});
			if (el_input && el_input.className === "slds-input slds-combobox__input") {
				el_input.value = input_value;
				el_input.dispatchEvent(new Event("input"));
				el_input.dispatchEvent(new Event("change"));
				el_input.blur();
				node.dispatchEvent(new CustomEvent("textinput", { "detail": { "text": input_value } }));
				for (let i = 0; i < 50; i++) {
					el_input.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
					el_input.click();
					let cc_node = await FindAllDescendants(node, async cc_node => {
						if (cc_node && cc_node.className && cc_node.className.match
							&& cc_node.className.match(/(^| +)slds\-listbox__option\-(text_entity|meta_entity)($| +)/)
							&& cc_node.innerText && cc_node.innerText === input_value) {
							return cc_node;
						}
						return null;
					})
					if (cc_node) {
						cc_node.focus();
						cc_node.click();
						node.dispatchEvent(new Event("blur"));
						return node;
					}
					await _sleep(500);
				}
			}
		} else if (node.tagName.match(/lightning\-input/i)) {
			if (!await getLabel(node, label_name)) {
				return null;
			}
			let elDateTimePicker = await FindAllDescendants(node, async c_node => {
				if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/lightning\-datetimepicker/i)) {
					return c_node;
				}
				return null;
			});
			if (elDateTimePicker) {
				let value_date = input_value;
				let value_time = "";
				if (input_value.match(/(.*) (.*)/)) {
					value_date = RegExp.$1;
					value_time = RegExp.$2;
				}
				await FindAllDescendants(elDateTimePicker, async c_node => {
					if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/(lightning\-datepicker|lightning\-timepicker)/i)) {
						if (c_node.tagName.match(/datepicker/i)) {
							await FindAllDescendants(c_node, async cc_node => {
								if (cc_node && cc_node.tagName && cc_node.tagName.match && cc_node.tagName.match(/input/i)) {
									cc_node.value = value_date;
									cc_node.dispatchEvent(new Event("input"));
									cc_node.dispatchEvent(new Event("change"));
									cc_node.dispatchEvent(new Event("blur"));
								}
								return null;
							})
						} else {
							await FindAllDescendants(c_node, async cc_node => {
								if (cc_node && cc_node.tagName && cc_node.tagName.match && cc_node.tagName.match(/input/i)) {
									cc_node.value = value_time;
									cc_node.dispatchEvent(new Event("input"));
									cc_node.dispatchEvent(new Event("change"));
									cc_node.dispatchEvent(new Event("blur"));
								}
								return null;
							})
						}
					}
					return null;
				})
				return node;
			}
			let elDateOrTimePicker = await FindAllDescendants(node, async c_node => {
				if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/(lightning\-datepicker|lightning\-timepicker)/i)) {
					return await FindAllDescendants(c_node, async cc_node => {
						if (cc_node && cc_node.tagName && cc_node.tagName.match && cc_node.tagName.match(/input/i)) {
							cc_node.value = input_value;
							cc_node.dispatchEvent(new Event("input"));
							cc_node.dispatchEvent(new Event("change"));
							cc_node.dispatchEvent(new Event("blur"));
							return cc_node;
						}
						return null;
					})
				}
				return null;
			});
			if (elDateOrTimePicker) {
				return node;
			}
			let el_input = await FindAllDescendants(node, async c_node => {
				if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/input/i)) {
					return c_node;
				}
				return null;
			});
			if (el_input) {
				if (el_input.type === "checkbox") {
					if (input_value === "check") {
						el_input.cheked = true;
					} else {
						el_input.cheked = false;
					}
				} else {
					el_input.value = input_value;
					el_input.click();
					el_input.dispatchEvent(new Event("blur"));
				}
				return node;
			}
		}
		return null;
	});
}

async function run(key, value) {
	for (let i = 0; i < 50; ++i) {
		let el_actionbody = await getActionBodyElement();
		if (el_actionbody) {
			if (await inputValue(el_actionbody, key, value)) {
				break;
			}
		}
		await _sleep(500);
	}
}

