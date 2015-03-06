// http://segaretro.org/Palette

function draw_palettes() {
	$('palettes').innerHTML = "";
	for(var i=0;i<0x10;i++) {
		for(var i=0;i<state.palettes[0].length;i+=2) {
			$('palettes').innerHTML += "<div style=\"clear:both\"></div>";
			for(var j=0;j<4;j++) {
				$('palettes').innerHTML+= "<div class=\"palette\" id='p_"+j+"_"+i/2+"' style='background-color:#"+md_rgb(state.palettes[j][i],state.palettes[j][i+1])+"' onClick='palettehandler(this,0)' oncontextmenu='palettehandler(this,1);return false;' >&nbsp;</div>";
			}
		}
	}
}

function palettehandler(e,c) {
	if ($('tilemenu')) {
		data = e.id.split("_");
		if(data[1]==0) {
			$('writetile_'+c).style.backgroundColor = e.style.backgroundColor;
			$('writetile_'+c).style.color = e.style.backgroundColor;
			$('writetile_'+c).innerHTML = data[2];
		}
	}
	else {
		var pdata = e.id.split("_");
		changepal_gui(pdata[1],pdata[2]);
	}
}

function md_rgb(x,y) {
	if(!x||!y) return "000000";
	var b = x.charCodeAt(0).toString(16);
	b = b.toString()+b.toString();
	var gr = y.charCodeAt(0).toString(16);
	gr = gr.length>1?gr:"0"+gr;
	var g = gr[0].toString(16)+gr[0].toString(16);
	var r = gr[1].toString(16)+gr[1].toString(16);
	return r+g+b;
}

function shiftleft() {
	var start = copy(state.palettes[0]);
	state.palettes[0] = copy(state.palettes[1]);
	state.palettes[1] = copy(state.palettes[2]);
	state.palettes[2] = copy(state.palettes[3]);
	state.palettes[3] = start;
	render_all()
}

function shiftright() {
	var start = copy(state.palettes[3]);
	state.palettes[3] = copy(state.palettes[2]);
	state.palettes[2] = copy(state.palettes[1]);
	state.palettes[1] = copy(state.palettes[0]);
	state.palettes[0] = start;
	render_all()
}