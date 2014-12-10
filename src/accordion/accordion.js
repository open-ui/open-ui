var $ui = $ui || {};
/**
Create a new accordion component from an unordered list element `<ul>` with the below structure:

HTML:

	<ul id='accordion'>
        <li>
            <h3 class='ui-content-header'>Content header</h3>
            <div class='ui-content'>
				Content to collapse
			</div>
        </li>
        <li>
            <h3 class='ui-content-header'>Content header</h3>
            <div class='ui-content'>
				Content to collapse
			</div>
        </li>
        <li>
            <h3 class='ui-content-header'>Content header</h3>
            <div class='ui-content'>
				Content to collapse
			</div>
        </li>		
    </ul>

Javascript:

	$ui.accordion({
		element: document.getElementById('accordion'),
		animate: true,
		multiple: true
	});		
		
@class $ui.accordion
@constructor
@param options {Object}
@param options.element {Object} DOM element to convert to component
@param [options.animate=true] {Boolean} Animate expand/collapse actions
@param [options.multiple=true] {Boolean} Allow multiple sections to be expanded simultaneously
@return Object {Object} Consisting of original DOM element (item `0`)
@chainable
*/

(function($ui) {
    $ui.accordion = function(opt) {
        var el = opt.element,
            anim = opt.animate === false ? false : opt.animate || true,
            multiple = opt.multiple === false ? false : opt.multiple || true;

		$ui.addClass(el, 'ui-accordion');
		
        function animHeight(tEl) {
            tEl.style.height = 'auto';
            var h = $ui.layout(tEl).height;
            tEl.style.height = '0';
            setTimeout(function() {
                tEl.style.height = h + 'px';
            }, 10);
        }

        function doLayout(tEl) {
            for (var a = 0; a < el.children.length; a++) {
                // loop through each....

                var content = el.children[a].children[1];
                // if multiple set to false and node passed, hide all other nodes
                if (tEl && el.children[a] !== tEl && multiple === false) {
                    $ui.removeClass(el.children[a], 'ui-show');
                }
                if ($ui.hasClass(el.children[a], 'ui-show')) {
                    // show...if not already shown
                    if (parseInt(content.style.height, 0) === 0 || !content.style.height) {
                        if (anim) {
                            animHeight(content);
                        } else {
                            content.style.height = 'auto';
                        }
                    }
                } else {
                    // hide
                    content.style.height = '0';
                }
            }
        }
        $ui.bindEvent('click', el, function(e) {
            if (!$ui.hasClass(e.target, 'ui-content-header')) {
                return;
            }
            $ui.toggleClass(e.target.parentNode, 'ui-show');
            doLayout(e.target.parentNode);
        });
        doLayout();
        return {
            0: el
        };
    };
    return $ui;
})($ui);
