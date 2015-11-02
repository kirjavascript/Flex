/* Mouse Stuff */

var _mousedown=0;
var _mousebutton=0;
var _mouseimport=0;

document.onmouseup = function(e) {
	drag_mouseup(e);
	_mousedown = 0
};
document.onmousemove = function (e) {
	drag_mousemove(e);
	if(_mouseimport) window.getSelection().removeAllRanges();
};
document.onmousedown = function(e) {
	_mousedown=1;
	_mousebutton=e.button
};

function drag_mousedown(e){
	var mxy = getXY(e);
	var box = $("select");
	box.orig_x = mxy[0];
	box.orig_y = mxy[1];
	box.style.left = mxy[0]+"px";
	box.style.top = mxy[1]+"px";
	box.style.display = "block";
}

function drag_mousemove(e){
	var box = $("select");
	if(box.style.display=="block") {
		var mxy = getXY(e);
		box.style.width = (mxy[0]-box.orig_x)+"px";
		box.style.height = (mxy[1]-box.orig_y)+"px";
	}
}

function drag_mouseup(e){
	var box = $("select");
	if(box.style.display=="block") {
		box.style.display = "none";
		box.style.width = "0";
		box.style.height = "0";
	}
}

function getXY(a){if(a=a||window.event){if(a.pageX||0==a.pageX)return[a.pageX,a.pageY];var b=document.documentElement||{},c=document.body||{};if((a.clientX||0==a.clientX)&&(c.scrollLeft||0==c.scrollLeft||b.clientLeft||0==b.clientLeft))return[a.clientX+(b.scrollLeft||c.scrollLeft||0)-(b.clientLeft||0),a.clientY+(b.scrollTop||c.scrollTop||0)-(b.clientTop||0)]}return null};

/* Menu stuff */

function killmenus() {
	clearTimeout(window.anim_timer);
	_mouseimport = 0;
	var menus = ['tilemenu','mappingmenu','palettemenu','loadpal','editraw','adddplc','animmenu','importmenu','deletetilemenu','guidelinesmenu','zoommenu'];

	for(var i=0;i<menus.length;i++) if($(menus[i])) $(menus[i]).remove();
}

function createmessage(w, h, content, x, y, timeout, id, cls) { // x and y have to be percentages
    var d = document.createElement('div');
    d.className = "option";
    if (cls) d.classname = cls;
    d.innerHTML = content;
    if (id) d.id = id;
    if (w) d.style.width = w + "px";
    d.style.textAlign = "center";
    if (h) d.style.height = h + "px";
    if (x) {
        d.style.top = y + "%";
        d.style.left = x + "%";
        if (w) d.style.marginTop = -w / 2 + "px";
        if (h) d.style.marginLeft = -h / 2 + "px";
    }
    if (timeout) {
        setTimeout(function () {
            d.remove();
        }, timeout);
    }
    document.body.appendChild(d);
}

function loadpal_gui(save) {
	killmenus();
	var data = (function () {/*
	Which Line?
	<select id="pal_select">
	<option value=3>Line 0</option>
	<option value=4>Line 1</option>
	<option value=5>Line 2</option>
	<option value=6>Line 3</option>
	<option value=7>Line 1+2+3</option>
	<option value=9>All Lines</option>
	</select>
	<input type="button" id="plb" value="Load" onClick="loadpal($('pal_select').value)">
	<input type="button" value="Close" onClick="this.parentNode.remove()">
	*/}).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
	createmessage(100,90,data, null, null, null, "loadpal");

	if (save) {
		$('plb').value = 'Save';
		$('plb').setAttribute("onclick","savepal($('pal_select').value)");
	}
}

function changepal_gui(line,num) {
	killmenus();
	var data = (function () {/*
	Choose new colour for palette (<span id="paltitle"></span>)
	<div class="editpalette" id="editpalette"></div>
	&nbsp;<br>
	<span id="palfoot"></span><br>&nbsp;<br>
	<input type="button" value="Close" onClick="this.parentNode.remove()" style="width:60px">
	*/}).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
	createmessage(560,370,data, null, null, null, "palettemenu");

	for(var j=0;j<8;j++) {
		for(var i=0;i<8;i++) {
			for(var k=0;k<8;k++) {
				var c = document.createElement('div');
				c.className="minipalette";
				c.setAttribute("onclick","update_palette(this,"+line+","+num+","+k+","+j+","+i+")");
				c.setAttribute("onmouseover","palettename(this)");
				c.style.backgroundColor="#"+dc(i)+dc(j)+dc(k);
				$('editpalette').appendChild(c);
			}
		}
	}

	$('paltitle').innerHTML = $('p_'+line+'_'+num).style.backgroundColor.match(/\d+/g).toString();
}

function palettename(ele) {
	var clr = ele.style.backgroundColor.match(/\d+/g);
	$('palfoot').innerHTML = "Red: "+clr[0]+" Green: "+clr[1]+" Blue: "+clr[2];
}

var colours = [0,2,4,6,8,0xA,0xC,0xE];

function update_palette(ele,line,num,b,g,r) {
	$('p_'+line+'_'+num).style.backgroundColor = ele.style.backgroundColor;
	$('palettemenu').remove();
	state.palettes[line] = bytesplice(state.palettes[line],num*2,colours[b]);
	state.palettes[line] = bytesplice(state.palettes[line],(num*2)+1,(colours[g] * 0x10) + colours[r]);
	render_all();
}

function dc(num) {
	return colours[num].toString(16).toUpperCase()+colours[num].toString(16).toUpperCase()
}

function tilemenu(ele) {
	killmenus();
	if(state.dplc != ""&&ele.id=="sub") {
		tile = $('d'+ele.innerHTML).innerHTML; // oh my god what am I doing
	}else {
		tile = ele.innerHTML;
	}

	tile_data = state.art.substr((tile*0x20),0x20);
    var data = (function () {
        /*
		Tile Editor (<span id="tileid"></span>)
			<div class="edittile" id="edittile"></div>

			Select colours from the palette<br>&nbsp;<br>
			<div class="selectors" id="writetile_0"></div>
			<div class="selectors" id="writetile_1"></div>
			<br>
			<input type="button" value="Save" onClick="savetile(tile)" style="width:60px">
			<input type="button" value="Close" onClick="this.parentNode.remove()" style="width:60px">
		*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    createmessage(260, 360, data, null, null, null, "tilemenu");

	for(var i=0;i<0x20;i++) {
		var pxlz = tile_data.charCodeAt(i);
		pxl0 = pxlz >> 4;
		pxl1 = pxlz & 0xF;
		$('edittile').appendChild(draw_bigtile(pxl0,0));
		$('edittile').appendChild(draw_bigtile(pxl1,0));
	}
	$('tileid').innerHTML = parseInt(tile).toString(16).toUpperCase();

	palettehandler($('p_0_0'),0);
	palettehandler($('p_0_1'),1);
}

function draw_bigtile(num,line) {
	var c = document.createElement('div');
	c.className="bigtile";
	c.setAttribute("onclick","setcolour(this)");
	c.setAttribute("onmouseover","setcolour(this,1)");
	c.setAttribute("oncontextmenu","setcolour(this);return false;");
	c.style.backgroundColor = $('p_'+line+'_'+num).style.backgroundColor;
	c.style.color = $('p_'+line+'_'+num).style.backgroundColor;
	c.innerHTML = num;
	return c;
}

function setcolour(e,check) {
	if(!check||_mousedown) {
		var type = (_mousebutton==2?1:0);
		e.style.backgroundColor = $('writetile_'+type).style.backgroundColor;
		e.style.color = $('writetile_'+type).style.backgroundColor;
		e.innerHTML = $('writetile_'+type).innerHTML; }
}

function savetile(tile) {
	var divs = $('edittile').getElementsByTagName('div');
	var data = "";
	for(i=0;i<divs.length;i+=2) {
		data = bytesplice(data,i/2,parseInt(divs[i].innerHTML <<4) + parseInt(divs[i+1].innerHTML));
	}
	//wordslice 0x10
	state.art = state.art.substr(0,tile*0x20) + data + state.art.substr((++tile)*0x20);
	tile--;
	var ctx = $('t'+tile).getContext('2d');
	drawtocanvas(ctx,tile,0);
	loadsprite(state.map_frame);
}


var menu_tile = 0;

function addmappingmenu(ele,dyn,move) {
    if(!_mousedown&&move) return 0;
	if(move&&_mousebutton==2) {tilemenu(ele); return 0;}
	killmenus();
    var data = (function () {
        /*
        		<span id="mapdplc">Add new mapping piece</span>&emsp;<input type="button" value="Cancel" onClick="this.parentNode.remove()" style="width:60px">
        		<table class="addtable" id="addtable">
        		<tr>
        			<td id="ta0"><div id="a0"></div></td>
        			<td id="ta1"><div id="a1"></div></td>
        			<td id="ta2"><div id="a2"></div></td>
        			<td id="ta3"><div id="a3"></div></td>
        		</tr>
        		<tr>
        			<td><div id="a4"></div></td>
        			<td><div id="a5"></div></td>
        			<td><div id="a6"></div></td>
        			<td><div id="a7"></div></td>
        		</tr>
        		<tr>
        			<td><div id="a8"></div></td>
        			<td><div id="a9"></div></td>
        			<td><div id="a10"></div></td>
        			<td><div id="a11"></div></td>
        		</tr>
        		<tr>
        			<td><div id="a12"></div></td>
        			<td><div id="a13"></div></td>
        			<td><div id="a14"></div></td>
        			<td><div id="a15"></div></td>
        		</tr>
        		</table>
        		*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    createmessage(340, 360, data, null, null, null, "mappingmenu");

	if(ele) menu_tile = ele.id.slice(1);

	// zoomfix
	for(var i=0;i<3;i++) $('ta'+i).style.width = ((zoom*8) * (i+1))+'px';
	$('addtable').style.width = ((zoom*80) + 30)+'px';

    for (var x = 0, i = 0; 4 > i; i++) {
        t = menu_tile;

        for (var j = 0; j < i + 1; j++) {
            loadonemap("choose html5nuke", $("a" + i), t++, 32 * j, 1, null, dyn);
        }
    }
    for (var i = 4; 8 > i; i++) {
        for (tfix = generatematricies(2), j = x = 0; j < i - 3; j++) {
            for (var k = 0; 2 > k; k++) {
                loadonemap("choose html5nuke", $("a" + i), parseInt(menu_tile) + parseInt(tfix[i - 4][x++]),null,null,null,dyn);
            }

        }
    }
    for (var i = 8; 12 > i; i++) {
        for (tfix = generatematricies(3), j = x = 0; j <= i - 8; j++) {
            for (k = 0; 3 > k; k++) {
                loadonemap("choose html5nuke", $("a" + i), parseInt(menu_tile) + parseInt(tfix[i - 8][x++]),null,null,null,dyn);
            }
        }
    }
    for (var i = 12; 16 > i; i++) {
        for (tfix = generatematricies(4), j = x = 0; j < i - 11; j++) {
            for (k = 0; 4 > k; k++) {
                loadonemap("choose html5nuke", $("a" + i), parseInt(menu_tile) + parseInt(tfix[i - 12][x++]),null,null,null,dyn);
            }
        }
    }
    for (var i = 0; i < 16; i++)
        $('a' + i).setAttribute("onclick", "addpiece(" + menu_tile + ",this,"+dyn+")")

    if(dyn) {
        $('mapdplc').innerHTML = "Add new piece from DPLC list";
    }
    else if (state.dplc!="") {
        $('mapdplc').innerHTML += ' with DPLC';
    }

}

function generatematricies(height) {
    var buf = [];
    for (var x = 1; x < 5; x++) {
        var t = 0;
        var buf2 = [];
        for (var iY = 0; iY < height; iY++) {
            for (var iX = 0; iX < x; iX++) {
                buf2[buf2.length] = t + (height * iX);
            }
            t++;
        }
        buf[buf.length] = buf2;
    }
    return buf;
}

function spritemenu() {
    var data = (function () {
        /*
        		Sprite Menu<br>
        		<input type="button" value="Edit Raw Data" onClick="editraw(0)"><br>
        		<input type="button" value="Add Frame" onClick="addmap()"><br>
        		<input type="button" value="Duplicate Frame" onClick="dupemap()"><br>
        		<input type="button" value="Delete Frame" onClick="delmap()"><br>
        		<input type="button" value="Delete Unused Art" onClick="delete_unmapped()"><br>
						<input type="button" value="Transparency" onClick="ttoggle()"><br>
						<input type="button" value="Set Zoom" onClick="zoommenu()"><br>
						<input type="button" value="Export to PNG" onClick="png()"><br>
        		<input type="button" value="Create Animation" onClick="anim()"><br>
        		<input type="button" value="Guidelines" onClick="guidelinesmenu()"><br>

        	*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    $('mapmenu').innerHTML = data;
	if(map==0) transformmenu();
    if (state.dplc != "") dplcmenu();
}

function dplcmenu() {
    var data = (function () {
        /*
        		DPLC Menu<br>
        		<input type="button" value="Edit Raw Data" onClick="editraw(1)"><br>
        		<input type="button" value="Add new DPLC" onClick="addnewdplc()"><br>
        	*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    $('mapmenu').innerHTML += data;
};

function addnewdplc() {
	killmenus();
	var out = "Add DPLC<br>&nbsp;<br>";
	out += 'Number of tiles to load $ <input type="text" id="dplc0" style="width:50px" maxlength="1"><br>';
	out += 'Starting tile # $ <input type="text" id="dplc1" style="width:100px" maxlength="3">';
	out += '<br>&nbsp;<br><input type="button" value="Save" onClick="adddplc($(\'dplc0\').value,$(\'dplc1\').value)">';
	out += '<input type="button" value="Close" onClick="this.parentNode.remove()">';
	createmessage(250, 125, out, 60, 20,null,"adddplc");
}

function transformmenu() {
    var data = (function () {
        /*
			<input type="button" value="Flip X" onClick="flip(0)"><br>
			<input type="button" value="Flip Y" onClick="flip(1)"><br>
			<input type="button" value="Change Palette" onClick="palshift()"><br>
			<!--<input type="button" id="priority" value="" onClick="priority()"><br>-->
        	*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    $('mapmenu').innerHTML += data;

	//setpriority();
}

function piecemenu() {
    spritemenu();
    var data = (function () {
        /*
			Piece Menu<br>
			<input type="button" value="Flip X" onClick="flip(0)"><br>
			<input type="button" value="Flip Y" onClick="flip(1)"><br>
			<input type="button" value="Change Palette" onClick="palshift()"><br>
			<input type="button" id="priority" value="" onClick="priority()"><br>
			<input type="button" value="Delete Piece" onClick="deletepiece()"><br>
			<input type="button" value="Deselect" onClick="deselectmap()"><br>
        	*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    $('mapmenu').innerHTML += data;

	setpriority();
}

function deletetilemenu(ele) {
	killmenus();
	if(state.dplc != ""&&ele.id=="sub") {
		tile = $('d'+ele.innerHTML).innerHTML; // oh my god what am I doing
	}else {
		tile = ele.innerHTML;
	}
	tile_data = state.art.substr((tile*0x20),0x20);
    var data = (function () {
        /*
		Delete tile <span id="tileid"></span>?
			<div class="edittile" id="edittile"></div>
			<br>&nbsp;<br>
			<input type="button" value="Delete" onClick="deletetilemenudelete()" style="width:60px">
			<input type="button" value="Close" onClick="this.parentNode.remove()" style="width:60px">
		*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    createmessage(260, 320, data, null, null, null, "deletetilemenu");

	for(var i=0;i<0x20;i++) {
		var pxlz = tile_data.charCodeAt(i);
		pxl0 = pxlz >> 4;
		pxl1 = pxlz & 0xF;
		$('edittile').appendChild(draw_bigtile(pxl0,0));
		$('edittile').appendChild(draw_bigtile(pxl1,0));
	}
	$('tileid').innerHTML = parseInt(tile).toString(16).toUpperCase();
}

function deletetilemenudelete(tile) {
	delete_shift(parseInt($('tileid').innerHTML,16));
	if ($('deletetilemenu')) $('deletetilemenu').remove();
	loadsprite(state.map_frame);
}

function guidelinesmenu() {
	killmenus();
    var data = (function () {
        /*
		Set mapping guidelines
			<br>&nbsp;<br>
			<input type="text" id="gu_x" value="0" class="miniinput"><input type="text" id="gu_y" value="0" class="miniinput">
			<br>&nbsp;<br>
			<input type="button" value="Set" onClick="guidelines()" style="width:60px">
			<input type="button" value="Remove Guidelines" onClick="remove_guidelines()" style="width:120px">
			<input type="button" value="Close" onClick="this.parentNode.remove()" style="width:60px">
		*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    createmessage(260, 100, data, null, null, null, "guidelinesmenu");
}

function zoommenu() {
	killmenus();
    var data = (function () {
        /*
		Set Zoom Level
			<br>&nbsp;<br>
			<input type="text" id="zoom" value="100" class="miniinput"> %
			<br>&nbsp;<br>
			<input type="button" value="Set" onClick="setzoom($('zoom').value)" style="width:60px">
			<input type="button" value="Close" onClick="this.parentNode.remove()" style="width:60px">
		*/
    }).toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
    createmessage(200, 100, data, null, null, null, "zoommenu");
}

function guidelines(x_pos,y_pos) {
	if(x_pos==null) x_pos = parseInt($('gu_x').value);
	if(y_pos==null) y_pos = parseInt($('gu_y').value);
	x_pos*=zoom;
	y_pos*=zoom;
	if (state.map == "") return 0;
	remove_guidelines();
	var x = document.createElement('div');
	x.id = 'x';
	x.style.right = parseInt(-x_pos+300) + "px";
	x.className="x";
	$('mappings').appendChild(x);
	var y = document.createElement('div');
	y.id = 'y';
	y.style.top = parseInt(y_pos+200) + "px";
	y.className="y";
	$('mappings').appendChild(y);
	if ($('guidelinesmenu')) $('guidelinesmenu').remove();
}

function remove_guidelines() {
	if($('x')) $('x').remove();
	if($('y')) $('y').remove();
	if ($('guidelinesmenu')) $('guidelinesmenu').remove();
}

function anim() {
	killmenus();
	stopanim();
	var out = "Create Animation<br>&nbsp;<br>";
	out += 'Timer delay (ms) <input type="text" id="anim0" style="width:50px" value="200"><br>&nbsp;<br>';
	out += 'Frames to animate<br><span style="font-size:10px">(separate with a comma)</span><br><input type="text" id="anim1" style="width:200px">';
	out += '<br>&nbsp;<br><input type="button" value="Run" onClick="runanim()">';
	out += '<input type="button" value="Close" onClick="this.parentNode.remove()">';
	createmessage(250, 170, out, null, null,null,"animmenu");
}

function runanim() {
	if($('anim0').value==""||$('anim1').value=="") return 0;
	var frames = datastr2arr($('anim1').value);
	var delay = parseInt($('anim0').value);
	window.anim_frame = 0
	window.anim_timer = setInterval(function(){ // set interval
		if(parseInt(frames[window.anim_frame],16)>=state.map_arr.length) {
			clearTimeout(window.anim_timer);
			createmessage(250,25,"Frame $"+frames[window.anim_frame]+" does not exist",50,50,2000);
			$('animmenu').remove();
		}
		loadsprite(parseInt(frames[window.anim_frame],16));
		window.anim_frame++;
		if(window.anim_frame%frames.length==0) window.anim_frame = 0;
	}, delay);
	$('animmenu').remove();
	var out = "Animation Running<br>&nbsp;<br>";
	var animstring = "";
	for(i=0;i<frames.length;i++) animstring+="$"+frames[i]+", ";
	out += animstring.substr(0,animstring.length-2) + "<br>&nbsp;<br>";
	out += '<input type="button" value="Stop" onClick="stopanim();this.parentNode.remove()">';
	createmessage(150, 120, out, null, null,null,"animmenu");
}

function stopanim() {
	clearTimeout(window.anim_timer);
	window.anim_frame = 0;
	loadsprite(state.map_frame);
}
