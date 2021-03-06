var $ui = $ui || {};
/**
Create a new chart component

HTML

	<div id='chart'></div>

Javascript:

	$ui.chart({
		element: document.getElementById('chart'),
		type:'pie',
		data: [
			{category:"cat",series1:8, series2:2},
			{category:"pig",series1:2, series2:6},
			{category:"cow",series1:9, series2:9},
			{category:"bird",series1:5, series2:2},
			{category:"dog",series1:2, series2:7},
			{category:"emu",series1:6, series2:3},
			{category:"hamster",series1:2, series2:3}
		],
		center:20,
		legend:true,
		axis:{
			x:'category'
		},
		series: ['series1', 'series2']
	});
	
@class $ui.chart
@constructor 
@beta
@param type {String} Chart type to create, `pie` (use to create donut charts), `line`, `scatter` (use to create bubble charts), `area`, `column` or `bar`
@param [center=0] {Number} If chart type `pie`, the inner radius to create a donut chart, expressed as a percentage of diameter (`2*r`)
@param data {Object} Object array of data to use for the chart
@param axis {Object} Object keys in data to use for `x` and `y` axes
@param axis.x {String} Object keys in data to use for `x` axis
@param [axis.y] {String} Object keys in data to use for `y` axis, marked optional as not required for `pie` charts
@param [axis.r=false] {String} String denoting object key in data to use for point radius, can be set to number
@param series {Array} Object keys in data used for series designation - only an Array for `pie` charts, string for all other types
@param [margin] {Object} Object of `top`, `right`, `left` and `bottom` margin amounts in pixels. Defaults to `20,20,50,20`
@param [gridlines=true] {Boolean} Show gridlines for chart types other than `pie`
@param [colors] {Object} Object key value pairs where the key is a series name, the value is the value to use
@param [legend] {Function} Custom function responsible for building chart legend, defaults to default constructor if not passed
@param [tooltip=false] {Function} Custom function responsible for building chart legend, defaults to default constructor if not passed

@chainable
*/
(function($ui) {
    $ui.chart = function(opt) {
        var el=$ui.replaceEl(opt.element, "<div class='ui-chart'></div>", true),
			l=$ui.layout(el),
			svgEl=$ui.createEl("<svg />"),
			axesEl=$ui.createEl("<g class='ui-axes' />"),
			data=opt.data || [],
			series=opt.series,
			seriesMeta={},
			axesMeta={x:{data:[], sum:0},y:{data:[], sum:0}, r:{data:[], sum:0}},
			axis=opt.axis,
			gridlines=opt.gridlines !== true ? false : true,
			d = l.height > l.width ? l.width : l.height,
			stroke= opt.center ? (d/2)-(d*((opt.center/2) /100)) : d/2,
			colors=opt.colors || {},
			type=opt.type,
			s=null, i=null, r=0, sIndex=0,
			margin={
				top:opt.margin && typeof opt.margin.top === 'number' ? opt.margin.top : 20,
				right:opt.margin && typeof opt.margin.right === 'number' ? opt.margin.right : 20,
				bottom:opt.margin && typeof opt.margin.bottom === 'number' ? opt.margin.bottom : 50,
				left:opt.margin && typeof opt.margin.left === 'number' ? opt.margin.left : 20,
				series:0,
				category:10
			},
			legendEl=$ui.createEl("<div class='ui-legend'></div>"), 
			legend=typeof opt.legend==='function'?opt.legend:!opt.legend ? false : function(mInf){

				if(type==='pie'){
					$ui.addClass(legendEl, 'ui-table');
					if(series.length > 1){
						var hTpl="<div class='ui-row ui-legend-header'><div class='ui-legend-category ui-cell'></div>";
						for(var e=0;e<series.length;e++){
							hTpl+="<div class='ui-cell ui-legend-series'>"+series[e]+"</div>";
						}
						legendEl.innerHTML+=hTpl+"</div>";
					}
					
					for(var c in mInf){
						var sI=0;
						var lTpl="<div class='ui-row ui-legend-entry'>";					
						if(series.length > 1){
							lTpl+="<div class='ui-cell ui-legend-category'>"+c+":</div>";
						}
						for(s in mInf[c]){ 
							lTpl+="<div class='ui-cell ui-legend-series' data-rel='"+('rel'+s+c).replace(' ' ,'')+"'><span class='ui-indicator' style='border-color:"+mInf[c][s].color+";background-color:"+mInf[c][s].color+";' data-rel='"+('rel'+s).replace(' ' ,'')+"'></span>"+mInf[c][s].percentage+"%"+"</div>";
							sI++;
						}   
						if(series.length === 1){
							lTpl+="<div class='ui-cell ui-legend-category'>"+c+"</div>";
						}
						lTpl+="</div>"; 
						legendEl.innerHTML+=lTpl;	 
					}	
					$ui.addClass(el, (l.height >= l.width ? "ui-legend-bottom" : "ui-legend-right")); 
	
				}else{
					for(s in mInf){
						legendEl.innerHTML+= "<div class='ui-legend-series' data-rel='"+('rel'+s).replace(' ' ,'')+"'><span class='ui-indicator' style='border-color:"+colors[s]+";background-color:"+colors[s]+";' data-rel='"+('rel'+s).replace(' ' ,'')+"'></span>"+s+"</div>";						
					}					
				}
				
			},
			tooltip=typeof opt.tooltip==='function'?opt.tooltip:!opt.tooltip ? false : function(tEl, tInf, tO){
				$ui.tooltip({element:tEl, content:tInf.series + ', '+tInf.values.x + ': '+tInf.values.y, position:'top',offset:{x:tO.x}});
			};

		 
		if(data.length===0){return;}	

		// calculate composite margins for ease of use
		margin.x=margin.left+margin.right;
		margin.y=margin.top+margin.bottom;
		
		$ui.addClass(el, 'ui-'+type+'-chart');
			
		data.sort(function(a,b) {return (a[axis.x] > b[axis.x]) ? 1 : ((b[axis.x] > a[axis.x]) ? -1 : 0);} );		
		
		$ui.bindEvent('mouseover', el, function(e){		
			if($ui.attribute(e.target, 'data-rel')){
				var hIt=$ui.findEl(el, {attribute:{name:'data-rel', value:$ui.attribute(e.target, 'data-rel')}});	
				for(h=0;h<hIt.length;h++){							
					$ui.addClass(hIt[h], 'selected'); 
				}	
			}				
		});
		$ui.bindEvent('mouseout', el, function(e){
			if($ui.attribute(e.target, 'data-rel')){
				var hIt=$ui.findEl(el, {attribute:{name:'data-rel', value:$ui.attribute(e.target, 'data-rel')}});	
				for(h=0;h<hIt.length;h++){							
					$ui.removeClass(hIt[h], 'selected'); 
				}	 
			}
		});		
		
		
		$ui.attribute(svgEl, {height:'100%', width:'100%', 'viewBox':'0 0 '+(type==='pie' ? d : l.width)+' '+(type==='pie' ? d : l.height)});

		
		function drawAxis(xy, type){
			// Draw AXES
			// Series of .5 pt adjustments to create crisp edges in IE
			var svgTpl="";
			if(xy==='x'){
				svgTpl="<g class='ui-xAxis' transform='translate("+margin.left+","+(l.height-margin.bottom+0.5)+")'>\
						<line x2='"+(l.width-margin.x)+"'></line>";												 
					for(t=0;t<=axesMeta.x.range;t++){
						svgTpl+="<g class='tick' transform='translate("+(Math.floor((t*axesMeta.x.unit)+(type==='categorical' ? axesMeta.x.unit: 0))+0.5)+", 0)'>\
							<line y2='5'></line>";
							if(gridlines && (t>0 || type==='categorical')){svgTpl+="<line class='ui-tick-line' y2='"+(-1*(l.height-margin.y-1))+"'></line>";}							
							svgTpl+="<text "+ (type==='categorical' ? "x='-"+(axesMeta.x.unit/2) : "")+"' y='17' y='4' text-anchor='middle'>"+(type==='ordinal' ? (t+axesMeta.x.min) : axesMeta.x.data[t])+"</text>\
						</g>";					
					} 
					svgTpl+="</g>";
			}else if(xy==='y'){
				svgTpl="<g class='ui-yAxis' transform='translate("+(margin.left-0.5)+","+margin.top+")'>\
						<line y2='"+(l.height-margin.y)+"'></line>";
					for(var t=0;t<=axesMeta.y.range;t++){
						svgTpl+="<g class='tick' transform='translate(-5,"+(Math.floor((t*axesMeta.y.unit))+0.5)+")'>\
							<line x2='5'></line>";  
							if(gridlines && (t<axesMeta.y.range|| type==='categorical')){svgTpl+="<line class='ui-tick-line' x1='6' x2='"+(5+l.width-margin.x)+"'></line>";}
							svgTpl+="<text x='"+(-5)+"' y='"+ (type==='categorical' ? (axesMeta.y.unit/2)+2 : "2")+"' text-anchor='end'>"+(type==='ordinal' ? (axesMeta.y.range+axesMeta.y.min)-t : axesMeta.y.data[t])+"</text>\
						</g>";				 	 
					} 
					svgTpl+="</g>";
			}				
			axesEl.appendChild($ui.createEl(svgTpl));			
		}	

		function resolveAxis(xyr, type){
			
			for(var i=0;i<data.length;i++){				
				seriesMeta[data[i][series]] = seriesMeta[data[i][series]] || {};
				seriesMeta[data[i][series]][xyr] = seriesMeta[data[i][series]][xyr] || {
					data:[],
					sum:0
				};					
				seriesMeta[data[i][series]][xyr].data.push(data[i][axis[xyr]]);	
				
				if(type==='ordinal'){						
					seriesMeta[data[i][series]][xyr].sum+=data[i][axis[xyr]];	
					seriesMeta[data[i][series]][xyr].min = !seriesMeta[data[i][series]][xyr].min || data[i][axis[xyr]] < seriesMeta[data[i][series]][xyr].min ? data[i][axis[xyr]] : seriesMeta[data[i][series]][xyr].min;
					seriesMeta[data[i][series]][xyr].max = !seriesMeta[data[i][series]][xyr].max || data[i][axis[xyr]] > seriesMeta[data[i][series]][xyr].max ? data[i][axis[xyr]] : seriesMeta[data[i][series]][xyr].max;
					seriesMeta[data[i][series]][xyr].range = Math.abs(seriesMeta[data[i][series]][xyr].max-seriesMeta[data[i][series]][xyr].min);
					axesMeta[xyr].data.push(data[i][axis[xyr]]);	
					axesMeta[xyr].sum+=data[i][axis[xyr]];
				}else{					
					if(axesMeta[xyr].data.indexOf(data[i][axis[xyr]])===-1){axesMeta[xyr].data.push(data[i][axis[xyr]]);}
				}
			}
			if(type==='ordinal'){		
				axesMeta[xyr].min=Math.min.apply(Math, axesMeta[xyr].data);
				axesMeta[xyr].min = axesMeta[xyr].min <= 0 ? axesMeta[xyr].min : 0;
				axesMeta[xyr].max=Math.max.apply(Math, axesMeta[xyr].data);
				axesMeta[xyr].range = Math.abs(axesMeta[xyr].max-axesMeta[xyr].min);
			}
			if(xyr==='x' || xyr ==='y'){
				if(type === 'ordinal'){
					axesMeta[xyr].unit = ((xyr === 'x' ? l.width : l.height)-margin[xyr])/axesMeta[xyr].range;
				}else{
					axesMeta[xyr].unit = ((xyr === 'x' ? l.width : l.height)-margin[xyr]) / axesMeta[xyr].data.length;					
					axesMeta[xyr].range = axesMeta[xyr].data.length-1;
				}					
				drawAxis(xyr, type);
			} 
			
		}
		
		if(type==='pie'){
			
			for(s in series){
					seriesMeta[series[s]]={};
					seriesMeta[series[s]].data=[];		
					seriesMeta[series[s]].sum=0; 
					for(i=0;i<data.length;i++){			
						seriesMeta[series[s]].data.push(data[i][series[s]]);
						seriesMeta[series[s]].sum+=Math.abs(parseInt(data[i][series[s]],0));
						if(!colors[data[i][axis.x]]){
							colors[data[i][axis.x]]=$ui.color.percentage(i/data.length); 
						}
					}			
					seriesMeta[series[s]].min=Math.min.apply(Math, seriesMeta[series[s]].data);
					seriesMeta[series[s]].max=Math.max.apply(Math, seriesMeta[series[s]].data);
					seriesMeta[series[s]].range=Math.abs(seriesMeta[series[s]].max-seriesMeta[series[s]].min);			
			}
			sIndex=0;
			var metaObj={};			
		
			for(s in seriesMeta){
				var ttlArc=0;
				for(i=0;i<seriesMeta[s].data.length;i++){	
				
					var pathCol=$ui.color.darken(colors[data[i][axis.x]], sIndex*(50/series.length));
					var pathEl=$ui.createEl("<path x='"+d/2+"' y='"+d/2+"' fill='none' stroke='"+pathCol+"' d='' stroke-width='"+(stroke/series.length+1)+"'/>");
					
					svgEl.appendChild(pathEl);
					var arc = Math.round((Math.abs(seriesMeta[s].data[i])/seriesMeta[s].sum)*360);
					r=((d-stroke/2)/2) - (stroke/2*sIndex);
					r = series.length>1 ? r : (d/2)-stroke/2;
					$ui.attribute(pathEl, {'d':$ui.svg.arcPath(d/2, d/2,  r, ttlArc, ttlArc+arc), 'data-rel':('rel'+s+data[i][axis.x]).replace(' ' ,'')});  
					if(typeof legend === 'function'){
						if(!metaObj[data[i][axis.x]]){
							metaObj[data[i][axis.x]]={};
						}
						if(!metaObj[data[i][axis.x]][s]){
							metaObj[data[i][axis.x]][s]={
								value:data[i][s],
								percentage:Math.round(arc*100/360),
								color:pathCol,
								relEl:pathEl
							};
						}
					}					
					
					ttlArc+=arc;
				}	
				sIndex++;			
			}
			if(typeof legend === 'function'){legend(metaObj); }
		
		/*
		START LINE, SCATTER, AREA, BUBBLE, BAR, COLUMN CHART
		*/
			
		}else{	
	
			svgEl.appendChild(axesEl);			
			
			resolveAxis('x',type==='column' ? 'categorical' : 'ordinal');
			resolveAxis('y',type==='bar' ? 'categorical' : 'ordinal');
			if(['column', 'bar'].indexOf(type)===-1 && typeof axis.r === 'string' && data[0][axis.r]!=='undefined'){	
				resolveAxis('r', 'ordinal'); 
			}
			var groupEl=$ui.createEl("<g class='ui-series'></g>");
			svgEl.appendChild(groupEl);
		
			/*
			Draw Series
			*/

			sIndex=0;
			for(s in seriesMeta){				
				if(!colors[s]){
					colors[s]=$ui.color.random();  
				}					
				var seriesEl=$ui.createEl("<g class='ui-series-"+sIndex+"' />");
				var sPath='', aPath='', sRect='';
				
				for(i=0;i<seriesMeta[s].x.data.length;i++){	
				
					var pxX=0,
						pxY=0,
						svgItemEl=null,
						ttX=-14; // Tooltip 'x' offset
						 
					if(['column', 'bar'].indexOf(type)===-1){							
						pxX=Math.round(margin.left + (axesMeta.x.unit * (seriesMeta[s].x.data[i]-axesMeta.x.min)));
						pxY=Math.round(l.height-(margin.bottom + (axesMeta.y.unit * (seriesMeta[s].y.data[i]-axesMeta.y.min))));
						if(i===0){
							sPath+="M";
						}else{
							sPath+=" L "; 
						}
						sPath+=pxX + " " +pxY;
					}else if(['column'].indexOf(type)!==-1){ 
						pxX= Math.floor(margin.left+(sIndex*(axesMeta.x.unit/Object.keys(seriesMeta).length)+(axesMeta.x.unit * axesMeta.x.data.indexOf(seriesMeta[s].x.data[i]))));
						pxY=axesMeta.y.unit * (seriesMeta[s].y.data[i]-axesMeta.y.min);
						svgItemEl=$ui.createEl("<rect x='"+(pxX-0)+"' y='"+(l.height-margin.bottom-pxY)+"' height='"+pxY+"' width='"+(0+(axesMeta.x.unit/Object.keys(seriesMeta).length))+"' stroke='"+colors[s]+"' fill='"+colors[s]+"' data-rel='rel"+s.replace(' ','')+"'/>");						
						seriesEl.appendChild(svgItemEl);
						ttX+=(0+(axesMeta.x.unit/Object.keys(seriesMeta).length))/2;				
					}else if(['bar'].indexOf(type)!==-1){		
						pxX= Math.round(margin.left + (axesMeta.x.unit * (seriesMeta[s].x.data[i]-axesMeta.x.min)));
						pxY= Math.floor(margin.top+(sIndex*(axesMeta.y.unit/Object.keys(seriesMeta).length)+(axesMeta.y.unit * axesMeta.y.data.indexOf(seriesMeta[s].y.data[i]))));
						svgItemEl=$ui.createEl("<rect x='"+margin.left+"' y='"+pxY+"' height='"+(0+(axesMeta.y.unit/Object.keys(seriesMeta).length))+"' width='"+(pxX-margin.left)+"' stroke='"+colors[s]+"' fill='"+colors[s]+"' data-rel='rel"+s.replace(' ','')+"'/>");						
						seriesEl.appendChild(svgItemEl);	
						ttX+=ttX+(pxX-margin.left);
					}
					if(['area'].indexOf(type)!==-1){
						if(i===0){
							aPath+="M"+pxX + " " +(l.height-margin.bottom);
						}
						aPath+=" L "+pxX + " " +pxY;
						if(i==seriesMeta[s].x.data.length-1){					
							aPath+=" L "+pxX + " " +(l.height-margin.bottom);
						}
					}
					if(['column', 'bar'].indexOf(type)===-1){
						// draw points				
						r=seriesMeta[s].r && seriesMeta[s].r.data[i] ? (seriesMeta[s].r.data[i]*20 / axesMeta.r.range)  : typeof axis.r === 'number' ? axis.r : 5;						
						svgItemEl=$ui.createEl("<circle cx='"+pxX+"' cy='"+pxY+"' r='"+r+"' fill='"+colors[s]+"' stroke='"+colors[s]+"' data-rel='rel"+s.replace(' ','')+"' />");
						seriesEl.appendChild(svgItemEl);  
						ttX+=r;		 
					}
					if(tooltip && $ui.tooltip){
						tooltip(svgItemEl, {series:s, values:{x:seriesMeta[s].x.data[i], y:seriesMeta[s].y.data[i], r:seriesMeta[s].r ? seriesMeta[s].r.data[i] : 0}}, {x:ttX, y:0}); 	
					}
				}  
				if(['scatter', 'column', 'bar'].indexOf(type)===-1){ 
					// draw connecting lines
					seriesEl.insertBefore($ui.createEl("<path class='ui-line' fill='none' stroke='"+colors[s]+"' d='"+sPath.trim()+"' data-rel='rel"+s.replace(' ','')+"' />"),seriesEl.firstChild );
				}
				if(['area'].indexOf(type)!==-1){
					// draw fill area
					seriesEl.insertBefore($ui.createEl("<path class='ui-area' fill='"+colors[s]+"' d='"+aPath.trim()+"' data-rel='rel"+s.replace(' ','')+"' />"),seriesEl.firstChild );
				}
				groupEl.appendChild(seriesEl);  
				sIndex++;
			}
			if(typeof legend === 'function'){legend(seriesMeta); }
		}	
		
		if(legend){			
			el.appendChild(legendEl);
		}
		el.appendChild(svgEl);
		
		return {
			0:el		
		};

		
    };
    return $ui;
})($ui);
