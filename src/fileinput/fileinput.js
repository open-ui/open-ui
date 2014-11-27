var $ui = $ui || {};

/**
Create a new fileinput control

HTML:

	<input type='file' id='fileinput' />

Javascript:
	
	$ui.checkbox({
		element: document.getElementById('fileinput')
	});
	
@class $ui.fileinput
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value=0] {String} Value of initially selected option, defaults to the attribute value set on the passed element, or `0`
@param [options.name=ui-fileinput-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `ui-fileinput-RandInt`
@param [options.label=label] {String} String to use for the control label, defaults to the attribute value set on the passed element, or its `innerHTML`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.listeners] {Object} Object array of event listeners to bind to underlying input(s)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function($ui) {
    $ui.fileinput = function(opt) {
        var el = opt.element;
		opt.label = opt.label || 'Browse';
		opt.placeholder = opt.placeholder || 'Please select...';
		opt=$ui.inputCtrlMeta(opt, 'fileinput');		
        el.innerHTML = '';
        el = $ui.replaceEl(el, $ui.compile('fileinput', opt));		
		
		$ui.bindEvent('change', el.children[1].children[0], function(e){
			el.children[0].innerHTML='';
			if(el.children[1].children[0].files[0] && el.children[1].children[0].files[0].name){			
				for(var i=0;i<el.children[1].children[0].files.length;i++){				
					el.children[0].appendChild($ui.createEl($ui.compile('fileinput_item', {value:el.children[1].children[0].files[i].name})));
				}
			}else{
				el.children[0].appendChild($ui.createEl($ui.compile('fileinput_item', {value:opt.placeholder}));
			}
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
                    $ui.toggleClass(el, 'ui-disabled', Boolean(val));
                    $ui.attribute(el.children[0], 'disabled', Boolean(val));
                }
                return $ui.attribute(el.children[0], 'disabled');
            }
        };
        if (opt.disabled) {
            obj.disabled(true);
        }
        if(opt.listeners){$ui.bindListeners(opt.listeners, el.children[0]);}
        return obj;
    };
    return $ui;
})($ui);
