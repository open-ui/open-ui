var oui = oui || {};
/**
Create a new carousel component from an unordered list element `<ul>`

HTML:

    <ul id='carousel'>
        <li>Slide 1</li>
        <li>Slide 2</li>
        <li>Slide 3</li>
    </ul>

Javascript:
	
	oui.carousel({
		element: document.getElementById('carousel'),
		delay:5000
	});

@class oui.carousel
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to component
@param [options.value=0] {Number} Starting item index
@param [options.tabindex=0] {Number} Tabindex of component, defaults to the attribute value set on the passed element, or `0`
@param [options.delay=4000] {Number} Delay in `ms` between item changes
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/
(function(oui) {
    oui.carousel = function(opt) {
        var el = opt.element,
            options = opt.options || [],
            value = opt.value || 0,
            delay = opt.delay || 4000,
            timer = true,
            inputTabIndex = opt.tabindex || el.getAttribute('tabindex') || 0;

        if (options.length === 0 && el.nodeName === "UL") {
            for (var i = 0; i < el.children.length; i++) {
                options.push(el.children[i].innerHTML);
            }
        }
        var tpl = "<div class='oui-carousel' tabindex='" + inputTabIndex + "'><ul>",
            navEl = [],
            optionEl = [];
        for (var o = 0; o < options.length; o++) {
            optionEl.push(oui.createEl("<li class='oui-option'>" + options[o] + "</li>"));
            navEl.push(oui.createEl("<span class='oui-nav-item' data-nav='=" + o + "'>" + o + "</span>"));
        }
        tpl += "</ul><span class='oui-nav-prev' data-nav='-1'></span><span data-nav='+1' class='oui-nav-next'></span></div>";

        el.innerHTML = '';
        el = oui.replaceEl(el, tpl);
        for (o = 0; o < options.length; o++) {
            el.children[0].appendChild(optionEl[o]);
            el.appendChild(navEl[o]);
        }

        function clickHandler(e) {
            obj.val(oui.attribute(e.target, 'data-nav'));
        }
        for (var c in el.children) {
            if (oui.attribute(el.children[c], 'data-nav')) {
                oui.bindEvent('click', el.children[c], clickHandler);
            }
        }

        oui.bindEvent("mousewheel", el, function(e) {
            oui.preventBubble(e);
            obj.val((e.wheelDelta < 0 || e.detail > 0) ? '-1' : '+1');
        });

        oui.bindEvent('keydown', el, function(e) {
            if (document.activeElement !== el) {
                return;
            }
            switch (e.keyCode) {
                case 34: //page down
                case 40: //down cursor
                case 37: //left cursor
                    obj.val('-1');
                    oui.preventBubble(e);
                    break;
                case 33: //page up
                case 32: //spacebar				
                case 38: //up cursor
                case 39: //right cursor
                    obj.val('+1');
                    oui.preventBubble(e);
                    break;
                case 36: //home
                    obj.val(0);
                    oui.preventBubble(e);
                    break;
                case 35: //end
                    obj.val(options.length - 1);
                    oui.preventBubble(e);
                    break;
            }
        });
        var oldVal;
        /**
        Gets or sets control item
        @method val
        @param [value] {Number} Item index to set
        @return {Number} Returns current item index
        */
        var obj = {
            0: el,
            val: function(val) {
                val = val.toString();
                if (val === undefined) {
                    return value;
                }
                var inClass = '',
                    outClass = '';
                if (val.indexOf("-") !== -1) {
                    value = value - parseInt(val.replace('-', ''), 0) < 0 ? options.length - 1 : --value;
                    inClass = 'left';
                    outClass = 'right';
                } else if (val.indexOf("+") !== -1) {
                    value = value + parseInt(val.replace('+', ''), 0) > options.length - 1 ? 0 : ++value;
                    inClass = 'right';
                    outClass = 'left';
                } else {
                    value = parseInt(val.replace('=', ''), 0);
                    value = value < 0 ? 0 : value > options.length - 1 ? options.length - 1 : value;
                    if (oldVal !== undefined && value > oldVal) {
                        inClass = 'right';
                        outClass = 'left';
                    } else {
                        inClass = 'left';
                        outClass = 'right';
                    }
                }
                for (o = 0; o < options.length; o++) {
                    if (oldVal !== undefined && oldVal === o) {
                        oui.addClass(optionEl[o], 'oui-carousel-out-' + outClass);
                    } else if (oldVal !== undefined) {
                        oui.removeClass(optionEl[o], 'oui-carousel-out-left');
                        oui.removeClass(optionEl[o], 'oui-carousel-out-right');
                    }
                    if (parseInt(o, 0) === value) {
                        // add the selected class to the current iteration					
                        oui.addClass(optionEl[o], 'oui-selected');
                        oui.addClass(navEl[o], 'oui-selected');
                        if (oldVal !== undefined) {
                            oui.addClass(optionEl[o], 'oui-carousel-in-' + inClass);
                        }
                    } else {
                        oui.removeClass(optionEl[o], 'oui-selected');
                        oui.removeClass(optionEl[o], 'oui-carousel-in-right');
                        oui.removeClass(optionEl[o], 'oui-carousel-in-left');
                        oui.removeClass(navEl[o], 'oui-selected');
                    }
                }
                oldVal = value;
                timer = false;
                return value;
            }
        };
        obj.val(value);

        if (delay) {
            setInterval(function() {
                if (timer) {
                    obj.val('+1');
                }
                timer = true;
            }, delay);
        }

        return obj;
    };
    return oui;
})(oui);
