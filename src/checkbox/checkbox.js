var oui = oui || {};

/**
Create a new checkbox control

HTML:

	<input type='checkbox' id='checkbox' />

Javascript:
	
	oui.checkbox({
		element: document.getElementById('checkbox'),
		label: 'Checked',
		value: true
	});
	
@class oui.checkbox
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value=0] {String} Value of initially selected option, defaults to the attribute value set on the passed element, or `0`
@param [options.name=oui-checkbox-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `oui-checkbox-RandInt`
@param [options.label=label] {String} String to use for the control label, defaults to the attribute value set on the passed element, or its `innerHTML`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.listeners] {Object} Object array of event listeners to bind to underlying input(s)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function(oui) {
    oui.checkbox = function(opt) {
        var el = opt.element,
            //    listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputValue = opt.value || el.getAttribute('value') || 0,
            inputLabel = opt.label || el.getAttribute('label') || el.innerHTML,
            inputDisabled = (opt.disabled || el.getAttribute('disabled')) ? 'disabled' : '',
            inputName = opt.name || el.getAttribute('name') || 'oui-checkbox-' + oui.getRand(1, 999),
            listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputTabIndex = opt.tabindex || el.getAttribute('tabindex') || 0;

        /*jshint multistr:true */
        var str = "<label class='oui-checkbox' for='" + inputName + "'>\
		<input type = 'checkbox'  id = '" + inputName + "'  name = '" + inputName + "'  value = '" + inputValue + "'  tabindex = '" + inputTabIndex + "' / >\
            <span class = 'oui-label' > " + inputLabel + " </span>\
		</label>";
        el.innerHTML = '';
        el = oui.replaceEl(el, str);
        /**
        Gets or sets control value
        @method val
        @param [value] {String} Value to set
        @return {String} Returns current value
        */

        /**
        Gets or sets control disabled state
        @method disabled
        @param [boolean] {Boolean} Disabled state
        @return {Boolean} Returns disabled state
        */
        var obj = {
            0: el,
            val: function(val) {
                if (val === undefined) {
                    return inputValue;
                }
                oui.attribute(el.children[0], 'checked', Boolean(val));
            },
            disabled: function(val) {
                if (val !== undefined) {
                    oui.toggleClass(el, 'oui-disabled', Boolean(val));
                    oui.attribute(el.children[0], 'disabled', Boolean(val));
                }
                return oui.attribute(el.children[0], 'disabled');
            }
        };
        obj.val(inputValue);
        if (inputDisabled) {
            obj.disabled(true);
        }
        oui.bindListeners(listeners, el.children[0]);
        return obj;
    };
    return oui;
})(oui);
