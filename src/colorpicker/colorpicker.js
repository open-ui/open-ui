var $ui = $ui || {};
/**
Create a new colorpicker control

HTML

	<div id='colorpicker'></div>

Javascript:

	$ui.colorpicker({
		element: document.getElementById('colorpicker'),
		value:'#FF0000',
		listeners:{
			change:function(oldCol,newCol){
				// do something
			}
		}
	});
	
@class $ui.colorpicker
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to control 
@param [options.value=#000000] {String} HEX string of initially selected color, defaults black `#000000`
@param [options.listeners] {Object} Object array of event listeners to bind (nb. only detects `change` event)
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function($ui) {
    $ui.colorpicker = function(opt) {


        var type = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML"),
            listeners = opt.listeners === undefined ? {} : opt.listeners,
            el = opt.element,
            value = opt.value || '#000000';

        el = $ui.replaceEl(el, $ui.compile('colorpicker'));
        var areaTpl, areaEl, rangeTpl, rangeEl;
        if (type === 'SVG') {            
			areaEl = $ui.createEl($ui.compile('colorpicker_svg_sl'));
			rangeEl = $ui.createEl($ui.compile('colorpicker_svg_h'));
        } else if (type === 'VML') {            
			areaEl = $ui.createEl($ui.compile('colorpicker_vml_sl'));
			rangeEl = $ui.createEl($ui.compile('colorpicker_vml_h'));
            if (!document.namespaces.v) {
                document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
            }
        }

        el.children[0].appendChild(areaEl);
        el.children[1].appendChild(rangeEl);

        var lightnessEl = el.children[0].children[0];
        var hueEl = el.children[1].children[0];

        var hsv = {
            h: 0,
            s: 0,
            v: 0
        };
        var color = '#ffffff';

        function resolvePos(rEl, c) {
            var x = c.x,
                y = c.y,
                pEl = rEl.parentNode,
                pH = $ui.layout(pEl).height,
                pW = $ui.layout(pEl).width,
                h = $ui.layout(rEl).height,
                w = $ui.layout(rEl).width,
                prevCol = color;

            if (x) {
                if (c.x < 0) {
                    c.x = 0;
                } else if (c.x > 1) {
                    c.x = 1;
                }
                x = x * pW;
                if (x < 0 - w / 2) {
                    x = -1 * w / 2;
                } else if (x > pW - w / 2) {
                    x = pW - w / 2;
                }
                rEl.style.left = x + 'px';
            }
            if (y) {
                if (c.y < 0) {
                    c.y = 0;
                } else if (c.y > 1) {
                    c.y = 1;
                }
                y = y * pH;
                if (y < 0 - h / 2) {
                    y = -1 * h / 2;
                } else if (y > pH - h / 2) {
                    y = pH - h / 2;
                }
                rEl.style.top = y + 'px';
            }

            if (rEl === lightnessEl) {
                hsv.s = Math.round(c.x * 100);
                hsv.v = Math.round((1 - c.y) * 100);
                color = $ui.color.hsv2hex([hsv.h, hsv.s, hsv.v]);
            }
            if (rEl === hueEl) {
                hsv.h = Math.round(c.y * 360);
                color = $ui.color.hsv2hex([hsv.h, hsv.s, hsv.v]);
                lightnessEl.parentNode.style.backgroundColor = $ui.color.hsv2hex([hsv.h, 100, 100]);
            }
            if (listeners.change && typeof listeners.change === 'function') {
                listeners.change(prevCol, color);
            }
        }
        $ui.bindEvent('click', lightnessEl.parentNode, function(e) {
            if (e.target === lightnessEl) {
                return;
            }
            resolvePos(lightnessEl, {
                x: ($ui.getEventOffset(e).x - $ui.layout(lightnessEl).width / 2) / $ui.layout(lightnessEl.parentNode).width,
                y: ($ui.getEventOffset(e).y - $ui.layout(lightnessEl).height / 2) / $ui.layout(lightnessEl.parentNode).width
            });
        });
        $ui.bindEvent('click', hueEl.parentNode, function(e) {
            if (e.target === hueEl) {
                return;
            }
            resolvePos(hueEl, {
                x: false,
                y: $ui.getEventOffset(e).y / $ui.layout(hueEl.parentNode).height
            });
        });
        $ui.drag({
            element: hueEl.parentNode,
            move: false,
            container: {
                element: hueEl.parentNode
            },
            listeners: {
                dragging: function(el, e) {
                    resolvePos(hueEl, {
                        x: false,
                        y: e.dragPerc.y
                    });
                }
            }
        });

        $ui.drag({
            element: lightnessEl.parentNode,
            move: false,
            container: {
                element: lightnessEl.parentNode
            },
            listeners: {
                dragging: function(el, e) {
                    resolvePos(lightnessEl, e.dragPerc);
                }
            }
        });
        /**
        Fired on selected color changing (click, drag)
        @event change
        @param oldColor {String} HEX color string of previous color
        @param newColor {String} HEX color string of new color
        */

        /**
        Gets or sets control value (HEX color string, e.g. `#000000`)
        @method val
        @param [value] {String} Value to set
        @return {String} Returns current value
        */

        var obj = {
            0: el,
            val: function(val) {
                if (!val) {
                    return color;
                }
                var hsvArr = $ui.color.hex2hsv(val);
                hsv = {
                    h: hsvArr[0],
                    s: hsvArr[1],
                    v: hsvArr[2]
                };
                resolvePos(hueEl, {
                    x: false,
                    y: hsv.h / 360
                });
                resolvePos(lightnessEl, {
                    x: hsv.s / 100,
                    y: 1 - (hsv.v / 100)
                });
            }
        };
        obj.val(value);
        return obj;

    };
    return $ui;
})($ui);
