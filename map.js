/*  http://info.sonicretro.org/

Sonic 1:

Each mapping is 5 bytes long, taking the form TTTT TTTT 0000 WWHH PCCY XAAA AAAA AAAA LLLL LLLL.

    LLLL LLLL is the left co-ordinate of where the mapping appears.
    TTTT TTTT is the top co-ordinate of where the mapping appears.
    WW is the width of the mapping, in tiles minus one. So 0 means 8 pixels wide, 1 means 16 pixels wide, 2 means 24 pixels wide and 3 means 32 pixels wide.
    HH is the height of the mapping, in the same format as the width.
    P is the priority-flag. If P is set, the mapping will appear above everything else.
    CC is the palette line.
    X is the x-flip-flag. If X is set, the mapping will be flipped horizontally.
    Y is the y-flip-flag. If Y is set, the mapping will be flipped vertically.
    AAA AAAA AAAA is the tile index.

	The VRAM offset specified in an object's SST will be added to the PCCY XAAA AAAA AAAA word.

Sonic 2: 
	
	TTTT TTTT 0000 WWHH PCCY XAAA AAAA AAAA PCCY XAAA AAAA AAAA LLLL LLLL LLLL LLLL
	
Each sprite mapping consists of four words. A contiguous list of sprite mappings preceded with a word-length number of mappings defines one frame for an object. The four words have the following purposes:

    First word:
        High byte is the relative signed top edge position of the sprite from the center of the object.
        Low byte is the size of the sprite, in tiles minus one. The upper four bits are ignored, the next two bits control the width and the lowest two bits control the height. Thus sprites can be of any size from 1x1 tile to 4x4 tiles. For example, $01 is a 1x2 sprite, $02 is a 1x3 sprite, $04 is a 2x1 sprite, and so on.
    Second and third words:
        The second word applies to one-player mode; the third applies to two-player mode.
        The relevant word will be added to the object's VRAM offset and then used as the pattern index for that sprite. Like all SEGA Genesis VDP pattern indices, it is a bitmask of the form PCCY XAAA AAAA AAAA. P is the priority flag, CC is the palette line to use, X and Y indicate that the sprite should be flipped horizontally and vertically respectively and AAA AAAA AAAA is the actual tile index, i.e. the VRAM offset of the pattern divided by $20 (or bit-shifted right by 5).
    Fourth word: This is the relative signed left edge position of the sprite from the center of the object.
	
	For S3K, just ignore the 2P shit.
	
	TTTT TTTT 0000 WWHH PCCY XAAA AAAA AAAA LLLL LLLL LLLL LLLL
*/

/* The format of DPLCs is simple: the first word (or byte in sonic 1) is the number of DPLC requests to make, and each successive word (up to the value of the first word) is split up so that the first nybble is the number of tiles to load minus one, and the last three nybbles are the offset (in tiles, i.e. multiples of $20 bytes) of the art to load from the beginning of the object's specified art offset in ROM. Therefore, in order to request x tiles to be loaded, you need 1+floor(x/16) words in the DPLC. */


function png() {
	//$('buffer').innerHTML = '';
	var c = document.createElement('canvas');
	c.width=1000;
	c.height=1000;
	// fill rect
	piece = c.getContext("2d");	
	piece.scale(0.25,0.25);
	
	if(!$('m0')) return 0;
	
	// get piece offsets
	var off = [];
	var	lt = [65536,65536];
	for(var i=0;$('m'+i);i++) {
		off[i] = [];
		off[i][0] = $('m'+i).offsetLeft;
		off[i][1] = $('m'+i).offsetTop;
		if(off[i][0]<lt[0]) lt[0] = off[i][0];
		if(off[i][1]<lt[1]) lt[1] = off[i][1];
	}
	for(var i=0;$('m'+i);i++) {
		off[i][0] -= lt[0];
		off[i][1] -= lt[1];
	}
	
	var size = [0,0];
	
	for(var i=0;$('m'+i);i++) {
		var	s = $('m'+i).getElementsByClassName("map");
		var w = parseInt($('m'+i).style.width);
		var h = parseInt($('m'+i).style.height);
		var cls = $('m'+i).className;
		
		for(var j=0;j<s.length;j++) {
				var left = parseInt(s[j].offsetLeft);
				var top = parseInt(s[j].offsetTop);
				var size_left = left + off[i][0];
				var size_top = top + off[i][1];
				
				if(cls=="piece") {
					left += off[i][0];
					top += off[i][1];
					piece.drawImage(s[j],left,top);
				}
				if (cls=="piece flipX") {
					left -= off[i][0];
					top += off[i][1];
					piece.save();
					piece.scale(-1,1) 
					piece.drawImage(s[j],-1*(w-left),top);
					piece.restore();
				}
				
				if (cls=="piece flipY") {
					left += off[i][0];
					top -= off[i][1];
					piece.save();
					piece.scale(1,-1) 
					piece.drawImage(s[j],left,-1*(h-top));
					piece.restore();
				}
				
				if (cls=="piece flipflop") {
					left -= off[i][0];
					top -= off[i][1];
					piece.save();
					piece.scale(-1,-1) 
					piece.drawImage(s[j],-1*(w-left),-1*(h-top));
					piece.restore();
				}
				if(size_left+32>size[0]) size[0]=size_left+32;
				if(size_top+32>size[1]) size[1]=size_top+32;
		}
	}
	//$('buffer').appendChild(c);
	var d = document.createElement('canvas');
	d.width=size[0]/4;
	d.height=size[1]/4;
	piece = d.getContext("2d");
	piece.drawImage(c,0,0);
	//$('buffer').appendChild(d);
	
	//window.open(d.toDataURL("image/png"));
	savefile("export_"+hex(state.map_frame)+".png",null,d.toDataURL("image/png"));
	c.remove();
	d.remove();
}

/* Mappings */

function unloadmaps() {
    $('mappings').innerHTML = "";
    $('mapinfo').innerHTML = '';
    $('info').innerHTML = '';
    $('mapmenu').innerHTML = '';
    state.map = "";
    state.map_arr = [];
    state.map_hdr = [];
    state.map_frame = 0;
}

function convertmaps() {
	if(state.mode==0) {
		// S2 -> S3K
		for (var i = 0; i <state.map_arr.length ; i++) {
			var size = readword(state.map_arr[i], 0);
			var buf = [];
			for(var j=0;j<size;j++) {
				 buf[buf.length] = state.map_arr[i].substr(2+(j*8),4) + state.map_arr[i].substr(2+(6+(j*8)),2);
			}
			buf = buf.join("");
			state.map_arr[i] = wordsplice("\x00\x00",0,size) + buf;
		}
	}
	if(state.mode==1) {
		// S3K -> S1
		for (var i = 0;state.dplc!=""&&i<state.dplc_arr.length ; i++) {
			state.dplc_arr[i] = state.dplc_arr[i].slice(1);
		}
		for (var i = 0; i <state.map_arr.length ; i++) {
			var size = readword(state.map_arr[i], 0);
			var buf = [];
			for(var j=0;j<size;j++) {
				buf[buf.length] = state.map_arr[i].substr(2+(j*6),4) + state.map_arr[i].substr(7+(j*6),1);
			}
			buf = buf.join("");
			state.map_arr[i] = bytesplice("\x00",0,size) + buf
		}
	}
	if(state.mode==2) {
		// S1 -> S2
		for (var i = 0;state.dplc!=""&&i<state.dplc_arr.length ; i++) {
			state.dplc_arr[i] = "\x00" + state.dplc_arr[i];
		}
		for (var i = 0; i <state.map_arr.length ; i++) {
			var size = state.map_arr[i].charCodeAt(0);
			var buf = [];
			for(var j=0;j<size;j++) {
				if (state.map_arr[i].substr(5+(j*5),1).charCodeAt(0)<0x80) var ins = "\x00\x00\x00";
				else var ins = "\x00\x00\xFF";
				buf[buf.length] = state.map_arr[i].substr(1+(j*5),4) + ins + state.map_arr[i].substr(5+(j*5),1);
			}
			buf = buf.join("");
			state.map_arr[i] = wordsplice("\x00\x00",0,size) + buf
		}
	}
	/*
	else {
		// S3K -> S2
		for (var i = 0; i <state.map_arr.length ; i++) {
			var size = readword(state.map_arr[i], 0);
			var buf = [];
			for(var j=0;j<size;j++) {
				 buf[buf.length] = state.map_arr[i].substr(2+(j*6),4) + "\x00\x00" + state.map_arr[i].substr(2+(4+(j*6)),2);
			}
			buf = buf.join("");
			state.map_arr[i] = wordsplice("\x00\x00",0,size) + buf;
		}
	}
	*/
}

function loadmaps(file) {
    if (state.map == "") return 0;
    if (state.map_hdr == [] || file) state.map_hdr = loadheaders(state.map);
    if (state.map_arr == [] || file) loadmaparrays(), state.map_frame = 0;

    loadsprite(state.map_frame);
}

function loadheaders(src) {
    var a = 0x7FFF;
    var dest = [];
    for (var i = 0; i < src.length && i != a; i += 2) {
        var hd = readword(src, i);
        dest[dest.length] = hd;
        if (hd < a && !(hd == 0)) a = hd;
    }
    return dest;
}

function loadmaparrays() {
    state.map_arr = [];
    for (i = 0; i < state.map_hdr.length; i++) {
		if(state.mode==2) {
			var size = state.map.charCodeAt(state.map_hdr[i]);
			size *= 5, size += 1; //S1
		}
		else {
			var size = readword(state.map, state.map_hdr[i]);
			size *= (state.mode==1?6:8), size += 2;
		}
        state.map_arr[state.map_arr.length] = state.map.substr(state.map_hdr[i], size);
    }
}

function mappingoutput() {
    var out = "";
    var h = state.map_arr.length * 2;
	var buf = [];
    for (var i = 0; i < state.map_arr.length; i++) {
		if (state.mode==2) var size = state.map_arr[i].charCodeAt(0);
        else var size = readword(state.map_arr[i], 0);
		if(size==0 && sonmaped<0) {
			out = wordsplice(out, i*2, 0);
		}
		else {
			out = wordsplice(out, i*2, h);
			if(state.mode==2) h += (5 * size) + 1;
			else h += ((state.mode==1?6:8) * size) + 2;
			buf[buf.length] = state.map_arr[i];
		}
    }
    out += buf.join("");
    return out;
}

function nextsprite() {
    if (state.map_frame < state.map_arr.length-1){
        loadsprite(++state.map_frame);
    }
}

function prevsprite() {
    if (state.map_frame > 0) {
        loadsprite(--state.map_frame);
    }
}

function nextswap() {
    if (state.map_frame < state.map_arr.length-1){
        var buf = copy(state.map_arr[state.map_frame]);
        state.map_arr[state.map_frame] = copy(state.map_arr[state.map_frame+1])
        state.map_arr[state.map_frame+1] = buf;
		if(state.dplc!="") {
			buf = copy(state.dplc_arr[state.map_frame]);
			state.dplc_arr[state.map_frame] = copy(state.dplc_arr[state.map_frame+1])
			state.dplc_arr[state.map_frame+1] = buf;
		}
        loadsprite(++state.map_frame);
    }
}

function prevswap() {
    if (state.map_frame > 0){
        var buf = copy(state.map_arr[state.map_frame]);
        state.map_arr[state.map_frame] = copy(state.map_arr[state.map_frame-1])
        state.map_arr[state.map_frame-1] = buf;
		if(state.dplc!="") {
			buf = copy(state.dplc_arr[state.map_frame]);
			state.dplc_arr[state.map_frame] = copy(state.dplc_arr[state.map_frame-1])
			state.dplc_arr[state.map_frame-1] = buf;
		}
        loadsprite(--state.map_frame);
    }
}

function delmap() {
    if (state.map == "") return 0;
    else if (state.map_arr.length==1) { unloadmaps(); return 0; }
    state.map_arr.splice(state.map_frame, 1);
    if (state.dplc != "") {
        state.dplc_arr.splice(state.map_frame, 1);
    }
    if(state.map_frame>0){loadsprite(--state.map_frame)}
    else {loadsprite(state.map_frame)}
}

function addmap() {
    if (state.map == "") return 0;
    state.map_frame++;
    state.map_arr.splice(state.map_frame, 0, '');
    state.map_arr[state.map_frame] = wordsplice(state.map_arr[state.map_frame], "\x00\x00", 0);
    if (state.dplc != "") {
        state.dplc_arr.splice(state.map_frame, 0, '');
        state.dplc_arr[state.map_frame] = wordsplice(state.dplc_arr[state.map_frame], "\x00\x00", 0);
    }
    loadsprite(state.map_frame);
}

function dupemap() {
    if (state.map == "") return 0;
    addmap();
    state.map_arr[state.map_frame] = state.map_arr[state.map_frame-1];
    if (state.dplc != "") {
        state.dplc_arr[state.map_frame] = state.dplc_arr[state.map_frame-1];
    }
    loadsprite(state.map_frame);
}

/* Abstractions */

var ms = [8,6,5];

function getsprites(num) {
	if(state.mode==2) return state.map_arr[num].charCodeAt(0);
	else return readword(state.map_arr[num], 0);
}

function getadv(num) { 
	return num * ms[state.mode];
}

function gettop_off(num,adv) {
	var top_off = state.map_arr[num].charCodeAt((state.mode==2?1:2) + adv); // top edge pos
	if (top_off > 0x80) top_off = 0x100 - top_off, top_off = -top_off; // fix signedness	
	return top_off;
}

function getmp(num,adv) {
	return state.map_arr[num].charCodeAt((state.mode==2?2:3) + adv)
}

function getsecond(num,adv) {
	return readword(state.map_arr[num], (state.mode==2?3:4) + adv);
}

function getleft_off(num,adv) {
	if(state.mode==2) {
		var left_off = state.map_arr[num].charCodeAt(5 + adv); // left signed
		if (left_off > 0x80) left_off = 0x100 - left_off, left_off = -left_off; // fix signedness	
	}
	else {			
		var left_off = readword(state.map_arr[num], (state.mode==1?6:8) + adv); // left signed
		if (left_off > 0x8000) left_off = 0x10000 - left_off, left_off = -left_off;
	}
	return left_off;
}

function parse_PCYXA(d) {
    return [(d>>15)&1,(d>>13)&3,(d>>12)&1,(d>>11)&1,d&0x7FF];
}

function getSize(mp) {
	if(mp>-1) var wh = mp;
	else var wh = state.map_arr[state.map_frame].charCodeAt((map[1] * ms[state.mode]) + (state.mode==2?2:3));
	var x = wh >> 2;
	var y = wh & 3;
	return [x+1,y+1];
}

function getX() {
	if(state.mode==2) return state.map_arr[state.map_frame].charCodeAt((map[1] * 5) + 5);
	else return readword(state.map_arr[state.map_frame], (map[1] * (state.mode==1?6:8)) + (state.mode==1?6:8));
}

function getY() {
	return state.map_arr[state.map_frame].charCodeAt((map[1] * ms[state.mode]) + (state.mode==2?1:2));
}

function setX(x) {
	if(state.mode==2) {
		if (x < 0) x += 0x100;
		else if (x > 0xFF) x -= 0x100;
		state.map_arr[state.map_frame] = bytesplice(state.map_arr[state.map_frame], (map[1] * 5) + 5, x);
	}
	else {
		if (x < 0) x += 0x10000;
		else if (x > 0xFFFF) x -= 0x10000;
		state.map_arr[state.map_frame] = wordsplice(state.map_arr[state.map_frame], (map[1] * (state.mode==1?6:8)) + (state.mode==1?6:8), x);
	}
}

function setY(y) {
	if (y < 0) y += 0x100;
    else if (y > 0xFF) y -= 0x100;
	state.map_arr[state.map_frame] = bytesplice(state.map_arr[state.map_frame], (map[1] * ms[state.mode]) + (state.mode==2?1:2), y);
}

/* Mapping drawing */

function loadsprite(num, skipload) {
    if (state.map == "") return 0;
	
	if($('x')) {				//persistant guidelines
		_g = [$('x'),$('y')];
		$('mappings').innerHTML = '';
		$('mappings').appendChild(_g[0]);
		$('mappings').appendChild(_g[1]);
	}
	else $('mappings').innerHTML = '';
	
    var sprites = getsprites(num);

    if (!skipload) {
        map = 0;
        spritemenu();
        $('info').innerHTML = hex(num) + " / " + hex(state.map_arr.length);
        $('info').innerHTML += '<br>Number of mapping pieces: ' + hex(sprites);
        $('mapinfo').innerHTML = '';
        if (state.dplc != "") {
            dplc_load(num);
        }
    }
    for (var i = 0; i < sprites; i++) {
		var adv = getadv(i);
		var top_off = gettop_off(num,adv);
		var mp = getmp(num,adv) & 0xF;
		var second = getsecond(num,adv);
		second = parse_PCYXA(second);
		var left_off = getleft_off(num,adv);
		//mode!=2 readword(state.map_arr[num], 6 + adv); // 2P, (ignore)
		
        loadmappingsframe(i, mp, second[4], left_off * 4, top_off * 4, second[3], second[2],second[1]);
    }
}

function loadmappingsframe(num, type, tile, x, y, flip_x, flip_y, pal) {
	var sizes = getSize(type);
    var w = sizes[0];
    var h = sizes[1];
    var tl = 0;
    var d = document.createElement('div');
    d.className = "piece";
	//d.zIndex = num;
	if (flip_y&&flip_x) {
		d.className += " flipflop";
	}
	else {
		if (flip_y) d.className += " flipY";
		if (flip_x) d.className += " flipX";
	}
    d.id = "m" + num;
    d.style.top = y + 200 + "px";
    d.style.width = (w) * 32;
    d.style.height = (h) * 32;
    d.style.left = x + 300 + "px";
    d.setAttribute("onclick", "modifymap(this)")
    $('mappings').appendChild(d);
    for (var j = 0; j < (w); j++) {
        for (var k = 0; k < (h); k++) {
            loadonemap("map", $('m' + num), tile + tl++, (j * 32), (k * 32), "sub", state.dplc != "",pal);
        }
    }
}

function loadonemap(cls, el, tile, x, y, id, dplc,pal) {
    var c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    if (id) c.id = id;
	if (id=="sub") {
		c.setAttribute("onmouseover","addmappingmenu(this,1,1)");
		c.setAttribute("oncontextmenu","tilemenu(this);return false;");
	}
    if (y) c.style.top = y + "px";
    if (x) c.style.left = x + "px";
    //c.style.position = "absolute";
    c.className = cls;
	c.innerHTML = tile;
	piece = c.getContext("2d");	
	if(pal>0) {
		if(dplc && $('d'+tile)) {
			piece.drawImage(drawtile(state.dplc_hdr[tile],pal,1), 0, 0); // dplc_hdr has tile location array for current DPLC
		}
		else {
			piece.drawImage(drawtile(tile,pal,1), 0, 0);
		}
	}
	else {
		if ($((dplc ? 'd' : 't') + tile)) piece.drawImage($((dplc ? 'd' : 't') + tile), 0, 0);
	}
    piece.scale(4, 4);
	
    el.appendChild(c);
    return c;
}

/* Mapping Editing */

var map = 0;

/* Movement */

function mapup() {
    if (map) {
		setY(getY()-1);
        loadsprite(state.map_frame, 1);
    } else {
        for (var i = 0; $('m' + i); i++) modifymap_silent($('m'+i)), mapup();
        map = 0;
    }
}

function mapdown() {
    if (map) {
		setY(getY()+1);
        loadsprite(state.map_frame, 1);
    } else {
        for (var i = 0; $('m' + i); i++) modifymap_silent($('m'+i)), mapdown();
        map = 0;
    }
}

function mapleft() {
    if (map) {
		setX(getX()-1);
        loadsprite(state.map_frame, 1);
    } else {
        for (var i = 0; $('m' + i); i++) modifymap_silent($('m'+i)), mapleft();
        map = 0;
    }
}

function mapright() {
    if (map) {
		setX(getX()+1);
        loadsprite(state.map_frame, 1);
    } else {
        for (var i = 0; $('m' + i); i++) modifymap_silent($('m'+i)), mapright();
        map = 0;
    }
}

function flip(y) {
	if(map!=0) {
		var mapdata = readword(state.map_arr[state.map_frame], (state.mode==2?3:4) + (map[1]*ms[state.mode]));
		mapdata ^= (1 << 11+y);
		state.map_arr[state.map_frame] = wordsplice(state.map_arr[state.map_frame], (map[1] * ms[state.mode]) + (state.mode==2?3:4), mapdata);
		loadsprite(state.map_frame, 1);
	}
	else {
		for(var i=0;$('m'+i);i++) {
			modifymap_silent($('m'+i));
			var size = getSize();
			if(y) {
				setY(-getY());
				setY(getY()-(size[1]*8));
			}
			else {
				setX(-getX());
				setX(getX()-(size[0]*8));
			}
			flip(y);
		}
		map = 0;
	}
}

function palshift() {
	if(map!=0) {
		var mapdata = readword(state.map_arr[state.map_frame], (state.mode==2?3:4) + (map[1]*ms[state.mode]));
		var pal = parse_PCYXA(mapdata)[1];
		if(pal==3) mapdata -= (3 << 13);
		else mapdata += (1 << 13);
		state.map_arr[state.map_frame] = wordsplice(state.map_arr[state.map_frame], (map[1] *ms[state.mode]) + (state.mode==2?3:4), mapdata);
		loadsprite(state.map_frame, 1);
	}
	else {
		for(var i=0;$('m'+i);i++) {
			modifymap_silent($('m'+i));
			palshift();
		}
		map = 0;
	}
}

function priority() {
	if(map!=0) {
		var mapdata = readword(state.map_arr[state.map_frame], (state.mode==2?3:4) + (map[1]*ms[state.mode]));
		mapdata ^= (1 << 15);
		state.map_arr[state.map_frame] = wordsplice(state.map_arr[state.map_frame], (map[1] *ms[state.mode]) + (state.mode==2?3:4), mapdata);
		loadsprite(state.map_frame, 1);
		setpriority();
	}
}

function setpriority() {
	$('priority').value = "Priority: " + parse_PCYXA(readword(state.map_arr[state.map_frame], (state.mode==2?3:4) + (map[1]*ms[state.mode])))[0];
}

/* Piece modification */

function modifymap(id) {
    map = [id, id.id.slice(1)]; // element, piece id
    $('mapinfo').innerHTML = 'Selected mapping piece: ' + map[1];
	var pcyxa = parse_PCYXA(readword(state.map_arr[state.map_frame], (state.mode==2?3:4) + (map[1]*ms[state.mode])))[0];
    for (var i=0;$('m'+i);i++) $('m'+i).style.outline = '';
    $('m' + map[1]).style.outline = "4px solid #FE0";
    piecemenu();
}

function modifymap_silent(id) {
	map = [id, id.id.slice(1)];
}

function deselectmap() {
	if(state.map=="") return 0;
    map = 0;
    for(var i=0;$('m'+i);i++) $('m'+i).style.outline = '';
    $('mapinfo').innerHTML = '';
    spritemenu();
}

function changepiece(down) {
	if(map==0) return 0;
	if(state.mode==2) var pieces = state.map_arr[state.map_frame].charCodeAt(0);
	else var pieces = readword(state.map_arr[state.map_frame], 0);
	current = map[1];
	if(down) current--;
	else current++;
	if(current==pieces) current = 0;
	else if (current==-1) current = pieces-1;
	modifymap($('m'+current));
}


function addpiece(tile,ele,dyn) {
	if (state.map == "") {
        state.map = "Mappings test";
        state.map_frame = 0;
        state.map_arr[0] = (state.mode==2?"\x00":"\x00\x00");
        loadsprite(state.map_frame);
    }
    tile_size = ele.id.slice(1);
	
    if(menu_tile<(state.art.length/0x20)-16&&!dyn) {
            menu_tile = parseInt(menu_tile) +  parseInt(tiles2load[tile_size])|0;
            addmappingmenu(); // dplc check
    }
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
	// work out lowest sprite
    piece_new += makemap(tile, tile_size, 0xE8, 0,dyn);
    state.map_arr[state.map_frame] = piece_new;

    if (state.dplc != "" && !dyn ) {
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
        piece_new += makedplc(tile, tile_size);

        state.dplc_arr[state.map_frame] = piece_new;
    }


    loadsprite(state.map_frame);
    for (var i = 0; $('m' + i); i++);
    modifymap($('m' + (i - 1)));

}

function makemap(tile, tile_size, top, left,dyn) {
	if (state.mode==1) var ex = "\x00\x00\x00\x00\xFF\xEF";
	else if (state.mode==0) var ex = "\x00\x00\x00\x00\x00\x00\xFF\xEF";
	else var ex = "\x00\x00\x00\x00\x00";
	
    if(dyn) {
        ex = wordsplice(ex, 2, menu_tile); // art tile (ish)
    }
    else if (state.dplc != "") {
        for (var dplc=0;$('d' + dplc);dplc++); // count active dplcs
        ex = wordsplice(ex, 2, dplc); // art tile (ish)
    } else {
        ex = wordsplice(ex, 2, tile)
    } // art tile
	
	// wrapping
	if(top >= 0x100) top -= 0x100;
	if (state.mode==2 && left >= 0x100)	left -= 0x100;
	else if(state.mode!=2 && left >= 0x10000) left -= 0x10000;

    ex = bytesplice(ex, 0, top); // x pos
	if (state.mode==2)  ex = bytesplice(ex, 4, left); // y pos
    else ex = wordsplice(ex, (state.mode==1?4:6), left); // y pos
    ex = bytesplice(ex, 1, generatematricies(4)[3][tile_size]); // size
	// CHECK OUT THIS FUCKING WEIRD KIND OF FRACTAL RECURSION SHIT GOING ON
    return ex;
}

var tiles2load = [1, 2, 3, 4, 2, 4, 6, 8, 3, 6, 9, 12, 4, 8, 12, 16]; // recode this

function makedplc(tile, tile_size) {
    ex = "\x00\x00";
    ex = bytesplice(ex, 1, tile & 0xFF); // qty
    highest = (tile & 0xF00)/0x100;
    ex = bytesplice(ex, 0, ((tiles2load[tile_size]) -1 << 4)+highest);
    return ex;
}


function deletepiece() {
    if (map && state.map_arr.length > 0) {
		if(state.mode==2) {
			header_match = state.dplc!=""&&state.dplc_arr[state.map_frame].charCodeAt(0)==state.map_arr[state.map_frame].charCodeAt(0);
		}
		else {
			header_match = state.dplc!=""&&readword(state.dplc_arr[state.map_frame], 0)==readword(state.map_arr[state.map_frame],0);
		}
        
        if (state.dplc != "" && header_match ) { // check they're both the same mength
            var piece = state.dplc_arr[state.map_frame];
            var piece_new = "";
			if(state.mode==2) {
				var size = piece.charCodeAt(0);
				var piece_new = bytesplice(piece_new, 0, size - 1);
			}
			else {
				var size = readword(piece, 0);
				var piece_new = wordsplice(piece_new, 0, size - 1);
			}
            for (var i = 0; i < size; i++) {
                if (i != map[1]) {
                    piece_new += piece.substr((i * 2) + (state.mode==2?1:2), 2);
                } else if (i == map[1]) {
                    // auto alignment
                    shift = parseInt(readword(piece, (i * 2) + (state.mode==2?1:2)) / 0x1000) + 1;
                }
            }
            state.dplc_arr[state.map_frame] = piece_new;
        }
        piece = state.map_arr[state.map_frame];
        piece_new = "";
		if(state.mode==2) {
		    size = piece.charCodeAt(0);
			piece_new = bytesplice(piece_new, 0, size - 1);
		}
		else {
			size = readword(piece, 0);
			piece_new = wordsplice(piece_new, 0, size - 1);
		}
        for (var i = 0; i < size; i++) {
            if (i != map[1]) piece_new += piece.substr((i * ms[state.mode]) + (state.mode==2?1:2), ms[state.mode]);
            if (i > map[1] && state.dplc != "" && header_match) {
                addr = readword(piece_new.substr(0-ms[state.mode]),2);
                piece_new = wordsplice(piece_new, (((i - 1) * ms[state.mode]) + (state.mode==2?3:4)), parseInt(addr - shift));
            }
        }
        state.map_arr[state.map_frame] = piece_new;

        loadsprite(state.map_frame);
    }
    for (var i = 0; $('m' + i); i++);
    if ($('m' + parseInt(i - 1))) modifymap($('m' + parseInt(i - 1)));
    // if headers didn't match send error
}

/* Raw Data */

function editraw(type) { // 0 = mappings, 1 = dplcs
	killmenus();
    if (type==0) {
		var data = state.map_arr[state.map_frame];
		var size = ms[state.mode];
		var out = "Edit raw mappings";
	}
    else {
		var data = state.dplc_arr[state.map_frame];
		var size = 2;
		var out = "Edit raw DPLCS";
	}
	out += "<textarea style=\"width:200;height:180\" id='rawdata'>";
    if(state.mode==2) {
	    out += ' $' + data.charCodeAt(0) + ",";
		for (var i = 0; i < data.charCodeAt(0); i++) {
		   out += '\n' + bytedump(data.substr((i * size) + 1, size));
		}
	}
	else {
		out += ' $' + readword(data, 0) + ",";
		for (var i = 0; i < readword(data, 0); i++) {
			out += '\n' + hexdump(data.substr((i * size) + 2, size));
		}
	}
    out += '</textarea><br>';
	out += '<input type="button" value="Save" onClick="saverawdata('+type+')">';
	out += '<input type="button" value="Close" onClick="this.parentNode.remove()">';
    createmessage(200, 225, out, 70, 20,null,"editraw");
}

function saverawdata(type) {
	var data = datastr2arr($('rawdata').value);
	var out = "";
	for(var i=0;i<data.length;i++) {
		if(data[i]!="") {
			if(state.mode==2) out += bytesplice("\x00",0,parseInt(data[i],16))
			else out += wordsplice("\x00\x00",0,parseInt(data[i],16))
		}
	}
	if(type==0) state.map_arr[state.map_frame] = out;
	else state.dplc_arr[state.map_frame] = out;
	loadsprite(state.map_frame);
}

/* DPLCs */

function loaddplcs(file) {
    if (state.dplc == "") return 0;
    if (state.dplc_hdr == [] || file) state.dplc_hdr = loadheaders(state.dplc);
    if (state.dplc_arr == [] || file) loaddplcarrays();
    if ($('mappingmenu')) $('mappingmenu').remove();
    loadsprite(state.map_frame);
}

function loaddplcarrays() {
    state.dplc_arr = [];
    for (i = 0; i < state.dplc_hdr.length; i++) {
		if(state.mode==2) {
			var size = state.dplc.charCodeAt(state.dplc_hdr[i]);
			size *= 2, size += 1;
		}
		else {
			var size = readword(state.dplc, state.dplc_hdr[i]);
			size *= 2, size += 2;
		}
        state.dplc_arr[state.dplc_arr.length] = state.dplc.substr(state.dplc_hdr[i], size);
    }
}

function dplcoutput() {
    // create headers
    var out = "";
    var h = state.dplc_arr.length * 2;
    
	var buf = [];
    for (var i = 0; i < state.dplc_arr.length; i++) {
		if(state.mode==2) var size = state.dplc_arr[i].charCodeAt(0);
        else var size = readword(state.dplc_arr[i], 0);
		if (size==0 && sonmaped<0) {
			out = wordsplice(out, i*2, 0);
		}
		else {
			out = wordsplice(out, i*2, h);
			h += (2 * size) + (state.mode==2?1:2);
			buf[buf.length] = state.dplc_arr[i];
		}
    }
    // add data
    out += buf.join("");
    return out;
}

function unloaddplc() {
    state.dplc = "";
    state.dplc_hdr = [];
    state.dplc_arr = [];
    $('dplc_vram').innerHTML = '';
    $('dplc_vram').style.display = 'none';
    if ($('mappingmenu')) $('mappingmenu').remove();
    loadsprite(state.map_frame);
}

function adddplc(len,tile) {
	if(len==""||tile=="") return 0;
	var out = state.dplc_arr[state.map_frame]
	var size = readword(out,0)
	out = wordsplice(out,0,size+1)
	var _dplc = wordsplice("\x00\x00",0,parseInt(tile,16) | (parseInt(len,16) * 0x1000));
	out += _dplc;
	state.dplc_arr[state.map_frame] = out;
	loadsprite(state.map_frame);
}

function dplc_load(num) {
    $('dplc_vram').style.display = 'block';
    $('dplc_vram').innerHTML = '';
	if(state.mode==2) var reqs = state.dplc_arr[num].charCodeAt(0); // dplc requests
    else var reqs = readword(state.dplc_arr[num], 0); // dplc requests
    var vram_loc = 0;
	var buf = [];
    for (var i = 0; i < reqs; i++) {
        var req = readword(state.dplc_arr[num], (state.mode==2?1:2) + (i * 2));
        var tnum = (req >> 12) + 1; // number of tiles
        var loc = req & 0xFFF; // tile location
        for (var j = 0; j < tnum; j++) {
            loadonemap("tile", $('dplc_vram'), loc + j, null, null, "d" + vram_loc);
			buf[buf.length] = parseInt(loc+j);
			$('d' + vram_loc).setAttribute("onclick","addmappingmenu(this,1)");
			$('d' + vram_loc).setAttribute("onmouseover","addmappingmenu(this,1,1)");
			$('d' + vram_loc).setAttribute("oncontextmenu","tilemenu(this);return false;");
            vram_loc++;
        }
    }
	buf = buf==[]?[0]:buf; // fill dplc_hdr incase flex thinks headers aren't loaded
	state.dplc_hdr = buf;
}