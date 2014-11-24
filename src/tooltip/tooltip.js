var $ui = $ui || {};
/**
Class used for creating tooltips

<div class='info-well'>
The value passed to the `position` attribute is added to the tooltip as a CSS class of the format `ui-*position*`. Custom positions containing the keywords `top`, `left`, `bottom` and/or `right` can be applied to assume the relevant attributes, i.e. `bottomright`
</div>

HTML

    <span id='tooltip'>Show Tooltip</span>
	
Javascript:

	$ui.tooltip({
		element:document.getElementById('tooltip'),
		content:'Tooltip content',
		position:'left'
	});

@class $ui.tooltip
@constructor
@param options {Object}
@param options.element {Object} DOM element to apply tooltip to
@param [options.content] {String} Tooltip content (`HTML` allowed)
@param [options.position=right] {String} Tooltip position (`top`, `right`, `bottom` or `left`)
@param [options.delay=500] {Number} Time in `ms` before tooltip is shown
@return Object {Object} Returns target element (item `0`)
@chainable
*/

(function($ui) {
	var ttEl=null;
	$ui.tooltip=function(opt){
		if(!ttEl){
			ttEl=$ui.createEl("<div class='ui-tooltip'></div>");
			document.body.appendChild(ttEl);
		}
		var delay=opt.delay || 500, timer=null;
		$ui.bindEvent('mouseover', opt.element,function(){
			ttEl.innerHTML=opt.content;
			ttEl.style.display='block';				
			var tl=$ui.layout(ttEl),
				pl=$ui.layout(opt.element),
				t=0,l=0, o={x:(opt.offset ? (opt.offset.x ? opt.offset.x : 0) : 0),y:(opt.offset ? (opt.offset.y ? opt.offset.y : 0) : 0)};
			
			opt.position=opt.position || 'right';				
			ttEl.style.display='';			
			
			t=pl.top;
			l=pl.left;
			if(opt.position.indexOf("top")>-1){
				t=pl.top-tl.height;
			}else if(opt.position.indexOf("bottom")>-1){
				t=pl.top+pl.height;
			}else if(opt.position.indexOf("right")>-1){
				l=pl.left + pl.width;
			}else if(opt.position.indexOf("left")>-1){
				l=pl.left - tl.width;
			}
			
			ttEl.style.top=t+o.y+'px';
			ttEl.style.left=l+o.x+'px';
			$ui.addClass(ttEl, 'ui-'+opt.position);	
			if(!timer){
				timer = setTimeout(function(){				
					$ui.addClass(ttEl, 'ui-show');	
					clearTimeout(timer);
					timer=null;	
				},delay);
			}
			
		});
		$ui.bindEvent('mouseout', opt.element,function(){
			ttEl.innerHTML='';
			if(timer){	
				clearTimeout(timer);
				timer=null;
			}	
			$ui.removeClass(ttEl, 'ui-show');	
			$ui.removeClass(ttEl, 'ui-'+opt.position);		
		});
		return {
			0:opt.element
		};
	};
    return $ui;
})($ui);
