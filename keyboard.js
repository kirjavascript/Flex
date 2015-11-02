/* mousetrap v1.5.3 craig.is/killing/mice */
(function(C,r,g){function t(a,b,h){a.addEventListener?a.addEventListener(b,h,!1):a.attachEvent("on"+b,h)}function x(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return l[a.which]?l[a.which]:p[a.which]?p[a.which]:String.fromCharCode(a.which).toLowerCase()}function D(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function u(a){return"shift"==a||"ctrl"==a||"alt"==a||
"meta"==a}function y(a,b){var h,c,e,g=[];h=a;"+"===h?h=["+"]:(h=h.replace(/\+{2}/g,"+plus"),h=h.split("+"));for(e=0;e<h.length;++e)c=h[e],z[c]&&(c=z[c]),b&&"keypress"!=b&&A[c]&&(c=A[c],g.push("shift")),u(c)&&g.push(c);h=c;e=b;if(!e){if(!k){k={};for(var m in l)95<m&&112>m||l.hasOwnProperty(m)&&(k[l[m]]=m)}e=k[h]?"keydown":"keypress"}"keypress"==e&&g.length&&(e="keydown");return{key:c,modifiers:g,action:e}}function B(a,b){return null===a||a===r?!1:a===b?!0:B(a.parentNode,b)}function c(a){function b(a){a=
a||{};var b=!1,n;for(n in q)a[n]?b=!0:q[n]=0;b||(v=!1)}function h(a,b,n,f,c,h){var g,e,l=[],m=n.type;if(!d._callbacks[a])return[];"keyup"==m&&u(a)&&(b=[a]);for(g=0;g<d._callbacks[a].length;++g)if(e=d._callbacks[a][g],(f||!e.seq||q[e.seq]==e.level)&&m==e.action){var k;(k="keypress"==m&&!n.metaKey&&!n.ctrlKey)||(k=e.modifiers,k=b.sort().join(",")===k.sort().join(","));k&&(k=f&&e.seq==f&&e.level==h,(!f&&e.combo==c||k)&&d._callbacks[a].splice(g,1),l.push(e))}return l}function g(a,b,n,f){d.stopCallback(b,
b.target||b.srcElement,n,f)||!1!==a(b,n)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=x(a);b&&("keyup"==a.type&&w===b?w=!1:d.handleKey(b,D(a),a))}function l(a,c,n,f){function e(c){return function(){v=c;++q[a];clearTimeout(k);k=setTimeout(b,1E3)}}function h(c){g(n,c,a);"keyup"!==f&&(w=x(c));setTimeout(b,10)}for(var d=q[a]=0;d<c.length;++d){var p=d+1===c.length?h:e(f||
y(c[d+1]).action);m(c[d],p,f,a,d)}}function m(a,b,c,f,e){d._directMap[a+":"+c]=b;a=a.replace(/\s+/g," ");var g=a.split(" ");1<g.length?l(a,g,b,c):(c=y(a,c),d._callbacks[c.key]=d._callbacks[c.key]||[],h(c.key,c.modifiers,{type:c.action},f,a,e),d._callbacks[c.key][f?"unshift":"push"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:e,combo:a}))}var d=this;a=a||r;if(!(d instanceof c))return new c(a);d.target=a;d._callbacks={};d._directMap={};var q={},k,w=!1,p=!1,v=!1;d._handleKey=function(a,
c,e){var f=h(a,c,e),d;c={};var k=0,l=!1;for(d=0;d<f.length;++d)f[d].seq&&(k=Math.max(k,f[d].level));for(d=0;d<f.length;++d)f[d].seq?f[d].level==k&&(l=!0,c[f[d].seq]=1,g(f[d].callback,e,f[d].combo,f[d].seq)):l||g(f[d].callback,e,f[d].combo);f="keypress"==e.type&&p;e.type!=v||u(a)||f||b(c);p=l&&"keydown"==e.type};d._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)m(a[d],b,c)};t(a,"keypress",e);t(a,"keydown",e);t(a,"keyup",e)}var l={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",
20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},p={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},A={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},z={option:"alt",command:"meta","return":"enter",
escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},k;for(g=1;20>g;++g)l[111+g]="f"+g;for(g=0;9>=g;++g)l[g+96]=g;c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+":"+b])this._directMap[a+":"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};this._directMap=
{};return this};c.prototype.stopCallback=function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")||B(b,this.target)?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.init=function(){var a=c(r),b;for(b in a)"_"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};c.init();C.Mousetrap=c;"undefined"!==typeof module&&module.exports&&(module.exports=
c);"function"===typeof define&&define.amd&&define(function(){return c})})(window,document);

// allow global
Mousetrap=function(a){var d={},e=a.stopCallback;a.stopCallback=function(b,c,a){return d[a]?!1:e(b,c,a)};a.bindGlobal=function(b,c,e){a.bind(b,c,e);if(b instanceof Array)for(c=0;c<b.length;c++)d[b[c]]=!0;else d[b]=!0};return a}(Mousetrap);

// allow pause/unpause
(function(a){var b=a.prototype.stopCallback;a.prototype.stopCallback=function(a,c,d){return this.paused?!0:b.call(this,a,c,d)};a.prototype.pause=function(){this.paused=!0};a.prototype.unpause=function(){this.paused=!1};a.init()})(Mousetrap);


Mousetrap.bindGlobal('[',prevsprite);
Mousetrap.bindGlobal(']',nextsprite);
Mousetrap.bindGlobal('{',prevswap);
Mousetrap.bindGlobal('}',nextswap);
Mousetrap.bindGlobal('ctrl+ins',addmap);
Mousetrap.bindGlobal('shift+ins',dupemap);
Mousetrap.bindGlobal('ctrl+del',delmap);
Mousetrap.bindGlobal('del',deletepiece);
Mousetrap.bindGlobal('esc',deselectmap);
Mousetrap.bindGlobal('<',shiftleft);
Mousetrap.bindGlobal('>',shiftright);
Mousetrap.bindGlobal('h',function(){flip(0)});
Mousetrap.bindGlobal('v',function(){flip(1)});
Mousetrap.bindGlobal('p',palshift);
Mousetrap.bindGlobal('f',priority);
Mousetrap.bindGlobal(',',function(){changepiece(0)});
Mousetrap.bindGlobal('.',function(){changepiece(1)});
Mousetrap.bindGlobal('space',function(){if($('m0'))modifymap($('m0'))});

// shift for load

Mousetrap.bindGlobal('shift+a',loadart);
Mousetrap.bindGlobal('shift+m',loadmap);
Mousetrap.bindGlobal('shift+d',loadplc);
Mousetrap.bindGlobal('shift+s',loadstate);
Mousetrap.bindGlobal('shift+i',importart);
Mousetrap.bindGlobal('shift+p',function(){loadpal_gui()});
Mousetrap.bindGlobal('shift+0',function(){loadpal(3)});
Mousetrap.bindGlobal('shift+1',function(){loadpal(4)});
Mousetrap.bindGlobal('shift+2',function(){loadpal(5)});
Mousetrap.bindGlobal('shift+3',function(){loadpal(6)});

// alt+shift to save

Mousetrap.bindGlobal('alt+shift+a',saveart);
Mousetrap.bindGlobal('alt+shift+m',savemap);
Mousetrap.bindGlobal('alt+shift+d',savedplc);
Mousetrap.bindGlobal('alt+shift+s',savestate);
Mousetrap.bindGlobal('alt+shift+p',function(){loadpal_gui(1)});
Mousetrap.bindGlobal('alt+shift+0',function(){savepal(3)});
Mousetrap.bindGlobal('alt+shift+1',function(){savepal(4)});
Mousetrap.bindGlobal('alt+shift+2',function(){savepal(5)});
Mousetrap.bindGlobal('alt+shift+3',function(){savepal(6)});

Mousetrap.bindGlobal('alt+p',png);

Mousetrap.bindGlobal('ctrl+m',mode);

// backspace to unload

Mousetrap.bindGlobal('ctrl+alt+u',delete_unmapped);
Mousetrap.bindGlobal('ctrl+alt+a',unloadart);
Mousetrap.bindGlobal('ctrl+alt+m',unloadmaps);
Mousetrap.bindGlobal('ctrl+alt+d',unloaddplc);
Mousetrap.bindGlobal('ctrl+alt+x',unload_all);
Mousetrap.bindGlobal('~',delete_last_map);

Mousetrap.bindGlobal('pageup',function(){for(var i=0;i++<8;)nextsprite()});
Mousetrap.bindGlobal('pagedown',function(){for(var i=0;i++<8;)prevsprite()});
Mousetrap.bindGlobal('home',function(){if(state.map!="")state.map_frame=0,loadsprite(state.map_frame)});
Mousetrap.bindGlobal('end',function(){if(state.map!="")state.map_frame=state.map_arr.length-1,loadsprite(state.map_frame)});

Mousetrap.bindGlobal('w s a d , enter', function() {
	createmessage(640,450,"<img src='http://info.sonicretro.org/images/2/26/Ss.s2bls.png' style='width:100%;height:100%;'>",50,50,3000);
	console.log("<3");
});

Mousetrap.bindGlobal('up',mapup);
Mousetrap.bindGlobal('ctrl+up',function(){for(var i=0;i++<8;)mapup()});
Mousetrap.bindGlobal('down',mapdown);
Mousetrap.bindGlobal('ctrl+down',function(){for(var i=0;i++<8;)mapdown()});
Mousetrap.bindGlobal('left',mapleft);
Mousetrap.bindGlobal('ctrl+left',function(){for(var i=0;i++<8;)mapleft()});
Mousetrap.bindGlobal('right',mapright);
Mousetrap.bindGlobal('ctrl+right',function(){for(var i=0;i++<8;)mapright()});
