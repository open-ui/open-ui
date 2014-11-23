var oui = oui || {};

/**
Create a new modal component

HTML:

	<button onclick="showModal();">Show Modal</button>

Javascript: 

	function showModal(){
		oui.modal({
			header:'Modal header',
			content:'Modal content', 
			draggable:true
		});
	}

@class oui.modal
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to component
@param [options.header] {String} Modal header content (`HTML` allowed)
@param [options.content] {String} Modal body content (`HTML` allowed)
@param [options.draggable] {Boolean} Whether to allow modal dragging
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/

(function(oui) {
    oui.modal = function(opt) {
        var h = opt.header,
            c = opt.content;
        /*jshint multistr: true */
        var tpl = "<div class='oui-modal-mask'>\
			<div class='oui-modal-box oui-animated'>\
				<div class='oui-modal-header'>" + h + "<span class='oui-modal-close'></span></div>\
				<div class='oui-modal-content'>" + c + "</div>\
			</div>\
		</div>";

        var el = oui.createEl(tpl),
            box = el.children[0],
            header = box.children[0],
            close = header.children[0];

        if (document.body.children.length > 0) {
            document.body.insertBefore(el, document.body.children[0]);
        } else {
            document.body.appendChild(el);
        }

        function closeModal() {
            oui.removeClass(el, 'oui-show');
            setTimeout(function() {
                el.parentNode.removeChild(el);
            }, 500);
        }
        oui.bindEvent("click", el, function(e) {
            if (e.target !== el) {
                return;
            }
            closeModal();
        });
        oui.bindEvent("click", close, closeModal);
        oui.bindEvent("resize", window, function() {
            oui.center(box);
        });
        setTimeout(function() {
            oui.addClass(el, 'oui-show');
        }, 10);

        var boxH = box.offsetHeight || 0;
        setInterval(function() {
            var boxHN = box.offsetHeight;
            if (boxH !== boxHN) {
                oui.center(box);
                boxH = boxHN;
            }
        }, 500);
        oui.center(box);

        if (opt.draggable !== false && oui.drag) {
            oui.drag({
                element: box,
                handle: header,
                move: true,
                listeners: {
                    dragstart: function() {
                        oui.removeClass(box, 'oui-animated');
                    },
                    dragend: function() {
                        oui.addClass(box, 'oui-animated');
                    }
                }
            });
        }
        /**
        Closes modal and removes from DOM
        @method close
        */
        return {
            0: el,
            close: closeModal
        };
    };
    return oui;
})(oui);
