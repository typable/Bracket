const fs = require('fs');

module.exports = {
	action: {},
	path: null,
	init: function(args) {
		this.path = args.path || __dirname;
		this.define('default', function(string, values) {
			try {
				return new Function(Object.keys(values), `return ${string}`)(...Object.values(values));
			}
			catch(error) {
				console.log(error);
			}
		});
		this.define('escape', (string, values) => {
			return this.action
				.default(string, values)
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		});
		this.define('include', async (string, values) => {
			let path = string;
			if(string.match(/^\([^)]*\)$/g)) {
				path = this.action.default(string, values);
			}
			try {
				return await this.render(path, values);
			}
			catch(error) {
				console.error(error);
			}
		});
		this.define('for', async (string, values, content) => {
			let result = '';
			if(string && content) {
				let [ key, name ] = string.split('->');
				let array = values[key];
				if(array && Array.isArray(array)) {
					for(let item of array) {
						let scope = Object.assign({}, values);
						scope[name] = item;
						result += await this.compile(content, scope);
					}
				}
			}
			return result;
		});
		this.define('if', (string, values, content) => {
			let result = '';
			if(string && content) {
				let is = this.action.default(string, values);
				if(is && is === true) {
					result = content;
				}
			}
			return result;
		});
		this.define('def', (string, values, content) => {
			let result = '';
			if(string && content) {
				let is = this.action.default(`typeof ${string} !== 'undefined'`, values);
				if(is && is === true) {
					result = content;
				}
			}
			return result;
		});
	},
	define: function(action, callback) {
		this.action[action] = callback;
	},
	render: async function(file, values) {
		let string = fs.readFileSync(`${this.path}/views/${file}.html`, 'utf8');
		return await this.compile(string, values);
	},
	compile: async function(string, values) {
		let exp = new RegExp(`\{\{([^}]*)\}\}`, 'g');
		if(string) {
			let match = null;
			while(match = exp.exec(string)) {
				if(match !== null) {
					let index = match.index;
					let value = match[1];
					let action = null;
					let context = null;
					let content = null;
					let result = null;
					if(value.includes(':')) {
						action = value.substr(0, value.indexOf(':'));
						value = value.substr(value.indexOf(':') + 1);
					}
					if(value.length > 0) {
						if(action) {
							let substring = string.substr(index);
							let pattern = `{{${action}:}}`;
							let end = substring.indexOf(pattern);
							if(end != -1) {
								context = substring.substr(0, end + pattern.length);
							}
						}
					}
					content = context;
					if(content) {
						content = content.replace(/^\{\{[^}]*\}\}/g, '');
						content = content.replace(/\{\{[^}]*\}\}$/g, '');
					}
					if(this.action[action]) {
						result = await this.action[action](value, values, content);
					}
					else {
						result = this.action.default(value, values, content);
					}
					if(result !== undefined) {
						string = string.replace(new RegExp(this.quote(context || match[0]), 'g'), result);
					}
				}
			}
		}
		return string;
	},
	quote: function(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
};
