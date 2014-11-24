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
        var el = opt.element,
            //    listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputLabel = opt.label || el.getAttribute('label') || "Browse",
			inputPlaceholder = opt.placeholder || el.getAttribute('placeholder') || "Please select...",
            inputMultiple = (Boolean(opt.multiple) === true || $ui.attribute(el, 'multiple')) ? true : false,
            inputDisabled = (opt.disabled || el.getAttribute('disabled')) ? 'disabled' : '',
            inputName = opt.name || el.getAttribute('name') || 'ui-fileinput-' + $ui.getRand(1, 999),
            listeners = opt.listeners === undefined ? {} : opt.listeners,
            inputTabIndex = opt.tabindex || el.getAttribute('tabindex') || 0;
 
		inputName = (inputMultiple && inputName.indexOf('[]') === -1) ? inputName + '[]' : inputName.replace('[]', '');
  
        /*jshint multistr:true */
        var str = "<div class='ui-fileinput' for='" + inputName + "'>\
			<ul class='ui-file-selected'><li>"+inputPlaceholder+"</li></ul>\
			<div class='ui-file-browse'>\
				<input type = 'file'  id = '" + inputName + "'  name = '" + inputName + "'   tabindex = '" + inputTabIndex + "' "+(inputMultiple?"multiple='multiple'":"")+"/ >\
				<button>"+inputLabel+"</button>\
			</div>\
		</div>";
        el.innerHTML = '';
        el = $ui.replaceEl(el, str);
 
		$ui.bindEvent('change', el.children[1].children[0], function(e){
			var selected="<li>"+inputPlaceholder+"</li>";
			if(el.children[1].children[0].files[0] && el.children[1].children[0].files[0].name){
				selected='';
				for(var i=0;i<el.children[1].children[0].files.length;i++){
					selected+="<li>"+el.children[1].children[0].files[i].name+"</li>";
				}
			}
			el.children[0].innerHTML= selected;
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
        if (inputDisabled) {
            obj.disabled(true);
        }
        $ui.bindListeners(listeners, el.children[0]);
        return obj;
    };
    return $ui;
})($ui);
