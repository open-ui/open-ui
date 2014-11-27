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
        var el = opt.element;

		opt=$ui.inputCtrlMeta(opt, 'switch');		
        el.innerHTML = '';
        el = $ui.replaceEl(el, $ui.compile('switch', opt));
		
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
        obj.val(opt.value);
        if (opt.disabled) {
            obj.disabled(true);
        }
        if(opt.listeners){$ui.bindListeners(opt.listeners, el.children[0]);}
        return obj;
    };
    return $ui;
})($ui);
