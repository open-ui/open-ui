var $ui = $ui || {};
/**
Create a new slider control

HTML:

	<input id='slider' />
	
Javascript:

	$ui.slider({
		element: document.getElementById('slider'),
		units: 'mm',
		min: 30,
		max: 980, 
		value: 133
	});
	
@class $ui.slider
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control
@param [options.value=0] {Number} Initial value, defaults to the attribute value set on the passed element, or `0`
@param [options.axis=x] {String} Either `x` (horizontal) or `y` (vertical), ignored if slider is circle
@param [options.min=0] {Number} Minimum value
@param [options.max=100] {Number} Maximum value
@param [options.decimals=0] {Number} Number of decimal places
@param [options.name=ui-slider-RandInt] {String} Name of underlying input control, defaults to the attribute value set on the passed element, or `ui-slider-RandInt`
@param [options.tabindex=0] {Number} Tabindex of control, defaults to the attribute value set on the passed element, or `0`
@param [options.disabled=false] {Boolean} Disabled state of control, defaults to the attribute value set on the passed element, or `false`
@param [options.opt.listeners] {Object} Object array of event opt.listeners to bind to underlying input(s)
@param [options.circle=false] {Object} Object array of properties to define circular slider
@param [options.circle.stroke=20] {Number} Stroke width of slider circle
@param [options.circle.stroke.inner=options.circle.stroke.outer] {Number} Stroke width of inner slider circle
@param [options.circle.stroke.outer=options.circle.stroke.inner] {Number} Stroke width of outer slider circle
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function($ui) {
    $ui.slider = function(opt) {
        var el = opt.element,            
            min = opt.min || 0,
            max = opt.max || 100,
            decimals = opt.decimals || 0,
            axis = opt.axis || "x",
            range = Math.abs(max - min),
			circle = opt.circle || false;
			
			opt=$ui.inputCtrlMeta(opt, 'slider');	
			
			// circle=false;
			if(circle){			
				circle={
					stroke:circle.stroke || 20,
					start:circle.start || 0,
					length:!circle.length || circle.length===360 ? null : circle.length
				};
				circle.stroke = {
					inner:circle.stroke.inner || circle.stroke.outer || circle.stroke,
					outer: circle.stroke.outer || circle.stroke.inner || circle.stroke
				};
			}

        if (!axis || !(axis.indexOf("x") < 0 || axis.indexOf("y") < 0)) {
            axis = "x";
        }
		opt.classList="ui-slider-" + axis + " " + (opt.disabled ? 'ui-disabled' : '') + " " +(circle ? 'ui-slider-circle': '');
		opt.units = opt.units || '';

		el.innerHTML = '';
        el = $ui.replaceEl(el, $ui.compile('slider', opt));
		var monitorEl = $ui.createEl($ui.compile('slider_monitor', opt));
		var l=$ui.layout(el);
		var d = l.height > l.width ? l.width : l.height;
		function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
		  return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		  };
		}

		function describeArc(x, y, radius, startAngle, endAngle){
			endAngle = endAngle == 360 || endAngle > 360 ? 359.9 : endAngle;			
			if(circle.length){
				startAngle=endAngle-(circle.length / 2);
				endAngle=endAngle+(circle.length / 2);
			}
			return $ui.svg.arcPath(x, y, radius, startAngle, endAngle);       
		}
		var pathEl='';
		var innerTpl='';
		if(circle){	
			el.appendChild($ui.createEl($ui.compile('slider_circle', {
				width:d,
				height:d,
				x:d/2,
				y:d/2,
				cx:d/2,
				cy:d/2,
				r:((d-Math.max(circle.stroke.inner, circle.stroke.outer))/2),
				trackWidth:circle.stroke.outer,
				floatWidth:	circle.stroke.inner		
			})));
			el.appendChild(monitorEl);			
			pathEl = el.children[1].childNodes[3]; 
			$ui.attribute(pathEl, 'd', describeArc(d/2, d/2, (d-Math.max(circle.stroke.inner, circle.stroke.outer))/2, 0, 360));	
		}else{
			el.appendChild($ui.createEl($ui.compile('slider_bar', opt)));
			el.children[1].appendChild(monitorEl);
		}		
        var indicatorEl = circle ? el.children[1].childNodes[1] : el.children[1],
            inputEl = el.children[0],
            valueEl = circle ? el.children[2].children[0] : indicatorEl.children[0].children[0],
            unitsEl = circle ? el.children[2].children[1] : indicatorEl.children[0].children[1];

        /**
        Fired on slide event starting
        @event slidestart
        @param element {Object} Element event fired on
        @param event {Object} Event object
        */

        /**
        Fired on during slide event
        @event sliding
        @param element {Object} Element event fired on
        @param event {Object} Event object
        */

        /**
        Fired on slide event ending
        @event slideend
        @param element {Object} Element event fired on
        @param event {Object} Event object
        */
        if(opt.listeners){$ui.bindopt.listeners(opt.listeners, inputEl);}
        $ui.drag({
            element: el,
            contain: {
                element: el
            },
            move: false,
            listeners: {
                dragging: function(el, e) {
                    if (obj.disabled()) {
                        return false;
                    }			
					var perc=0;
				    var p =$ui.layout(el,e);
					if(circle){
						var origin={
							x:p.left+(p.width/2),
							y:p.top+(p.height/2)
						};
						if(e.pageX >= origin.x){
							perc = 90-Math.atan((origin.y-e.pageY)/(e.pageX-origin.x))*180/Math.PI;					 
						}else{					 
							perc = 180+(90-Math.atan((origin.y-e.pageY)/(e.pageX-origin.x))*180/Math.PI);
						}		
						perc=perc/360;						
					}else{
						perc = axis === "x" ? (e.dragDist.x + e.dragOffset.x) / $ui.layout(el).width : 1 - (e.dragDist.y + e.dragOffset.y) / $ui.layout(el).height;
						perc = perc < 0 ? 0 : perc;
						perc = perc > 1 ? 1 : perc;
						
					}
					obj.val(min + Math.round(perc * range));
                    if (opt.listeners && opt.listeners.sliding) {
                        opt.listeners.sliding(el, e);
                    }
                },
                dragstart: function(el, e) {
				
                    if (obj.disabled()) {
                        return false;
                    }
                    if (opt.listeners && opt.listeners.slidestart) {
                        opt.listeners.slidestart(el, e);
                    }
                    $ui.removeClass(indicatorEl, 'ui-animated');
                },
                dragend: function(el, e) {
                    if (obj.disabled()) {
                        return false;
                    }
                    if (opt.listeners && opt.listeners.slideend) {
                        opt.listeners.slideend(el, e);
                    }
                    $ui.addClass(indicatorEl, 'ui-animated');
                }
            }
        });
		
        $ui.bindEvent('click', el, function(e) {
            if (obj.disabled()) {
                return false;
            }
			var perc=0;
			if(circle){			
				var p =$ui.layout(el,e);
				var origin={
					x:p.left+(p.width/2),
					y:p.top+(p.height/2)
				};
				if(e.pageX >= origin.x){
					perc = 90-Math.atan((origin.y-e.pageY)/(e.pageX-origin.x))*180/Math.PI;					 
				}else{					 
					perc = 180+(90-Math.atan((origin.y-e.pageY)/(e.pageX-origin.x))*180/Math.PI);
				}		
				perc=perc/360;					
			}else{
				perc = axis === "x" ? ((e.clientX - el.getBoundingClientRect().left) / $ui.layout(el).width) : 1 - ((e.clientY - el.getBoundingClientRect().top) / $ui.layout(el).height);
			}
            obj.val(min + Math.round(perc * range));
        });
        $ui.bindEvent("mousewheel", el, function(e) {
            $ui.preventBubble(e);
            if (obj.disabled()) {
                return false;
            }
            var offset = 0.1;
            if (e.wheelDelta < 0 || e.detail > 0) {
                offset = offset * -1;
            }
            obj.val(range * offset + parseInt(obj.val(), 0));
        });
        /**
        Gets or sets control value
        @method val
        @param [value] {Number} Value to set
        @return {Number} Returns current value
        */

        /**
        Gets or sets control disabled state
        @method disabled
        @param [boolean] {Boolean} Disabled state
        @return {Boolean} Returns disabled state
        */
        var obj = {
            0: el,
            val: function(val, force) {
                if (val === undefined || (obj.disabled() && !force)) {
                    return inputEl.value; 
                }
                val = val < min ? min : val;
                val = val > max ? max : val;
                inputEl.value = val;
				if(circle){  
					$ui.attribute(pathEl, 'd', describeArc(d/2, d/2, (d-Math.max(circle.stroke.inner, circle.stroke.outer))/2, 0, (val - min) *360 / range));						
				}else{
					if (axis === "x") {
						indicatorEl.style.width = (val - min) * 100 / range + '%';
					} else {
						indicatorEl.style.height = (val - min) * 100 / range + '%';
					}
				}
                valueEl.innerHTML = val.toFixed(decimals);
                unitsEl.innerHTML = opt.units;
				if (opt.listeners && opt.listeners.change) {
					opt.listeners.change(el, val, inputEl);
				}
            },
            disabled: function(val) {
                if (val !== undefined) {
                    $ui.toggleClass(el, 'ui-disabled', val);
                    $ui.attribute(inputEl, 'disabled', val);
                }
                return $ui.attribute(inputEl, 'disabled');
            }
        };
        obj.val(opt.value, true);
        return obj;
    };
    return $ui;
})($ui);
