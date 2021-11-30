export class SalesforceLightningAutoinput {
	constructor() {

	}

	_sleep = ms => {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	FindAllDescendants = async (node, func) => {
		const f = async n => {
			if (n) {
				let ret = null;
				if (n.shadowRoot) {
					ret = await f(n.shadowRoot);
					if (ret) {
						return ret;
					}
				}
				var nodes = n.childNodes;
				if (nodes) {
					for (let item of [...nodes]) {
						ret = await func(item);
						if (ret) {
							return ret;
						}
						ret = await f(item);
						if (ret) {
							return ret;
						}
					}
				}
			}
			return null;
		}
		return await f(node);
	}

	getActionBodyElement = async () => {
		for (let i = 0; i < 50; i++) {
			let e = document.querySelector(".actionBody");
			if (e) {
				return e;
			}
			await this._sleep(500);
		}
		return null;
	}

	getLabel = async (node, label_name) => {
		return await this.FindAllDescendants(node, async c_node => {
			if (c_node && c_node.className && c_node.className.match && c_node.className.match(/(^| +)slds\-form\-element__label($| +)/)
				&& (c_node.innerText === `*${label_name}` || c_node.innerText === label_name)
			) {
				return c_node;
			}
			return null;
		})
	}


	listLabel = async el_actionbody => {
		let cur_section_name = "";
		return await this.FindAllDescendants(el_actionbody, async node => {
			if (!node || !node.tagName || !node.tagName.match) {
				return null;
			}
			if (node.className && node.className.match && node.className.match(/(^| +)section\-header\-title($| +)/)) {
				cur_section_name = node.innerText;
				console.log(`${cur_section_name}`);
				return null;
			} else if (node && node.className && node.className.match && node.className.match(/(^| +)slds\-form\-element__label($| +)/)) {
				console.log(`+ ${node.innerText}`);
			}
			return null;
		})
	}

	inputValue = async (el_actionbody, label_name, input_value, section_name) => {
		let cur_section_name = "";
		return await this.FindAllDescendants(el_actionbody, async node => {
			if (!node || !node.tagName || !node.tagName.match) {
				return null;
			}
			if (node.className && node.className.match && node.className.match(/(^| +)section\-header\-title($| +)/)) {
				if (node.innerText) {
					cur_section_name = node.innerText;
				}
				return null;
			} else if (section_name && section_name !== cur_section_name) {
				return null;
			} else if (node.tagName.match(/lightning\-textarea/i)) {
				if (!await this.getLabel(node, label_name)) {
					return null;
				}
				let el_input = await this.FindAllDescendants(node, async c_node => {
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
				if (!await this.getLabel(node, label_name)) {
					return null;
				}
				let el_input = await this.FindAllDescendants(node, async c_node => {
					if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/input/i)) {
						return c_node;
					}
					return null;
				});
				if (el_input && el_input.className === "slds-input slds-combobox__input") {
					for (let i = 0; i < 50; i++) {
						el_input.click();
						let el_item = await this.FindAllDescendants(node, async c_node => {
							if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/lightning\-base\-combobox\-item/i)
								&& (c_node.getAttribute("data-value") === input_value
									|| c_node.innerText === input_value)
							) {
								return c_node;
							}
							return null;
						});
						if (el_item) {
							el_item.click();
							el_input.dispatchEvent(new Event("blur"));
							return node;
						}
						await this._sleep(500);
					}
				}
			} else if (node.tagName.match(/lightning\-grouped\-combobox/i)) {
				if (!await this.getLabel(node, label_name)) {
					return null;
				}
				let el_input = await this.FindAllDescendants(node, async c_node => {
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
						let cc_node = await this.FindAllDescendants(node, async cc_node => {
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
						await this._sleep(500);
					}
				}
			} else if (node.tagName.match(/lightning\-input\-address/i)) {
				if (!await this.getLabel(node, label_name)) {
					return null;
				}
				await this.FindAllDescendants(node, async c_node => {
					if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/(lightning\-input|lightning\-textarea)/i)) {
						let attr = c_node.getAttribute("data-field");
						if (input_value[attr]) {
							c_node.value = input_value[attr];
							c_node.dispatchEvent(new Event("input"));
							c_node.dispatchEvent(new Event("blur"));
						}
						return null;
					}
				});
				return node;
			} else if (node.tagName.match(/lightning\-input/i)) {
				if (!await this.getLabel(node, label_name)) {
					return null;
				}
				let elDateTimePicker = await this.FindAllDescendants(node, async c_node => {
					if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/lightning\-datetimepicker/i)) {
						return c_node;
					}
					return null;
				});
				if (elDateTimePicker) {
					let value_date = input_value;
					let value_time = "";
					if (input_value.date) {
						value_date = input_value.date;
					}
					if (input_value.time) {
						value_time = input_value.time;
					}
					if (!input_value.date && !input_value.time && input_value.match(/(.*) (.*)/)) {
						value_date = RegExp.$1;
						value_time = RegExp.$2;
					}
					await this.FindAllDescendants(elDateTimePicker, async c_node => {
						if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/(lightning\-datepicker|lightning\-timepicker)/i)) {
							if (c_node.tagName.match(/datepicker/i)) {
								await this.FindAllDescendants(c_node, async cc_node => {
									if (cc_node && cc_node.tagName && cc_node.tagName.match && cc_node.tagName.match(/input/i)) {
										cc_node.value = value_date;
										cc_node.dispatchEvent(new Event("input"));
										cc_node.dispatchEvent(new Event("change"));
										cc_node.dispatchEvent(new Event("blur"));
									}
									return null;
								})
							} else {
								await this.FindAllDescendants(c_node, async cc_node => {
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
				let elDateOrTimePicker = await this.FindAllDescendants(node, async c_node => {
					if (c_node && c_node.tagName && c_node.tagName.match && c_node.tagName.match(/(lightning\-datepicker|lightning\-timepicker)/i)) {
						return await this.FindAllDescendants(c_node, async cc_node => {
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
				let el_input = await this.FindAllDescendants(node, async c_node => {
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

	buttonClick = async (el_actionbody, name, wait) => {
		return await this.FindAllDescendants(el_actionbody, async node => {
			if (!node || !node.tagName || !node.tagName.match) {
				return null;
			}
			if (node.tagName.match(/lightning\-button/i) && node.innerText === name) {
				let bSaveAndNew = await this.FindAllDescendants(node, async c_node => {
					if (c_node.name === "SaveAndNew") {
						return c_node;
					}
					return null;
				})
				//
				let attr = el_actionbody.getAttribute("data-aura-rendered-by");
				node.click();
				if (wait) {
					await this._sleep(1000);
					// Loading...
					for (let i = 0; i < 50; ++i) {
						if (!await this.FindAllDescendants(el_actionbody, async c_node => {
							if (!c_node || !c_node.tagName || !c_node.tagName.match) {
								return null;
							}
							if (c_node.tagName.match(/lightning\-spinner/i)) {
								return c_node;
							}
						})) {
							break;
						}
						await this._sleep(500);
					}
					//
					if (bSaveAndNew) {
						// Wait for the new modal to be created.
						for (let i = 0; i < 50; ++i) {
							let el_actionbody_new = await this.getActionBodyElement();
							if (el_actionbody_new) {
								if (el_actionbody_new.getAttribute("data-aura-rendered-by") !== attr) {
									break;
								}
							}
							await this._sleep(500);
						}
						// Wait for the button to be enabled.
						let el_actionbody_tmp = await this.getActionBodyElement();
						if (el_actionbody_tmp) {
							for (let i = 0; i < 50; ++i) {
								if (await this.FindAllDescendants(el_actionbody_tmp, async c_node => {
									if (c_node.name === "SaveAndNew") {
										return c_node;
									}
									return null;
								})) {
									break;
								}
								await this._sleep(500);
							}
						}
					}
					await this._sleep(1000);
				}
				return node;
			}
			return null;
		})
	}

	run = async (key, value, section) => {
		if (key.type === "button") {
			let el_actionbody = await this.getActionBodyElement();
			if (el_actionbody) {
				await this.buttonClick(el_actionbody, value, key.wait);
			}
		} else {
			for (let i = 0; i < 50; ++i) {
				let el_actionbody = await this.getActionBodyElement();
				if (el_actionbody) {
					if (await this.inputValue(el_actionbody, key, value, section)) {
						break;
					}
				}
				await this._sleep(500);
			}
		}
	}
}
