var $ui = $ui || {};
/**
Class used for notification management

HTML

    <button onclick="showNotification();">Show Notification</button>

Javascript:

	function showNotification(){
		$ui.notify.push({
			content:'Default message'
		});
	}

@class $ui.notify
@static
*/

/**
Create a new notification
@method add
@param options {Object}
@param [options.content] {String} Notification content (`HTML` allowed)
@param [options.delay=8000] {Number} Time in `ms` for notificaiton to display for
@return Object {Object} Returns notification element (item `0`)
*/

/**
Remove a notification
@method remove
@param element {Object} Notification element to remove
*/
(function($ui) {
    $ui.notify = {
        add: function(opt) {
		 
			var nEl = document.getElementById('ui-notify');
			if(!nEl){
				nEl = $ui.createEl($ui.compile('notify'));
				document.body.appendChild(nEl);
			}
		
            var mEl = $ui.createEl($ui.compile('notify_item', {tabindex:$ui.getRand(1, 999), content:opt.content})),
                delay = opt.delay || 8000; 
            nEl.appendChild(mEl);
            setTimeout(function() {
                $ui.addClass(mEl, 'ui-show');
            }, 10);
            var scope = this;
            setTimeout(function() {
                scope.remove(mEl);
            }, delay);

            $ui.bindEvent('click', mEl, function() {
                scope.remove(mEl);
            });
            return {
                0: mEl
            };
        },
        remove: function(dEl) {
			var nEl = document.getElementById('ui-notify');
            if (!$ui.hasClass(dEl, 'ui-show')) {
                return;
            }
            $ui.removeClass(dEl, 'ui-show');
            setTimeout(function() {
                if (dEl) {
                    nEl.removeChild(dEl);
                }
            }, 1000);
        }
    };
})($ui);
