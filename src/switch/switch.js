var oui = oui || {};

/**
Create a new switch control

HTML: 

	<input type='switch' id='switch' />

Javascript:
	
	oui.switch({
		element: document.getElementById('switch')
	});
	
@class oui.switch
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value] {Boolean} Initial value
@param [options.name=oui-switch-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `oui-switch-RandInt`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.listeners] {Object} Object array of event listeners to bind to underlying input(s)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function(oui) {
    oui.switch = function(opt) {
        var el = opt.element,
            //    listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputValue = opt.value || el.getAttribute('value') || true,
            inputLabel = opt.label || el.getAttribute('label') || el.innerHTML,
            inputDisabled = (opt.disabled || el.getAttribute('disabled')) ? 'disabled' : '',
            inputName = opt.name || el.getAttribute('name') || 'oui-switch-' + oui.getRand(1, 999),
            listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputTabIndex = opt.tabindex || el.getAttribute('tabindex') || 0;

        /*jshint multistr:true */
        var str = "<label class='oui-switch' for='" + inputName + "'>\
			<input type = 'checkbox'  id = '" + inputName + "'  name = '" + inputName + "' tabindex = '" + inputTabIndex + "' / >\
            <span class = 'oui-label' > " + inputLabel + " </span>\
			<span class = 'oui-indicator' > " + inputLabel + " </span>\
		</label>";
		
        el.innerHTML = '';
        el = oui.replaceEl(el, str);
		
		oui.bindEvent("mousewheel", el, function(e) { 
		 	oui.preventBubble(e); 
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
                    return oui.attribute(el.children[0], 'checked');
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
