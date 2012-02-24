/**
* vkBeautify - javascript plugin to pretty-print or minify text in XML, JSON and CSS formats.
*  
* Version - 0.95.01.beta 
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/vkbeautify/
* 
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*	vkbeautify.xml|json|css(text ) - pretty print XML, JSON or CSS text;
*	vkbeautify.xmlmin|jsonmin|cssmin(text, preserveComments ) - minify XML, JSON or CSS text; 
*
* PARAMETERS:
*
*	@text  				- String; text to beautify;
* 	@preserveComments	- Bool (optional, used in minxml and mincss only); 
*						  Set this flag to true to prevent removing comments from @text; 
*	@Return 			- String;
*	
* USAGE:
*	
*	vkbeautify.xml(text); 
*	vkbeautify.json(text); 
*	vkbeautify.css(text); 
*	vkbeautify.xmlmin( text [, true]); 
*	vkbeautify.jsonmin(text); 
*	vkbeautify.cssmin( text [, true]); 
*
*/

(function() {

function vkbeautify(){
	this.shift = ['\n']; // array of shifts
	//var step = '  ', // 2 spaces
	this.step = '  ', // 2 spaces
		maxdeep = 100, // nesting level
		ix = 0;

	// initialize array with shifts //
	for(ix=0;ix<maxdeep;ix++){
		//this.shift.push(this.shift[ix]+step); 
		this.shift.push(this.shift[ix]+this.step); 
	}

};

vkbeautify.prototype.xml = function(text) {

	var ar = text.replace(/>\s{0,}</g,"><").replace(/</g,"~#~<").split('~#~'),
		len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0;

		for(ix=0;ix<len;ix++) {
			// start comment or <![CDATA[...]]> or <!DOCTYPE //
			if(ar[ix].search(/<!/) > -1) { 
				str += this.shift[deep]+ar[ix];
				inComment = true; 
				// end comment  or <![CDATA[...]]> //
				if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) { 
					inComment = false; 
				}
			} else 
			// end comment  or <![CDATA[...]]> //
			if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) { 
				str += ar[ix];
				inComment = false; 
			} else 
			// <elm></elm> //
			if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
				/^<\w+/.exec(ar[ix-1]) == /^<\/\w+/.exec(ar[ix])[0].replace('/','')) { 
				str += ar[ix];
				if(!inComment) deep--;
			} else
			 // <elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
				str = !inComment ? str += this.shift[deep++]+ar[ix] : str += ar[ix];
			} else 
			 // <elm>...</elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += this.shift[deep]+ar[ix] : str += ar[ix];
			} else 
			// </elm> //
			if(ar[ix].search(/<\//) > -1) { 
				str = !inComment ? str += this.shift[--deep]+ar[ix] : str += ar[ix];
			} else 
			// <elm/> //
			if(ar[ix].search(/\/>/) > -1 ) { 
				str = !inComment ? str += this.shift[deep]+ar[ix] : str += ar[ix];
			} else 
			// <? xml ... ?> //
			if(ar[ix].search(/<\?/) > -1) { 
				str += this.shift[deep]+ar[ix];
			} else {
				str += ar[ix];
			}
		}
		
	return  (str[0] == '\n') ? str.slice(1) : str;
}

vkbeautify.prototype.json = function(text) {

	var ar = text.replace(/\s{0,}\{\s{0,}/g,"{")
				.replace(/\s{0,}\[$/g,"[")
				.replace(/\[\s{0,}/g,"[")
		  		.replace(/\s{0,}\}\s{0,}/g,"}")
				.replace(/\s{0,}\]\s{0,}/g,"]")
				.replace(/\"\s{0,}\,/g,'",')
				.replace(/\,\s{0,}\"/g,',"')
				.replace(/\"\s{0,}:/g,'":')
				.replace(/:\s{0,}\"/g,':"')
				.replace(/:\s{0,}\[/g,':[')
				
				.replace(/\{/g,"~#~{~#~")
				.replace(/\[/g,"[~#~")
				.replace(/\}/g,"~#~}")
				.replace(/\]/g,"~#~]")
				.replace(/\"\,/g,'",~#~')
				.replace(/\,\"/g,',~#~"')
				.replace(/~#~\s{0,}~#~/g,"~#~")
				.split('~#~'),
				
		len = ar.length,
		deep = 0,
		str = '',
		ix = 0;

	for(ix=0;ix<len;ix++) {
		if( /\{/.exec(ar[ix]))  { 
			str += this.shift[deep++]+ar[ix];
		} else 
		if( /\[/.exec(ar[ix]))  { 
			str += this.shift[deep++]+ar[ix];
		}  else 
		if( /\]/.exec(ar[ix]))  { 
			str += this.shift[--deep]+ar[ix];
		}  else 
		if( /\}/.exec(ar[ix]))  { 
			str += this.shift[--deep]+ar[ix];
		} else {
			str += this.shift[deep]+ar[ix];
		}
	}
	return str.replace(/^\n{1,}/,'');
}

vkbeautify.prototype.css = function(text) {

	var ar = text.replace(/\s{1,}/g,' ')
				.replace(/\{/g,"{~#~")
				.replace(/\}/g,"~#~}~#~")
				.replace(/\;/g,";~#~")
				.replace(/\/\*/g,"~#~/*")
				.replace(/\*\//g,"*/~#~")
				.replace(/~#~\s{0,}~#~/g,"~#~")
				.split('~#~'),
		len = ar.length,
		deep = 0,
		str = '',
		ix = 0;
		
		for(ix=0;ix<len;ix++) {

			if( /\{/.exec(ar[ix]))  { 
				str += this.shift[deep++]+ar[ix];
			} else 
			if( /\}/.exec(ar[ix]))  { 
				str += this.shift[--deep]+ar[ix];
			} else
			if( /\*\\/.exec(ar[ix]))  { 
				str += this.shift[deep]+ar[ix];
			}
			else {
				str += this.shift[deep]+ar[ix];
			}
		}
		return str.replace(/^\n{1,}/,'');
}

function replace_sql(str) {

	return str.replace(/\s{1,}/g," ")
				//.replace(/~#~/g," ")
				.replace(/ AND /ig,"\nAND ")
				.replace(/ BETWEEN /ig,"\nBETWEEN ")
				.replace(/ CASE /ig,"\nCASE ")
				.replace(/ FROM /ig,"\nFROM ")
				.replace(/ GROUP \s{1,}BY/ig,"\nGROUP BY ")
				.replace(/ HAVING /ig,"\nHAVING ")
				.replace(/ IN /ig,"\nIN ")
				.replace(/ JOIN /ig,"\nJOIN ")
				.replace(/ CROSS\s{1,}JOIN /ig,"\nCROSS JOIN ")
				.replace(/ INNER\s{1,}JOIN /ig,"\nINNER JOIN ")
				.replace(/ LEFT\s{1,}JOIN /ig,"\nLEFT JOIN ")
				.replace(/ RIGHT\s{1,}JOIN /ig,"\nRIGHT JOIN ")
				.replace(/ LIKE /ig,"\LIKE ")
				.replace(/ ON /ig,"\nON ")
				.replace(/ OR /ig,"\nOR ")
				.replace(/ ORDER\s{1,}BY/ig,"\nORDER BY ")
				.replace(/\s{0,}SELECT /ig,"\nSELECT ")
				.replace(/ USING /ig,"\nUSING ")
				.replace(/ WHEN /ig,"\nWHEN ")
				.replace(/ WHERE /ig,"\nWHERE ")
				.replace(/ WITH /ig,"\nWITH ")
				
				.replace(/\,\s{0,}\(/ig,",\n( ")
				//.replace(/ \)\s{0,}\,/ig,"),\n ")
				.replace(/\)/ig,")\n ")
				//.replace(/\'/ig,"~#~\'")
				
				.replace(/ DISTINCT /ig,"\DISTINCT ")
				.replace(/ NOT /ig," NOT ")
				.replace(/ NULL /ig," NULL ")
				.replace(/ All /ig," ALL ")
				.replace(/ AS /ig," AS ")
				.replace(/ EXISTS /ig," EXISTS ")
				.replace(/ ASC /ig," ASC ")	
				.replace(/ DESC /ig," DESC ")					
				
				.replace(/\n{1,}/g,"\n");
}

vkbeautify.prototype.sql = function(text) {
//	var ar = text.replace(/\s{1,}/g," ")
//				.replace(/\'/ig,"~#~\'")
//				.split('~#~'),
	var ar = text.replace(/\s{1,}/g," ")
				//.replace(/~#~/g," ")
				//.replace(/\,/ig,",~#~")
				
				.replace(/ AND /ig,"~#~\tAND ")
				.replace(/ BETWEEN /ig,"~#~BETWEEN ")
				.replace(/ CASE /ig,"~#~CASE ")
				.replace(/ FROM /ig,"~#~FROM ")
				.replace(/ GROUP\s{1,}BY/ig,"~#~GROUP BY ")
				.replace(/ HAVING /ig,"~#~HAVING ")
				.replace(/ IN /ig,"~#~IN ")
				.replace(/ JOIN /ig,"~#~JOIN ")
				.replace(/ CROSS\s{1,}JOIN /ig,"~#~CROSS JOIN ")
				.replace(/ INNER\s{1,}JOIN /ig,"~#~INNER JOIN ")
				.replace(/ LEFT\s{1,}JOIN /ig,"~#~LEFT JOIN ")
				.replace(/ RIGHT\s{1,}JOIN /ig,"~#~RIGHT JOIN ")
				.replace(/ LIKE /ig,"~#~LIKE ")
				.replace(/ ON /ig,"~#~ON ")
				.replace(/ OR /ig,"~#~\tOR ")
				.replace(/ ORDER\s{1,}BY/ig,"~#~ORDER BY ")
				
				.replace(/\s{0,}SELECT /ig,"~#~SELECT ")
				//.replace(/\s{0,}SELECT /ig,"SELECT~#~")
				
				.replace(/ UNION /ig,"~#~UNION~#~")
				.replace(/ USING /ig,"~#~USING ")
				.replace(/ WHEN /ig,"~#~WHEN ")
				.replace(/ WHERE /ig,"~#~WHERE ")
				.replace(/ WITH /ig,"~#~WITH ")
				
				//.replace(/\,\s{0,}\(/ig,",~#~( ")
				//.replace(/\,/ig,",~#~")
				//.replace(/ \)\s{0,}\,/ig,"),\n ")
				//.replace(/\)/ig,")~#~ ")
				//.replace(/\'/ig,"~#~\'")

				.replace(/ All /ig," ALL ")
				.replace(/ AS /ig," AS ")
				.replace(/ ASC /ig," ASC ")	
				.replace(/ DESC /ig," DESC ")	
				.replace(/ DISTINCT /ig,"\DISTINCT ")
				.replace(/ EXISTS /ig," EXISTS ")
				.replace(/ NOT /ig," NOT ")
				.replace(/ NULL /ig," NULL ")
							
				.replace(/~#~{1,}/g,"~#~")
				.split('~#~'),


		len = ar.length,
		deep = 0,
		inComment = true,
		str = '',
		ix = 0;
		
		for(ix=0;ix<len;ix++) {
		
			if( /SELECT/.exec(ar[ix]))  { 
				str += this.shift[deep++]+ar[ix];
			} else 
			if( /FROM/.exec(ar[ix]))  { 
				str += this.shift[--deep]+ar[ix];
			}
			else {
				str += this.shift[deep]+ar[ix];
			}
/*
			if( /\'/.exec(ar[ix]) && inComment )  { 
				str += ar[ix];
				inComment = inComment ? false : true;	
			} else
			if( /\'/.exec(ar[ix]) && inComment )  { 
				str += ar[ix];
				inComment = inComment ? false : true;	
			} else			{
				str += replace_sql(ar[ix]);
			}
*/			
		}

		str = str.replace(/^\n{1,}/,'')/*.replace(/\n[ \t]{0,}/g,"\n");*/.replace(/\n{1,}/g,"\n");
		return str;
}


vkbeautify.prototype.xmlmin = function(text, preserveComments) {

	var str = preserveComments ? text
							   : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"");
	return  str.replace(/>\s{0,}</g,"><"); 
}

vkbeautify.prototype.jsonmin = function(text) {
								  
	return  text.replace(/\s{0,}\{\s{0,}/g,"{")
				.replace(/\s{0,}\[$/g,"[")
				.replace(/\[\s{0,}/g,"[")
				.replace(/:\s{0,}\[/g,':[')
		  		.replace(/\s{0,}\}\s{0,}/g,"}")
				.replace(/\s{0,}\]\s{0,}/g,"]")
				.replace(/\"\s{0,}\,/g,'",')
				.replace(/\,\s{0,}\"/g,',"')
				.replace(/\"\s{0,}:/g,'":')
				.replace(/:\s{0,}\"/g,':"');						  
}

vkbeautify.prototype.cssmin = function(text, preserveComments) {
	
	var str = preserveComments ? text
							   : text.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g,"") ;

	return str.replace(/\s{1,}/g,' ')
			  .replace(/\{\s{1,}/g,"{")
			  .replace(/\}\s{1,}/g,"}")
			  .replace(/\;\s{1,}/g,";")
			  .replace(/\/\*\s{1,}/g,"/*")
			  .replace(/\*\/\s{1,}/g,"*/");
}

vkbeautify.prototype.sqlmin = function(text) {
	//return text.replace(/\s{1,}/g," ");
	return text.replace(/\s{1,}/g," ").replace(/\s{1,}\(/,"(").replace(/\s{1,}\)/,")");
}

window.vkbeautify = new vkbeautify();

})();

