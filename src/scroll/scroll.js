var $ui = $ui || {};
/**
Attach custom scrollbars to an element

HTML:

	<div id='scroll'>
		...long content....
    </div>
	
Javascript:

	$ui.scroll({
		element: document.getElementById('scroll'),
		axis: 'xy'
	});
	
@class $ui.scroll
@constructor
@param options {Object}
@param options.element {Object} DOM element to attach drag handlers to
@param [options.sensitivity=60] {Number} Number in px to scroll incrementally on `mousewheel` and `key` events. Can also be expressed as percentage, e.g. `10%` of content
@param [options.axis=y] {Object} Object consisting of `x` and `y` {Boolean} values denoting scrollable axis, DOM element to attach drag handlers to. Defaults to element attribute `ui-scroll` or `y`
@return Object {Object} Consisting of original DOM element (item `0`)
@chainable
*/
(function($ui) {
    // HELPERS FOR jQUERY+ANGULAR
    if (typeof jQuery === 'object') {
        // jquery available
        jQuery.fn.extend({
            $uiScroll: function(axis) {
                $ui.scroll({
                    element: this[0],
                    axis: axis
                });
            }
        });
    }
    if (typeof angular === 'object') {
        // angular available
        ( 

            function() {
                angular.module('ui-scroll', ['ng'])
                    .directive('$uiScroll', function() {
                        return {
                            restrict: 'A',
                            link: function(scope, el) {
                                $ui.scroll({
                                    element: el[0],
                                    axis: el[0].getAttribute('ui-scroll')
                                });
                            }
                        };
                    });
            })();
    }
    $ui.scroll = function(opt) {

        var el = opt.element,
			sensitivity=60,
			floatYh = 0,
            floatXw = 0,
            allowY = false,
            allowX = false,
            percY = 0,
            percX = 0,
            contentH = 0,
            contentW = 0,
            containerH = 0,
            containerW = 0,
            contentWidth = 0,
            contentHeight = 0,
            containerWidth = 0,
            containerHeight = 0,
            scrollDir = opt.axis ? opt.axis.toLowerCase() : ($ui.attribute(el, 'ui-scroll') ? $ui.attribute(el, 'ui-scroll') : "y");
		el.innerHTML='';
        el = $ui.replaceEl(el, $ui.compile('scroll', {nodeName:el.nodeName, html:el.innerHTML}));
        var container = el.children[0],
            trackY = el.children[1],
            floatY = trackY.children[0],
            trackX = el.children[2],
            floatX = trackX.children[0];
			
        if ($ui.getStyle(el, 'position') === "static") {
            el.style.position = "relative";
        }

        $ui.bindEvent("scroll", container, function() {
            percY = container.scrollTop / (contentH - containerH);
            percX = container.scrollLeft / (contentW - containerW);
            percY = percY < 0 ? 0 : percY > 1 ? 1 : percY;
            percX = percX < 0 ? 0 : percX > 1 ? 1 : percX;
            floatY.style.top = (containerH - floatYh) * percY + 'px';
            floatX.style.left = (containerW - floatXw) * percX + 'px';
        });
		
		$ui.bindEvent("scroll", el, function(e){
			container.scrollTop=el.scrollTop;
			container.scrollLeft=el.scrollLeft;
			$ui.preventBubble(e);
		});
		

        function resolveDimensions() {
            contentH = container.scrollHeight;
            contentW = container.scrollWidth;
            containerH = el.offsetHeight;
            containerW = el.offsetWidth;
            if (scrollDir.indexOf("y") > -1 && contentH > containerH) {
                allowY = true;
                $ui.addClass(el, 'ui-scroll-enableY');
                floatYh = floatY.offsetHeight;
                container.scrollTop = (contentH - containerH) * percY;
            } else {
                allowY = false;
                $ui.removeClass(el, 'ui-scroll-enableY');
                container.scrollTop = 0;
            }
            if (scrollDir.indexOf("x") > -1 && contentW > containerW) {
                allowX = true;
                $ui.addClass(el, 'ui-scroll-enableX');
                floatXw = floatX.offsetWidth;
                container.scrollLeft = (contentW - containerW) * percX;
            } else {
                allowX = false;
                $ui.removeClass(el, 'ui-scroll-enableX');
                container.scrollLeft = 0;
            }
        }
        resolveDimensions();

        setInterval(function() {
            var widthContainer = el.offsetWidth,
                heightContainer = el.offsetHeight,
                widthContent = container.scrollWidth,
                heightContent = container.scrollHeight;
            if (widthContainer !== containerWidth || heightContainer !== containerHeight || widthContent !== contentWidth || heightContent !== contentHeight) {
                contentWidth = widthContent;
                contentHeight = heightContent;
                containerWidth = widthContainer;
                containerHeight = heightContainer;
                resolveDimensions();
            }
        }, 100);

        // DRAG HANDLERS

        if (allowY) {
            $ui.drag({
                element: floatY,
                move: {
                    y: true
                },
                container: {
                    element: trackY
                },
                listeners: {
                    dragging: function() {
                        container.scrollTop = (contentH - containerH) * (floatY.offsetTop / (trackY.offsetHeight - floatY.offsetHeight));
                    }
                }
            });
        }
        if (allowX) {
            $ui.drag({
                element: floatX,
                move: {
                    x: true
                },
                container: {
                    element: trackX
                },
                listeners: {
                    dragging: function() {

                        container.scrollLeft = (contentW - containerW) * (floatX.offsetLeft / (trackX.offsetWidth - floatX.offsetWidth));
                    }
                }
            });
        }
        $ui.bindEvent("click", floatY, function(e) {
            $ui.preventBubble(e);
        });
        $ui.bindEvent("click", floatX, function(e) {
            $ui.preventBubble(e);
        });

        // TRACK CLICKING HANDLERS
        $ui.bindEvent("click", trackY, function(e) {
            container.scrollTop = ($ui.getEventOffset(e).y / containerH * (contentH - containerH));
        });
        $ui.bindEvent("click", trackX, function(e) {
            container.scrollLeft = ($ui.getEventOffset(e).x / containerW * (contentW - containerW));
        });

        // MOUSE WHEEL HANDLERS
        function mouseScroll(e) {
            if (e.wheelDelta > 0 || e.detail < 0) {
				if (allowY) {
					container.scrollTop -= typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerH * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;			
				} else {
					container.scrollLeft -= typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerW * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;			
				}
            }else if (allowY) {
					container.scrollTop += typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerH * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;			
			} else {
				container.scrollLeft += typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerW * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;			
			}
            /* Stop wheel propogation (prevent parent scrolling) */
            $ui.preventBubble(e);
        }

        $ui.bindEvent("mousewheel", container, mouseScroll);

        // TOUCH EVENT HANDLERS

        function getXy(e) {
            // touch event
            if (e.targetTouches && (e.targetTouches.length >= 1)) {
                return {
                    x: e.targetTouches[0].clientX,
                    y: e.targetTouches[0].clientY
                };
            }
            // mouse event
            return {
                x: e.clientX,
                y: e.clientY
            };
        }

        var pressed = false,
            startPos = {};

        function tap(e) {
            pressed = true;
            startPos = getXy(e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        function release(e) {
            pressed = false;
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        function drag(e) {
            var endPos, deltaX, deltaY;
            if (pressed) {
                endPos = getXy(e);
                deltaY = startPos.y - endPos.y;
                deltaX = startPos.x - endPos.x;
                if (deltaY > 2 || deltaY < -2) {
                    startPos.y = endPos.y;
                    container.scrollTop += deltaY;

                }
                if (deltaX > 2 || deltaX < -2) {
                    startPos.x = endPos.x;
                    container.scrollLeft += deltaX;
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        if (typeof window.ontouchstart !== 'undefined') {
            $ui.bindEvent('touchstart', container[0], tap);
            $ui.bindEvent('touchmove', container[0], drag);
            $ui.bindEvent('touchend', window, release);
        }

        // KEYBOARD HANDLERS    
        container.setAttribute("tabindex", 0);
        $ui.bindEvent('keydown', container, function(e) {
            if (document.activeElement !== container) {
                return;
            }
            if (allowY) {
                switch (e.keyCode) {
                    case 38: //up cursor						
                        container.scrollTop -= typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerH * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;
                        $ui.preventBubble(e);
                        break;
                    case 40: //down cursor
                    case 32: //spacebar
                        container.scrollTop += typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerH * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;
                        $ui.preventBubble(e);
                        break;
                    case 33: //page up
                        container.scrollTop -= containerH;
                        $ui.preventBubble(e);
                        break;
                    case 34: //page down
                        container.scrollTop += containerH;
                        $ui.preventBubble(e);
                        break;
                    case 36: //home
                        container.scrollTop = 0;
                        $ui.preventBubble(e);
                        break;
                    case 35: //end
                        container.scrollTop = contentH;
                        $ui.preventBubble(e);
                        break;
                }
            }
            if (allowX) {
                switch (e.keyCode) {
                    case 37: //left cursor
                        container.scrollLeft -= typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerW * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;
                        $ui.preventBubble(e);
                        break;
                    case 39: //right cursor
                        container.scrollLeft += typeof sensitivity === 'string' && sensitivity.indexOf('%') ?  containerW * parseInt(sensitivity.replace('%',''),0)/100 : sensitivity;
                        $ui.preventBubble(e);
                        break;
                }
            }
            return {
                0: el
            };

        });
    };
    return $ui;
})($ui);
