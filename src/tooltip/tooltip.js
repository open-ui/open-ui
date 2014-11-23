var pk = pk || {};
/**
Class used for creating tooltips

<div class='info-well'>
The value passed to the `position` attribute is added to the tooltip as a CSS class of the format `oui-*position*`. Custom positions containing the keywords `top`, `left`, `bottom` and/or `right` can be applied to assume the relevant attributes, i.e. `bottomright`
</div>

HTML

    <span id='tooltip'>Show Tooltip</span>
	
Javascript:

	oui.tooltip({
		element:document.getElementById('tooltip'),
		content:'Tooltip content',
		position:'left'
	});

@class oui.tooltip
@constructor
@param options {Object}
@param options.element {Object} DOM element to apply tooltip to
@param [options.content] {String} Tooltip content (`HTML` allowed)
@param [options.position=right] {String} Tooltip position (`top`, `right`, `bottom` or `left`)
@param [options.delay=500] {Number} Time in `ms` before tooltip is shown
@return Object {Object} Returns target element (item `0`)
@chainable
*/

(function(pk) {
	var ttEl=null;
	oui.tooltip=function(opt){
		if(!ttEl){
			ttEl=oui.createEl("<div class='oui-tooltip'></div>");
			document.body.appendChild(ttEl);
		}
		var delay=opt.delay || 500, timer=null;
		oui.bindEvent('mouseover', opt.element,function(){
			ttEl.innerHTML=opt.content;
			ttEl.style.display='block';				
			var tl=oui.layout(ttEl),
				pl=oui.layout(opt.element),
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
			oui.addClass(ttEl, 'oui-'+opt.position);	
			if(!timer){
				timer = setTimeout(function(){				
					oui.addClass(ttEl, 'oui-show');	
					clearTimeout(timer);
					timer=null;	
				},delay);
			}
			
		});
		oui.bindEvent('mouseout', opt.element,function(){
			ttEl.innerHTML='';
			if(timer){	
				clearTimeout(timer);
				timer=null;
			}	
			oui.removeClass(ttEl, 'oui-show');	
			oui.removeClass(ttEl, 'oui-'+opt.position);		
		});
		return {
			0:opt.element
		};
	};
    return pk;
})(pk);
