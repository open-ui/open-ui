var $ui = $ui || {};

/**
Create a new checkbox control

HTML:

	<input type='checkbox' id='checkbox' />

Javascript:
	
	$ui.checkbox({
		element: document.getElementById('checkbox'),
		label: 'Checked',
		value: true
	});
	
@class $ui.checkbox
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value=0] {String} Value of initially selected option, defaults to the attribute value set on the passed element, or `0`
@param [options.name=ui-checkbox-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `ui-checkbox-RandInt`
@param [options.label=label] {String} String to use for the control label, defaults to the attribute value set on the passed element, or its `innerHTML`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.listeners] {Object} Object array of event listeners to bind to underlying input(s)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function($ui) {
    $ui.checkbox = function(opt) {
	
        var el = opt.element;       
		opt=$ui.inputCtrlMeta(opt, 'checkbox');
		
		str=($ui.compile('checkbox', opt));
		
        el.innerHTML = '';
        el = $ui.replaceEl(el, str);
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
                    return opt.value;
                }
                $ui.attribute(el.children[0], 'checked', Boolean(val));
            },
            disabled: function(val) {
                if (val !== undefined) {
                    $ui.toggleClass(el, 'ui-disabled', Boolean(val));
                    $ui.attribute(el.children[0], 'disabled', Boolean(val));
                }
                return $ui.attribute(el.children[0], 'disabled');
            }
        };
        obj.val(opt.value);
        if (opt.disabled) {
            obj.disabled(true);
        }
        if(opt.listeners){$ui.bindListeners(listeners, el.children[0]);}
        return obj;
    };
    return $ui;
})($ui);
