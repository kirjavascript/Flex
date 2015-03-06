var operations = [
	{ func: _nemesis_decode },
	{ func: _kosinski_decode },
	{ func: _moduled_kosinski_decode },
	{ func: _comper_decode },
	{ func: _enigma_decode },
	{ func: _nemesis_encode },
	{ func: _kosinski_encode },
	{ func: _moduled_kosinski_encode },
	{ func: _comper_encode },
	{ func: _enigma_encode },
];			
			
function encdec(data,type,enc) {
	type=parseInt(type);
	if(type==-1) return data;
	if(enc) type+=5;
	var input=new Int8Array(data.length);
	for(var i=0,j=data.length;i<j;++i){
	  input[i]=data.charCodeAt(i);
	}
	var sp = Runtime.stackSave();
	try {
		var inputPtr = _malloc(input.length);
		try {
			writeArrayToMemory(input, inputPtr);
			var outputPtrPtr = Runtime.stackAlloc(4);
			var outputSizePtr = Runtime.stackAlloc(4);
			if (operations[type].func(inputPtr, input.length, outputPtrPtr, outputSizePtr)) {
				var outputPtr = HEAP32[outputPtrPtr >> 2];
				try {
					var outputSize = HEAP32[outputSizePtr >> 2];
					var output = new Uint8Array(outputSize);
					var outputBuffer = outputPtr;
					for (var i=0; i < outputSize; i++) output[i] = HEAP8[outputBuffer++];
					var dump = "";
					for (var i=0; i<output.byteLength; i++) dump += String.fromCharCode(output[i]);
					return dump;

				} finally {
					_free(outputPtr);
				}
			}
		} finally {
			_free(inputPtr);
		}
	} finally {
		Runtime.stackRestore(sp);
	}
}