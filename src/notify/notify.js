var oui = oui || {};
/**
Class used for notification management

HTML

    <button onclick="showNotification();">Show Notification</button>

Javascript:

	function showNotification(){
		oui.notify.push({
			content:'Default message'
		});
	}

@class oui.notify
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
(function(oui) {
    var nEl = oui.createEl("<ul class='oui-notify'></ul>");
    document.body.appendChild(nEl);
    oui.notify = {
        add: function(opt) {
            var mEl = oui.createEl("<li tabindex='" + oui.getRand(1, 999) + "'>" + opt.content + "</li>"),
                delay = opt.delay || 8000;
            nEl.appendChild(mEl);
            setTimeout(function() {
                oui.addClass(mEl, 'oui-show');
            }, 10);
            var scope = this;
            setTimeout(function() {
                scope.remove(mEl);
            }, delay);

            oui.bindEvent('click', mEl, function() {
                scope.remove(mEl);
            });
            return {
                0: mEl
            };
        },
        remove: function(dEl) {
            if (!oui.hasClass(dEl, 'oui-show')) {
                return;
            }
            oui.removeClass(dEl, 'oui-show');
            setTimeout(function() {
                if (dEl) {
                    nEl.removeChild(dEl);
                }
            }, 1000);
        }
    };
})(oui);
