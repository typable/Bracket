# Bracket
JavaScript Template Engine
<br>
<br>

**Setup**
```javascript
const bracket = require('bracket');
bracket.init({ path: __dirname + '/views' });
```
<br>

**Example**

This is a simple example how the Bracket syntax works:

```html
<ul class="link-list">
	{{for:linkList->item}}
		<li class="link">
			<a href="{{item.path}}" title="{{item.text}}">{{item.text}}</a>
		</li>
	{{for:}}
</ul>
```

```javascript
bracket.render('index', {
	linkList: [
		{ path: '/', text: 'Home' },
		{ path: '/about', text: 'About' }
	]
});
```

```html
<ul class="link-list">
	<li class="link">
		<a href="/" title="Home">Home</a>
	</li>
	<li class="link">
		<a href="/about" title="About">About</a>
	</li>
</ul>
```
<br>

### Default Actions
These are the pre-implemented actions:

|Action|Description|Example|
|---|---|---|
|`default`|Executes content as JavaScript.|`{{data.text}}`|
|`escape`|Escapes HTML tags.|`{{escape:data.html}}`|
|`include`|Loads content of defined file.|`{{include:tag/header}}`|
|`for`|Loops over the define block.|`{{for:data.list->item}} ... {{for:}}`|
|`if`|Renders content only if statement is true.|`{{if:data.visible}} ... {{if:}}`|
|`def`|Checks if the given variable is defined.|`{{def:data.content}} ... {{def:}}`|

<br>

**Dynamic Includes**

`{{include:(data.site)}}`
