# ClassListPlus.js
A improvement to native Element.classList (plus polyfill)


USAGE:

e.g. these all work per up-to-date Element.classList specification

	element.classList.add("native");
	element.classList.add("also","native","form");

	element.classList.remove("native");
	element.classList.remove("also","native","form");

	element.classList.toggle("native");		// toggles and return (element.classList.contains("native"))
	element.classList.toggle("native",true);	// adds and returns true
	element.classList.toggle("native",false);	// removes and returns false

Improves on native Element.classList, and polyfill if necessary, namely to allow 
multiple class tokens in a single, space-delimited string.

`	element.classList.add("not native form");	// adds all 3 tokens: "not" "native" and "form"`
`	element.classList.remove("not native form");	// removes all 3 tokens: "not" "native" and "form"`

This tweak of classList also upgrades .toggle() by allowing a class to be toggle
between two specific names (e.g. ON and OFF). This is useful for making CSS styling
explicit-explicit, like 'on'-'off' or 'expand'-'collapse' rather than implicit-explicit, like
''-'collapse'.  It will ONLY toggle if either of the names are present, and will replace with 
the other.  It is an alternative approach to .toggle(arg,force)
 
`	element.classList.togle("OFF","ON");	// replace one token for another, if either is present, 
						   returns 1 if replaced with OFF
						   returns 2 if replaced with ON
						   return 0 if neither is present, no toggle occurs
`

Finally, during the execution of this upgrade of Element.classList prototype, it can be configured to 
pre-pend or post-pend ALL class names with a one-time-specified string.  For both performance AND
safety, these strings are specified at the beginning, and cannot be changed without reloading the document.  
If selective application of pre/post-pend is needed, it should be done at in the application code.  
This could be useful when to add a namespace to you CSS, HTML obfuscation, or trademarking HTML 
markup while still making the Javascript code human-readable.
For example, if defined with prepend string "this-is-my-app-"

	document.getElementById('box').classList.add("draggable")

will produce this `<div id="box" class="this-is-my-app-draggable">...<div>`

while at the same time,

	document.getElementById('box').classList.contains("draggable")  

will return TRUE, and

	document.getElementById('box').classList.toggle("draggable")

will produce this `<div id="box" class="">...<div>`

WARNING:  The 'pre/post-pend' feature may or may NOT break other frameworks that rely on 
`Element.classList`.  It will definitely break code/frameworks that work with seperately marked-up HTML 
(i.e. with element already given class names) or mixes use of `Element.classList` and `Element.className`.  
If each function/object/framework/etc consistently works with class names either by `Element.classList` 
or by `Element.className` but NOT both simultaneously, then there should not be any problems, including 
working with third-party frameworks.  If in doubt, however, do NOT use pre/post-pend.
