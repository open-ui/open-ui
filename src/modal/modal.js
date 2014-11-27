var $ui = $ui || {};

/**
Create a new modal component

HTML:

	<button onclick="showModal();">Show Modal</button>

Javascript: 

	function showModal(){
		$ui.modal({
			header:'Modal header',
			content:'Modal content', 
			draggable:true
		});
	}

@class $ui.modal
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to component
@param [options.header] {String} Modal header content (`HTML` allowed)
@param [options.content] {String} Modal body content (`HTML` allowed)
@param [options.draggable] {Boolean} Whether to allow modal dragging
@return Object {Object} Consisting of original DOM element (item `0`) and class methods (see below)
@chainable
*/

(function($ui) {
    $ui.modal = function(opt) {

        var el = $ui.createEl($ui.compile('modal',opt)),
            box = el.children[0],
            header = box.children[0],
            close = header.children[0];

        if (document.body.children.length > 0) {
            document.body.insertBefore(el, document.body.children[0]);
        } else {
            document.body.appendChild(el);
        }

        function closeModal() {
            $ui.removeClass(el, 'ui-show');
            setTimeout(function() {
                el.parentNode.removeChild(el);
            }, 500);
        }
        $ui.bindEvent("click", el, function(e) {
            if (e.target !== el) {
                return;
            }
            closeModal();
        });
        $ui.bindEvent("click", close, closeModal);
        $ui.bindEvent("resize", window, function() {
            $ui.center(box);
        });
        setTimeout(function() {
            $ui.addClass(el, 'ui-show');
        }, 10);

        var boxH = box.offsetHeight || 0;
        setInterval(function() {
            var boxHN = box.offsetHeight;
            if (boxH !== boxHN) {
                $ui.center(box);
                boxH = boxHN;
            }
        }, 500);
        $ui.center(box);

        if (opt.draggable !== false && $ui.drag) {
            $ui.drag({
                element: box,
                handle: header,
                move: true,
                listeners: {
                    dragstart: function() {
                        $ui.removeClass(box, 'ui-animated');
                    },
                    dragend: function() {
                        $ui.addClass(box, 'ui-animated');
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
    return $ui;
})($ui);
