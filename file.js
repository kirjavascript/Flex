function loadart() {
	$('files').click();
	load_type = 0;
}
function loadpal(num) {
	if(num) {
		$('files').click();
		load_type = parseInt(num);
	}
	else {
		loadpal_gui();
	}
}
function loadmap() {
	$('files').click();
	load_type = 1;
}
function loadplc() {
	$('files').click();
	load_type = 2;
}
function loadstate() {
	$('files').click();
	load_type = 8;
}
function savestate() {
	savefile("state.flex",JSON.stringify(state));
}

function saveart() {
	if(state.filename[0]) savefile(state.filename[0],encdec(state.art,$('cmp').value,1));
	else savefile("art.bin",encdec(state.art,$('cmp').value,1));
}

function savemap() {
	if(state.map=="") { createmessage(250,25,"There are no mappings to save",50,50,2000);return 0;}
	else {
		if(state.filename[1]) savefile(state.filename[1],mappingoutput());
		else savefile("map.bin",mappingoutput());
	}
}

function savedplc() {
	if(state.dplc=="") { createmessage(250,25,"There are no DPLCs to save",50,50,2000);return 0;}
	else {
		if(state.filename[2]) savefile(state.filename[2],dplcoutput());
		else savefile("dplc.bin",dplcoutput());
	}
}

function savepal(line) {
	switch(parseInt(line)) {
		case 3: savefile("palette_0.bin",state.palettes[0]); break;
		case 4: savefile("palette_1.bin",state.palettes[1]); break;
		case 5: savefile("palette_2.bin",state.palettes[2]); break;
		case 6: savefile("palette_3.bin",state.palettes[3]); break;
		case 7: savefile("palette_123.bin",state.palettes[1]+state.palettes[2]+state.palettes[3]); break;
		case 9: savefile("palette_all.bin",state.palettes[0]+state.palettes[1]+state.palettes[2]+state.palettes[3]); break;
	}
}

function savefile(filename,data,href) {
	var b=document.createElement('a');
	b.download=filename;
	b.textContent=filename;
	b.innerHTML="";
	if(href) b.href = href;
	else b.href='data:application/json;base64,'+window.btoa(data)
	document.body.appendChild(b);
	clicklink(b);
	b.remove();
}

function clicklink(b){
	// from ecmascript.stchur.com (minified with clojure compiler)
	var a=!0;b.click?b.click():(document.createEvent&&(a=document.createEvent("MouseEvents"),a.initEvent("click",!0,!0),a=b.dispatchEvent(a)),a&&(a=document.createElement("form"),a.action=b.href,document.body.appendChild(a),a.submit()))
};

function loadfile() {
	filename = $('files').value;
	var files = $('files').files;
	if (!files.length) { alert('Please select a file!'); return; }
	var reader = new FileReader();
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) {
		switch(load_type) {
			case 0: 
				state.art = evt.target.result;
				state.art = encdec(state.art,$('cmp').value);
				loadtiles(); 
				state.filename[0] = filename; 
				loadsprite(state.map_frame); 
				break;
			case 1: state.map = evt.target.result; loadmaps(1); state.filename[1] = filename; break;
			case 2: state.dplc = evt.target.result; loaddplcs(1); state.filename[2] = filename; break;
			case 3: state.palettes[0] = evt.target.result.substr(0,32); render_all(); break;
			case 4: state.palettes[1] = evt.target.result.substr(0,32); render_all(); break;
			case 5: state.palettes[2] = evt.target.result.substr(0,32); render_all(); break;
			case 6: state.palettes[3] = evt.target.result.substr(0,32); render_all(); break;
			case 7: state.palettes[1] = evt.target.result.substr(0,32); 
				state.palettes[2] = evt.target.result.substr(32,64); 
				state.palettes[3] = evt.target.result.substr(64,96); 
				render_all(); break;
			case 8: state = JSON.parse(evt.target.result); render_all(); break;
            case 9:
				if(evt.target.result.length>=32) state.palettes[0] = evt.target.result.substr(0,32); 
				if(evt.target.result.length>=64) state.palettes[1] = evt.target.result.substr(32,64); 
				if(evt.target.result.length>=96) state.palettes[2] = evt.target.result.substr(64,96); 
				if(evt.target.result.length>=128) state.palettes[3] = evt.target.result.substr(96,128); 
				render_all(); break;
		}
		
      }
    };
    var data = files[0].slice(0, files[0].size);
    reader.readAsBinaryString(data);
}

function importart() {
	$('import').click();
} 
function loadimport(e){
	var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
		//img.crossOrigin = "Anonymous";
        img.onload = function(){
			$('buffer').innerHTML = '';
			var imgin = document.createElement('canvas');
			$('buffer').appendChild(imgin);
			ctx = imgin.getContext("2d");
            imgin.width = img.width;
            imgin.height = img.height;
            ctx.drawImage(img,0,0);
			importtiles(imgin);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);  
}