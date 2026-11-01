//	Scripts used by the SVG graphics
//
//	HISTORY
//	23-Nov-2005	Ron Prior       	Created
//	Aug 2006 	Ron Prior		Added 'tooltip' code with acknowledgements to
//						Doug Schepers at www.svg-whiz.com
//
var r;
var speed;
var acceleration;
var loop=null;
var myparent = window.parent||window.__parent__		// work-around for 'parent' being broken in ASV6
myparent.zoomIn = ZoomIn;
myparent.zoomOut = ZoomOut;
myparent.zoomPanReset = ZoomPanReset;
myparent.zoomExtent = ZoomExtent;
myparent.ShowTooltip = ShowTooltip;
myparent.HideTooltip = HideTooltip;
myparent.setAll = setAll;

      var SVGDocument = null;
      var SVGRoot = null;
      var SVGViewBox = null;
      var svgns = 'http://www.w3.org/2000/svg';
      var xlinkns = 'http://www.w3.org/1999/xlink';
      var toolTip = null;
      var TrueCoords = null;
      var tipBox = null;
      var tipText = null;
      var tipTitle = null;
      var tipDesc = null;

      var lastElement = null;
      var titleText = '';
      var titleDesc = '';
      var tipping = false;
      var genopro = null;
	
	var mapX;
	var mapY;
	var mapHighlight;
	var mapZoomExtent;
	var coords;
	var initX;
	var initY;



function init(evt)
{
	r = document.rootElement;
	if (r == null) {
		alert("Your SVG Viewer does not support scripting. Please consider upgrading it.");
		return;
	}

 	r.addEventListener( "SVGScroll", setAll, false );
	r.addEventListener( "SVGResize", setAll, false );
	r.addEventListener( "SVGZoom",   setAll, false );

	mapX = parseFloat(myparent.MapX);
	mapY = parseFloat(myparent.MapY);
	mapHighlight = myparent.MapHighlight;
	mapZoomExtent = myparent.MapZoomExtent;
	coords = myparent.MapBounds;
	initX = r.currentTranslate.x;
	initY = r.currentTranslate.y;

	centermap(mapX,mapY,mapHighlight);
	if (mapZoomExtent) ZoomExtent();

	setAll();    				// position panning arrows

	acceleration = 1;							// for panning 
	if(navigator.appName!='Adobe SVG Viewer') {acceleration = 1.5;} 	// speed up panning with Firefox 1.5 SVG

         TrueCoords = r.createSVGPoint();

         toolTip = document.getElementById('ToolTip');
         tipBox = document.getElementById('tipbox');
         tipText = document.getElementById('tipText');
	 tipTemp = document.getElementById('tipTemp');
	 genopro = document.getElementById('GenoPro');

}
function centermap(x,y,hlight)
{
	var w=getInnerWidth();
	var h=getInnerHeight();
	r.currentTranslate.x += (-x + w / 2);
	r.currentTranslate.y += (-y + h / 2);
	var hl=document.getElementById("highlight");
if (hlight) {
	hl.setAttribute("visibility","visible");
	hl.setAttribute("cx", x);
	hl.setAttribute("cy", y);
	} else {
	hl.setAttribute("visibility","hidden");
	}
}
function displaylink(href,target)
{
	try {
		window.open(href,target);
	} catch(e) {
		browserEval('window.open("'+href+'",target="'+target+'")');
	}
}
function panmap(evt,x,y)
{
if(loop==null) {
		pan(x,y,5);
	}
}
function pan(x,y,speed)
{
//	stoppan();
	var w=getInnerWidth();
	var h=getInnerHeight();

	if (x!=0) r.currentTranslate.x += x*speed;
	if (y!=0) r.currentTranslate.y += y*speed;
	loop=setTimeout('pan('+x+','+y+','+speed*(speed<50?acceleration:1)+')',1);
}
function stoppan()
{
	if (loop!=null) {
		clearTimeout(loop);
		loop=null;
	}
}
function ZoomIn()
{
	var x=-r.currentTranslate.x + w/2
	var y=-r.currentTranslate.y + h/2
	r.currentScale = r.currentScale * 2;
	r.currentTranslate.x -= x;
	r.currentTranslate.y -= y;
}
function ZoomOut()
{
	var x=-r.currentTranslate.x + w/2
	var y=-r.currentTranslate.y + h/2
	r.currentScale = r.currentScale / 2;
	r.currentTranslate.x += x/2;
	r.currentTranslate.y += y/2;
}

function ZoomPanReset()
{
	r.currentScale = 1;
	r.currentTranslate.x = initX;
	r.currentTranslate.y = initY;
	centermap(mapX,mapY,mapHighlight);
	setAll();
}
function ZoomExtent()
{
	var s;
	w=getInnerWidth();
	h=getInnerHeight();
	wImg=coords[2]-coords[0];
	hImg=coords[3]-coords[1];
	if(w/wImg < h/hImg) {
		s = w / wImg;
	} else {
		s = h / hImg;
	}
	x=coords[0]+wImg/2;
	y=coords[1]+hImg/2;
	r.currentTranslate.x = -x*s + w/2;
	r.currentTranslate.y = -y*s + h/2;
	r.currentScale = s
}
	
function setStatic(id, xoffset, yoffset)
{
// undo effects of any pan, zoom or resize on element specified in 'id'
	var e=document.getElementById(id);
	var s = 1/r.currentScale;
	e.setAttribute( "transform", "scale(" + s + "," + s + ")" );
	e.setAttribute( "x", -r.currentTranslate.x + xoffset );
	e.setAttribute( "y", -r.currentTranslate.y + yoffset );
}
function setAll()
{
//
// negate effects of pan, zoom or resize on panning arrows
//
	w=getInnerWidth();
	h=getInnerHeight();
	setStatic("N", w/2-8, 9);
	setStatic("W", 9, h/2-8);
	setStatic("E", w-9, h/2-8);
	setStatic("S", w/2-8, h-9);
	setStatic("NE", w-9, 9);
	setStatic("SE", w-9, h-9);
	setStatic("SW", 9, h-9);
	setStatic("NW", 9, 9);
	setStatic("GenoPro", w/4 * 3, h - 9);
	if (r.currentTranslate.x==0 && r.currentTranslate.y==0 && r.currentScale == 1) {
		centermap(myparent.top.MapX, myparent.top.MapY, myparent.top.MapHighlight);
	}
}	
function getInnerHeight() {
	if (window.innerHeight) { return window.innerHeight; } // netscape behavior
	else if (document.body.offsetHeight) { return  document.body.offsetHeight; } // IE behavior
	else { return null; }
}

function getInnerWidth() {
	if (window.innerWidth) { return window.innerWidth; } // netscape behavior
	else if (document.body.offsetWidth) { return  document.body.offsetWidth; } // IE behavior
	else { return null; }
}


      function GetTrueCoords(evt)
      {
         // find the current zoom level and pan setting, and adjust the reported
         //    mouse position accordingly
         var newScale = r.currentScale;
         var translation = r.currentTranslate;
         TrueCoords.x = (evt.clientX - translation.x)/newScale;
         TrueCoords.y = (evt.clientY - translation.y)/newScale;
      };


      function HideTooltip( evt )
      {
         toolTip.setAttributeNS(null, 'visibility', 'hidden');
	children = tipText.childNodes;

	for (var i=0; i<children.length; i++) {
		tipText.removeChild(children.item(i));
	}
	return ! tipText.hasChildNodes;
      };


      function ShowTooltip( evt )
      {
// there is a problem with Firefox in that occaionally not all tspan elements are removed
// this hack seems to fix it!
	 var isEmpty = HideTooltip(evt);
if ( ! isEmpty ) {
	isEmpty = HideTooltip(evt);
}
if ( ! isEmpty ) {
	isEmpty = HideTooltip(evt);
}
if ( ! isEmpty ) {
	isEmpty = HideTooltip(evt);
}
         GetTrueCoords( evt );
         var tipScale = 1/r.currentScale;

         tipBox.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')' );
         tipText.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')' );


         var titleValue = '';
         var descValue = '';

	 var box = new Object();
	    box.maxWidth = getInnerWidth();
	    box.textWidth = 0;
	    box.lineHeight = 10;

         var targetElement = evt.target;
         if ( lastElement != targetElement )
         {
            var targetTitle = targetElement.getElementsByTagName('title').item(0);
            if ( ! targetTitle ) targetTitle = targetElement.parentNode.getElementsByTagName('title').item(0);

            if ( targetTitle )
            {
               // if there is a 'title' element, use its contents for the tooltip title
               if (targetTitle.hasChildNodes()) titleValue = targetTitle.firstChild.nodeValue;
            }

            var targetDesc = targetElement.getElementsByTagName('desc').item(0);
            if ( ! targetDesc) targetDesc = targetElement.parentNode.getElementsByTagName('desc').item(0);
            if ( targetDesc )
            {
               // if there is a 'desc' element, use its contents for the tooltip desc
               if (targetDesc.hasChildNodes()) descValue = targetDesc.firstChild.nodeValue;

               if ( '' == titleValue )
               {
                  // if there is no 'title' element, use the contents of the 'desc' element for the tooltip title instead
 //                 titleValue = descValue;
 //                 descValue = '';
               }
            }

            // if there is still no 'title' element, use the contents of the 'id' attribute for the tooltip title
            if ( '' == titleValue )
            {
//               titleValue = targetElement.getAttributeNS(null, 'id');
            }

            // selectively assign the tooltip title and desc the proper values,
            //   and hide those which don't have text values
            //

            if ( '' != titleValue ) AddTipText(tipText, titleValue, 'black', box);

            if ( '' != descValue ) AddTipText(tipText, descValue, 'blue', box);
         }

         // if there are tooltip contents to be displayed, adjust the size and position of the box
         if ( tipText.hasChildNodes )
         {
            var xPos = TrueCoords.x + (10 * tipScale);
            var yPos = TrueCoords.y + (10 * tipScale);


            //return rectangle around text as SVGRect object
	    // but getBBox() seems to be broken with Adobe so...
	    box.Height = tipText.childNodes.length * box.lineHeight

	if (box.Height > 0 && box.textWidth > 0 ) {   
	    if ((evt.clientX + box.textWidth + 10 ) > getInnerWidth())  xPos = ((getInnerWidth()  - box.textWidth -10)  - r.currentTranslate.x) * tipScale;
	    if ((evt.clientY + box.Height + 20 ) > getInnerHeight()) yPos = ((getInnerHeight() - box.Height - 10) - r.currentTranslate.y) * tipScale;

            tipBox.setAttributeNS(null, 'width', Number(box.textWidth + 10));
            tipBox.setAttributeNS(null, 'height', Number(box.Height + 5));

            // update position
            toolTip.setAttributeNS(null, 'transform', 'translate(' + xPos + ',' + yPos + ')');
            toolTip.setAttributeNS(null, 'visibility', 'visible');
	}
         }
      };

function AddTipText(textNode, tip, col, tipbox)
{
	var tipLines = tip.split('\n'), tspanNode, newNode, childNode, len;
	for (var i=0; i<tipLines.length; i++) {
		newNode = document.createElementNS(svgns, 'tspan');
		tspanNode = textNode.appendChild(newNode);
		tspanNode.setAttributeNS(null, 'style', 'fill:'+col+';stroke:none;');
		tspanNode.setAttributeNS(null, 'x', '5');
		tspanNode.setAttributeNS(null, 'dy', Number(tipbox.lineHeight));
		childNode = document.createTextNode(tipLines[i] != ''?tipLines[i]:' ');
// Adobe's getComputedTextLength() returns total length of all tspan elements , so determine max length from each tspan
		newNode = tipTemp.appendChild(childNode);
		len = tipTemp.getComputedTextLength();
		childNode = tipTemp.removeChild(newNode);
		if (len > tipbox.textWidth ) tipbox.textWidth = len;
		newNode = tspanNode.appendChild(childNode);
	}
}
	