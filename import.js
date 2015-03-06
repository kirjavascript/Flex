/* tile importing */

var tile_array = [];

function importtiles(ele) {
	ctx = ele.getContext("2d");
	if(ele.width%8!=0||ele.height%8!=0) { 
		createmessage(250,25,"Sprite width and height must be divisible by 8",50,50,2000);
		return 0;
	}
	
	var pal_array = [];
	for(i=0;i<16;i++) pal_array[i] = $('p_0_'+i).style.backgroundColor.match(/\d+/g);
	
	// nybble support
	for(i=0;i<16;i++) {
		pal_array[i][0] = pal_array[i][0] >> 4;
		pal_array[i][1] = pal_array[i][1] >> 4;
		pal_array[i][2] = pal_array[i][2] >> 4;
	}
	
	var x_blox = ele.width/8;
	var y_blox = ele.height/8;
	var blox = x_blox * y_blox;
	
	tile_array = []; // array of string (tile) data
	
	for(var y=0;y<y_blox;y++) {
		for(var x=0;x<x_blox;x++) {
			var data=ctx.getImageData(x*8,y*8,8,8);
			var buf = "";
			
			if(data.data[3]==0) { // transparent
				tile_array[tile_array.length] = 0;
			}
			else {
				for (i=0;i<data.data.length;i+=8) {
					var hi = 0;
					var lo = 0;
					var rgb_pxl1 = [(data.data[i] >> 4),(data.data[i+1] >> 4),(data.data[i+2] >> 4)];
					var rgb_pxl2 = [(data.data[i+4] >> 4),(data.data[i+5] >> 4),(data.data[i+6] >> 4)];
					
					for(j=0;j<16;j++) {
						
						if(rgb_pxl1.toString()==pal_array[j].toString()) {
							hi=j;
						}
						if(rgb_pxl2.toString()==pal_array[j].toString()) {
							lo=j;
						}
					}
					buf += bytesplice("\x00",0,(hi*0x10)+lo)
				}
				tile_array[tile_array.length] = buf;
			}			
		}	
	}
	$('buffer').innerHTML = '';	
	importmenu(x_blox,y_blox);
	import_maps = [];
}

function importmenu(x_blox,y_blox) {
	killmenus();
    var data = '<span id="mapdplc">Import new art</span>' +
		'<br>&nbsp;<br>' +
		'<div id="imap" style="position:absolute"></div>' +
		'<div id="itiles_wrapper"><span id="itiles"></span></div>' +
		'&nbsp;<br>' +
		'<input type="button" value="Add Tiles Only" onClick="importtilesonly()">' +
		'<input type="button" value="Clear Maps" onClick="clearmaps()">' +
		'<input type="button" value="Add Mappings" onClick="importmaps('+x_blox+','+y_blox+')">' +
		'<input type="button" value="Mappings & DPLCs" onClick="importmaps('+x_blox+','+y_blox+',1)">' +
		'<input type="button" value="Cancel" onClick="this.parentNode.remove()">';
    createmessage(((x_blox)*32), ((y_blox)*32)+165, data, null, null, null, "importmenu");
	
	$('itiles_wrapper').style.width = ((x_blox)*32) + 'px';
	
	var blox = 0;
	for(var y=0;y<y_blox;y++) {
		for(var x=0;x<x_blox;x++) {
			drawimporttile(blox,x,y);
			blox++;
		}
	}
	
}

var import_map = [];
var import_maps = [];

function startmap(ele) {
	import_map[0] = ele;
}

function endmap(ele) {
	if(!import_map[0]||import_map[0].id[0]!="i") return 0;
	import_map[1] = ele;
	
	//get initial id, width and height
	var xy1 = import_map[0].innerHTML.split("_");
	var xy2 = import_map[1].innerHTML.split("_");
	
	var w = xy2[0]-xy1[0];
	var h = xy2[1]-xy1[1];
	
	// check correct drag type
	if(w<0||h<0) {
		createmessage(250,25,"Please drag top left to bottom right",50,50,2000);
		return 0;
	}
	if(w>3||h>3) {
		createmessage(250,25,"Please select a valid mapping size",50,50,2000);
		return 0;
	}
	
	// add to map list
	import_maps[import_maps.length] = [import_map[0].id,w,h]
	parseimports();
	import_map = [];
}

function parseimports() {
	// store i0 offsetTop and left then remove 
	$('imap').innerHTML = '';
	var top = $('i0').offsetTop;
	var left = $('i0').offsetLeft;
	for(var i=0;i<import_maps.length;i++) {
		var c = document.createElement('div');
		$('imap').appendChild(c);
		c.className="imap";
		c.id = "im"+i;
		c.style.width = ((import_maps[i][1]+1)*32)+ 'px';
		c.style.height = ((import_maps[i][2]+1)*32)+ 'px';
		c.style.top = ($(import_maps[i][0]).offsetTop-top) +'px';
		c.style.left = ($(import_maps[i][0]).offsetLeft-left) +'px';
	}
}

function clearmaps() {
	import_maps = [];
	parseimports();
}

function importmaps(x_blox,y_blox,dyn) {
	if(state.dplc != "") dyn = 1;
	// get X/Y here
	var top = $('i0').offsetTop;
	var left = $('i0').offsetLeft;
	for(var i=0;i<import_maps.length;i++) {
		import_maps[i][3] = ($(import_maps[i][0]).offsetLeft-left);
		import_maps[i][4] = ($(import_maps[i][0]).offsetTop-top);
	}
	// get top tile for dyn
	for(var max=0;$('t'+max);max++); // if dplc remove tile number/size/loop from maps (ele[0])
	
	for(var i=0;i<import_maps.length;i++) {
		var tile = parseInt($(import_maps[i][0]).id.slice(1)); // tile from menu
		
		for(var q=0;$('t'+q);q++); // get latest tile
		import_maps[i][0] = q; // rewrite element with imported tile id
		
		for(k=0;k<import_maps[i][1]+1;k++) {
			for(var j=0;j<import_maps[i][2]+1;j++) {
				var import_tile = tile_array[(tile+k)+(j*(x_blox))];
				if (import_tile==0) {
					createmessage(250,25,"Cannot import empty tile",50,50,2000);
					clearmaps();
					return 0;
				}
				state.art += import_tile;
			}
		}
		loadtiles();
	}
	
	if (state.map == "") {
        state.map = "Mappings test";
        state.map_frame = 0;
        state.map_arr[0] = (state.mode==2?"\x00":"\x00\x00");
        loadsprite(state.map_frame);
    }
	else addmap();
	if (state.dplc == "" && dyn) {
        state.dplc = "DPLC test";
        state.dplc_arr[0] = (state.mode==2?"\x00":"\x00\x00");
        loadsprite(state.map_frame);
    }
	
	for(var i=0;i<import_maps.length;i++) {
		addpiece_import(import_maps[i],max);
	}
	$('importmenu').remove();
}

// move this into map.js // merge this into addpiece
function addpiece_import(ele,max) {
	
    var piece = state.map_arr[state.map_frame];
    var piece_new = "";
	if(state.mode==2) {
	    size = piece.charCodeAt(0);
		piece_new = bytesplice(piece_new, 0, size +1 );
	}
	else {
		size = readword(piece, 0);
		piece_new = wordsplice(piece_new, 0, size + 1);
	}
    state.map_arr[state.map_frame] = piece_new;
    for (var i = 0; i < size; i++) {
        piece_new += piece.substr((i * ms[state.mode]) + (state.mode==2?1:2), ms[state.mode]);
    }
    piece_new += makemap_import(ele, parseInt(ele[3]/4),parseInt(ele[4]/4)+0xE8,max);
    state.map_arr[state.map_frame] = piece_new;
	
	if (state.dplc != "") {
        var piece = state.dplc_arr[state.map_frame];
        var piece_new = "";
		if(state.mode==2) {
			var size = piece.charCodeAt(0);
			var piece_new = bytesplice(piece_new, 0, size +1);
		}
		else {
			var size = readword(piece, 0);
			var piece_new = wordsplice(piece_new, 0, size + 1);
		}
        for (var i = 0; i < size; i++) {
            piece_new += piece.substr((i * 2) + (state.mode==2?1:2), 2);
        }
        piece_new += makedplc_import(ele);

        state.dplc_arr[state.map_frame] = piece_new;
    }

    loadsprite(state.map_frame);
}

function makemap_import(ele, left, top,max) {
	if (state.mode==1) var ex = "\x00\x00\x00\x00\xFF\xEF";
	else if (state.mode==0) var ex = "\x00\x00\x00\x00\x00\x00\xFF\xEF";
	else var ex = "\x00\x00\x00\x00\x00";
	
	var w = ele[1] << 2;
	var h = ele[2];
	
	size = (w+h);
	
	if (max) ex = wordsplice(ex, 2, ele[0]-max)
    else ex = wordsplice(ex, 2, ele[0])
	
	// wrapping
	if(top >= 0x100) top -= 0x100;
	if (state.mode==2 && left >= 0x100)	left -= 0x100;
	else if(state.mode!=2 && left >= 0x10000) left -= 0x10000;
	
    ex = bytesplice(ex, 0, top); // x pos
	if (state.mode==2)  ex = bytesplice(ex, 4, left); // y pos
    else ex = wordsplice(ex, (state.mode==1?4:6), left); // y pos
    ex = bytesplice(ex, 1, size);
    return ex;
}

function makedplc_import(ele) {
    ex = "\x00\x00";
    ex = bytesplice(ex, 1, ele[0] & 0xFF); // qty
    highest = (ele[0] & 0xF00)/0x100;
    ex = bytesplice(ex, 0, (parseInt((1+ele[1])*(1+ele[2]))-1 << 4)+highest);
    return ex;
}

function drawimporttile(tile,x,y) {
	var c = document.createElement('canvas');
	$('itiles').appendChild(c);
	c.id = 'i'+tile;
	c.width = 32;
	c.height = 32;
	c.innerHTML=x+"_"+y; // for working out mapping size
	c.className="itile";
	c.setAttribute("onmousedown","startmap(this)");
	c.setAttribute("onmouseup","endmap(this)");
	c.addEventListener('mousedown', drag_mousedown, false);
	var ctx = c.getContext("2d");
	ctx.scale(4,4);
	if(tile_array[tile]==0) {
		var img = new Image();
		img.src = 't.png';
		ctx.drawImage(img, 0, 0, 8, 8);
	}
	else drawtocanvas(ctx,0,0,tile_array[tile]);
}

function importtilesonly() {
	for(var i=0;i<tile_array.length;i++) {
		if(tile_array[i]!=0) state.art += tile_array[i];
	}
	loadtiles();
	killmenus();
}
