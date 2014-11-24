var $ui = $ui || {};

/**
Create a new switch control

HTML: 

	<input type='switch' id='switch' />

Javascript:
	
	$ui.switch({
		element: document.getElementById('switch')
	});
	
@class $ui.switch
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value] {Boolean} Initial value
@param [options.name=ui-switch-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `ui-switch-RandInt`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.listeners] {Object} Object array of event listeners to bind to underlying input(s)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function($ui) {
    $ui.switch = function(opt) {
        var el = opt.element,
            //    listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputValue = opt.value || el.getAttribute('value') || true,
            inputLabel = opt.label || el.getAttribute('label') || el.innerHTML,
            inputDisabled = (opt.disabled || el.getAttribute('disabled')) ? 'disabled' : '',
            inputName = opt.name || el.getAttribute('name') || 'ui-switch-' + $ui.getRand(1, 999),
            listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputTabIndex = opt.tabindex || el.getAttribute('tabindex') || 0;

        /*jshint multistr:true */
        var str = "<label class='ui-switch' for='" + inputName + "'>\
			<input type = 'checkbox'  id = '" + inputName + "'  name = '" + inputName + "' tabindex = '" + inputTabIndex + "' / >\
            <span class = 'ui-label' > " + inputLabel + " </span>\
			<span class = 'ui-indicator' > " + inputLabel + " </span>\
		</label>";
		
        el.innerHTML = '';
        el = $ui.replaceEl(el, str);
		
		$ui.bindEvent("mousewheel", el, function(e) { 
		 	$ui.preventBubble(e); 
			if (e.wheelDelta > 0 || e.detail < 0) {
                obj.val(true);
            }else{
				obj.val(false);
			}
        });
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
                    return $ui.attribute(el.children[0], 'checked');
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
        obj.val(inputValue);
        if (inputDisabled) {
            obj.disabled(true);
        }
        $ui.bindListeners(listeners, el.children[0]);
        return obj;
    };
    return $ui;
})($ui);
