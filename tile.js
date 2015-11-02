/* tile manipulation */

function nexttile()  {return (state.art.length/0x20);}
// originally {for(var i=0;$('t'+i);i++);return i;} for some reason

function getmapped() {
	if(state.map == "") return 0;
	if(state.dplc != "") return getmapped_dplc();
	var tiles = [];
	for(var i=0;i<state.map_arr.length;i++) {
		var sprites = getsprites(i);
		for (var j = 0; j < sprites; j++) { // for each sprite in each map
			var adv = getadv(j);
			var second = getsecond(i,adv);
			var pcyxa = parse_PCYXA(second);
			var starttile = pcyxa[4];
			var mp = getmp(i,adv) & 0xF; // tile index array
			var sizes = getSize(mp);
			var tileqty = sizes[0]*sizes[1];
			for(var k=0;k<tileqty;k++) {
				tiles[tiles.length] = starttile + k;
			}
		}
	}
	return tiles;
}

function getmapped_dplc() {
	var tiles = [];
	for(var i=0;i<state.dplc_arr.length;i++) {
		if(state.mode==2) var reqs = state.dplc_arr[i].charCodeAt(0);
		else var reqs = readword(state.dplc_arr[i], 0);
		for (var j = 0; j < reqs; j++) {
			var req = readword(state.dplc_arr[i], (state.mode==2?1:2) + (j * 2));
			var tileqty = (req >> 12) + 1;
			var starttile = req & 0xFFF;
			for(var k=0;k<tileqty;k++) {
				tiles[tiles.length] = starttile + k;
			}
		}
	}
	return tiles;
}

function getunmapped() {
	var mapped = getmapped();
	var tileqty = nexttile();
	var buf = [];
	var buf2 = [];
	for(var i=0;i<tileqty;i++) {
		buf[i] = 0;
	}
	for(var i=0;i<mapped.length;i++) {
		buf[mapped[i]] = 1;
	}
	for(var i=0;i<tileqty;i++) {
		if(buf[i]==0) buf2[buf2.length] = i;
	}
	return buf2;
}

function getunmapped_single() {
	var mapped = getmapped();
	var tileqty = nexttile();
	for(var i=0;i<tileqty;i++) {
		if(mapped.indexOf(i)==-1) return i;
	}
}

function deletetile(tile) {
	state.art = state.art.substr(0,tile*0x20) + state.art.substr((tile+1)*0x20);
	$('t'+tile).remove();
	for(var i=(tile+1);$('t'+i);i++) {
		$('t'+i).innerHTML = i-1;
		$('t'+i).id = 't'+(i-1);
	}
}

function delete_shift(tile) {
	deletetile(tile);
	if(state.map == "") return 0;
	if(state.dplc != "") return shift_dplc(tile);
	var tiles = [];
	for(var i=0;i<state.map_arr.length;i++) {
		var sprites = getsprites(i);
		for (var j = 0; j < sprites; j++) { // for each sprite in each map
			var adv = getadv(j);
			var second = getsecond(i,adv);
			var map_tile_addr = second&0x7FF;
			if (map_tile_addr > tile) {
				second = (second-map_tile_addr) + (map_tile_addr - 1);
				state.map_arr[i] = wordsplice(state.map_arr[i], (state.mode==2?3:4) + adv, second);
			}
		}
	}
}

function shift_dplc(tile) {
	for(var i=0;i<state.dplc_arr.length;i++) {
		if(state.mode==2) var reqs = state.dplc_arr[i].charCodeAt(0);
		else var reqs = readword(state.dplc_arr[i], 0);
		for (var j = 0; j < reqs; j++) {
			var req = readword(state.dplc_arr[i], (state.mode==2?1:2) + (j * 2));
			var map_tile_addr = req & 0xFFF;
			var tileqty = req & 0xF000;
			if (map_tile_addr > tile) {
				req = (map_tile_addr -1) + (tileqty);
				state.dplc_arr[i] = wordsplice(state.dplc_arr[i], (state.mode==2?1:2) + (j * 2), req);
			}
		}
	}
}

function delete_unmapped() {
	//while(getunmapped().length>0) delete_shift(getunmapped()[0]);
	var unmappedqty = getunmapped().length;
	for(var i=0;i<unmappedqty;i++)  delete_shift(getunmapped_single());
	loadsprite(state.map_frame);
}

/* normal tile loading */

function loadtiles() {
	if(state.art.length==0) return 0;

	$('tiles').innerHTML = "";
	var tiles = (state.art.length/0x20);

	for(var i=0;i<tiles;i++) {
		drawtile(i,state.palette_line);
	}
}

function unloadart() {
	$('tiles').innerHTML = "";
	state.art = "";
	render_all();
}

function randomtile(hidden) {
	var c = document.createElement('canvas');
	$('tiles').appendChild(c);
	c.width = (zoom*8);
	c.height = (zoom*8);
	c.className="tile";
	if(hidden) c.style.display = 'none';
	var piece = c.getContext("2d");
	piece.scale(zoom,zoom);
	var pxl = 0;
	var y = -1;
	for(var i=0;i<0x40;i++) {
		i%8==0&&y++;
		vram_set(piece,0,Math.floor(Math.random()*0xF));
		vram_draw(piece,i%8,y);
	}
	return c;
}

function drawtile(tile,line,p) {
	var c = document.createElement('canvas');
	if(!p) $('tiles').appendChild(c);
	c.id = 't'+tile;
	c.width = (zoom*8);
	c.height = (zoom*8);
	c.innerHTML=tile;
	c.className="tile";
    c.setAttribute("onclick","addmappingmenu(this)");
	c.setAttribute("onmouseover","addmappingmenu(this,0,1)");
	c.setAttribute("oncontextmenu","tilemenu(this);return false;");
	c.setAttribute("ondblclick","deletetilemenu(this);");
	var piece = c.getContext("2d");
	piece.scale(zoom,zoom);
	drawtocanvas(piece,tile,line);
	return c;
}

function drawtocanvas(ele,tile,line,raw) {
	var pxl = 0;
	var y = -1;

	for(var i=0;i<0x20;i++) {
		if(raw) pxlz = raw.charCodeAt(i);
		else var pxlz = state.art.substr(0x20*tile,0x20).charCodeAt(i);
		pxl0 = pxlz >> 4;
		pxl1 = pxlz & 0xF;
		pxl%8==0&&y++;
		vram_set(ele,line,pxl0);
		vram_draw(ele,pxl%8,y);
		pxl++;
		vram_set(ele,line,pxl1);
		vram_draw(ele,pxl%8,y);
		pxl++;
	}
}

function vram_set(o,p,n) {
	if(n==0&&transparency) o.fillStyle = 'rgba(0,0,0,0)';
	else o.fillStyle = $('p_'+p+'_'+n).style.backgroundColor;
}

function vram_draw(o,x,y) {
	o.fillRect(x,y,1,1);
}
