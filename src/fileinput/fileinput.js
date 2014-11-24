var oui = oui || {};

/**
Create a new fileinput control

HTML:

	<input type='file' id='fileinput' />

Javascript:
	
	oui.checkbox({
		element: document.getElementById('fileinput')
	});
	
@class oui.fileinput
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value=0] {String} Value of initially selected option, defaults to the attribute value set on the passed element, or `0`
@param [options.name=oui-fileinput-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `oui-fileinput-RandInt`
@param [options.label=label] {String} String to use for the control label, defaults to the attribute value set on the passed element, or its `innerHTML`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.listeners] {Object} Object array of event listeners to bind to underlying input(s)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function(oui) {
    oui.fileinput = function(opt) {
        var el = opt.element,
            //    listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputLabel = opt.label || el.getAttribute('label') || "Browse",
			inputPlaceholder = opt.placeholder || el.getAttribute('placeholder') || "Please select...",
            inputDisabled = (opt.disabled || el.getAttribute('disabled')) ? 'disabled' : '',
            inputName = opt.name || el.getAttribute('name') || 'oui-fileinput-' + oui.getRand(1, 999),
            listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputTabIndex = opt.tabindex || el.getAttribute('tabindex') || 0;
 
        /*jshint multistr:true */
        var str = "<div class='oui-fileinput' for='" + inputName + "'>\
			<input  class='oui-file-input' type = 'file'  id = '" + inputName + "'  name = '" + inputName + "'   tabindex = '" + inputTabIndex + "' / >\
			<label class='oui-file-selected'>"+inputPlaceholder+"</label>\
			<button class='oui-browse-file'>"+inputLabel+"</button>\
		</div>";
        el.innerHTML = '';
        el = oui.replaceEl(el, str);
 
		oui.bindEvent('change', el.children[0], function(e){
			el.getElementsByTagName('label')[0].innerHTML=el.children[0].value ? el.children[0].value : inputPlaceholder;
		}); 
		 
        /**
        Gets or sets control disabled state
        @method disabled
        @param [boolean] {Boolean} Disabled state
        @return {Boolean} Returns disabled state
        */
        var obj = {
            0: el,
            disabled: function(val) {
                if (val !== undefined) {
                    oui.toggleClass(el, 'oui-disabled', Boolean(val));
                    oui.attribute(el.children[0], 'disabled', Boolean(val));
                }
                return oui.attribute(el.children[0], 'disabled');
            }
        };
        if (inputDisabled) {
            obj.disabled(true);
        }
        oui.bindListeners(listeners, el.children[0]);
        return obj;
    };
    return oui;
})(oui);
