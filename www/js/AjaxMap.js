function AjaxMap()
{
    this.content = new Object;
    this.contcount = 0;
    this.infoboxes = new Array();
    /*this.registerEvents = function(){
        for(var k=0; k < this.events.length; k++) {
            var self = this;
            (function(current){
                Hafas.ps.sub(this.events[current].type,function(m){
                    self.events[current].callback(m,self);
                });
            }(k));
        }
    };*/
    this.addElem = function( elemkind, elemname, elemstyle, parentelem, elemclass )
    {
        if ( document.getElementById( elemname ) ) alert( 'Element with id="' + elemname + '" already existing');
        else {
            var elem;
            if(elemkind=="inputbutton"){
                elem = document.createElement("input");
                elem.type="button";
            }else
            elem = document.createElement(elemkind);
            elem.id = elemname;
            if(typeof elemclass!='undefined')
            elem.className=elemclass;
            Object.extend(elem.style,elemstyle);
            if(elemkind=="canvas"){
                elem.width=parseInt(elemstyle.width);
                elem.height=parseInt(elemstyle.height);
                elem.appendChild(document.createTextNode("CANVAS NOT AVAILABLE"));
                parentelem.appendChild(elem);
                if( typeof G_vmlCanvasManager != 'undefined' ) G_vmlCanvasManager.initElement(elem);
            }else
            parentelem.appendChild(elem);
            return document.getElementById( elemname );
        }
    }

    this.decode = function( at )
    {
        var t = at.replace(/&ouml;/g, '�');
        t = t.replace(/&auml;/g, '�');
        t = t.replace(/&uuml;/g, '�');
        t = t.replace(/&Auml;/g, '�');
        t = t.replace(/&Uuml;/g, '�');
        t = t.replace(/&Ouml;/g, '�');
        t = t.replace(/&#252;/g, '�');
        t = t.replace(/&#246;/g, '�');
        t = t.replace(/&#228;/g, '�');
        t = t.replace(/&#226;/g, '�');
        t = t.replace(/&#223;/g, '�');
        t = t.replace(/&#196;/g, '�');
        t = t.replace(/&#214;/g, '�');
        t = t.replace(/&#220;/g, '�');
        t = t.replace(/&#248;/g, '�');
        t = t.replace(/&#216;/g, '�');
        t = t.replace(/&#229;/g, '�');
        t = t.replace(/&#197;/g, '�');
        t = t.replace(/&#230;/g, '�');
        t = t.replace(/&#198;/g, '�');
        t = t.replace(/&#233;/g, '�');
        t = t.replace(/&#232;/g, '�');
        t = t.replace(/&#156;/g, '�');
        t = t.replace(/&#140;/g, '�');
        t = t.replace(/&#/g, '');
        return t;
    }

    this.checkParameter = function(par,defaultvalue)
    {
        if(typeof defaultvalue!='undefined'){
            if(typeof par=='undefined'){
                return defaultvalue;
            }
        }else{
            if(typeof par=='undefined'){
                alert("Missing Parameter");
                return null;
            }
        }
        return par;
    }

    this.getColorSetFunction = function(content)
    {
        if(content=="chgno"){
            return function(p){
                switch(parseInt(p.chgno)){
                case 0:return "00ff00";
                case 1:return "ffff00";
                case 2:return "ff0000";
                default:return "000000";
                }
            };
        }else if(content=="trainclass"){
            return function(p){
                switch(parseInt(p.trainclass)){
                case 1:return "ff0000";
                case 2:return "0000ff";
                case 4:return "000000";
                case 8:return "949494";  // RE
                case 16:return "50693f"; // S
                case 32:return "ffff00"; // Bus
                case 64:return "009cce"; // Schiff
                case 128:return "00528c";// U
                case 256:return "dc2b19";// STB
                case 512:return "dcdc96";// AST
                default:return "ffffff";
                }
            }
        }else{
            return function(p){return "555555";};
        }
    }

    this.getRGBA= function(c,o)
    {
      if(typeof o=='undefined')o=1;
      if(typeof c=='undefined')c="red";
      if(c.length == 6)
        {
        var rV = parseInt(c.substring(0,2),16);
        var gV = parseInt(c.substring(2,4),16);
        var bV = parseInt(c.substring(4),16);
        if(!(isNaN(rV*gV*bV)))
           return 'rgba('+rV+','+gV+','+bV+','+o+')';
        }
      switch(c){
      case 'red':return 'rgba(255,0,0,'+o+')';
      case 'green':return 'rgba(0,255,0,'+o+')';
      case 'blue':return 'rgba(0,0,255,'+o+')';
      case 'yellow':return 'rgba(255,255,0,'+o+')';
      case 'cyan':return 'rgba(0,255,255,'+o+')';
      case 'purple':return 'rgba(255,0,255,'+o+')';
      case 'white':return 'rgba(255,255,255,'+o+')';
      case 'black':return 'rgba(0,0,0,'+o+')';
      case 'grey':return 'rgba(128,128,128,'+o+')';
      default:return 'rgba(255,0,0,'+o+')';
      }
    }

    this.getColorFFFFFF= function(c){
      if(typeof c=='undefined')c="red";
      switch(c){
      case 'red':return 'FF0000';
      case 'green':return '00FF00';
      case 'blue':return '0000FF';
      case 'yellow':return 'FFFF00';
      case 'cyan':return '00FFFF';
      case 'purple':return 'FF00FF';
      case 'white':return 'FFFFFF';
      case 'black':return '000000';
      case 'grey':return '888888';
      default:return 'FF0000';
      }
    }

    this.clone_contentparams = function( par )
    {
        var ret=Object.clone(par);
        if( typeof par.coord != 'undefined' )
        ret.coord=par.coord.clone();
        if( typeof par.hotspot != 'undefined' )
        ret.hotspot={x:par.hotspot.x,y:par.hotspot.y};
        if( typeof par.coords != 'undefined' ){
            ret.coords = new Array;
            for( var i = 0; i < par.coords.length; i++ )
            ret.coords[i]=par.coords[i].clone();
        }
        return ret;
    }

    this.convertCircleToPolyline = function(circleContent, numLines)
    {
        par = circleContent;
        var lat = par.coord.getLat();
        var lon = par.coord.getLon();
        var radfact = Math.PI/180;
        var latoff = par.radius / 60 / 1852 * 1e6;
        var lonoff = par.radius / 60 / 1852 * 1e6 / Math.cos(lat/1e6*radfact);
        var n = numLines;
        var crds = [];
        for( var i=0; i<n; i++ ) {
            var rad = 360 * i / n * radfact;
            var latfact = Math.cos(rad);
            var lonfact = Math.sin(rad);
            crds[i] = new CCoord({ lat: lat+latfact*latoff, lon: lon+lonfact*lonoff });
        }
        crds.push(crds[0]);
        return { type: 'polyline', coords: crds, color: par.color, width: par.width, opacity: par.opacity };
    }

    this.drawCanvasPoint = function(par)
    {
        if( typeof  this.canvasDiv != 'undefined' ) {
            this.iconDiv = document.createElement("div");
            this.iconDiv.style.height = '16px';
            this.iconDiv.style.width = '16px';
            this.iconDiv.style.backgroundColor = 'red';
            this.iconDiv.style.position = 'absolute';
            var pos = this.geo2scr(par.coord);
            this.iconDiv.style.left = pos.x + 'px';
            this.iconDiv.style.top = pos.y + 'px';
            this.map.getDiv().appendChild(this.iconDiv);
            return this.iconDiv;
        }
    }

    this.getJMapURLParams = function(){
        var par=
        "&MapCenterX="+this.getCenter().getLon()+
        "&MapCenterY="+this.getCenter().getLat()+
        "&MapScaling="+this.getZoom();
        return par;
    }

     this.createContent=function(params) // OK
    {
        if(typeof params.type=='undefined')return null;
        this.contcount++;
        var cc=this.contcount.toString();
        //var p=this.clone_contentparams(params)
        //var p=Hafas.Clone(params);
        var p = params;
        p.cc=cc;
        p.show = false;
        this.content[cc] = p;
        switch(p.type){
        case 'location':this.createLocation(p);break;
        case 'route': this.createRoute(p);break;
        case 'point':this.createPoint(p);break;
        case 'polyline':this.createPolyline(p);break;
        case 'polygon':this.createPolygon(p);break;
        case 'circle':this.createCircle(p);break;
        case 'container':this.createContainer(p);break;
        default:return null;
        }
        Hafas.ps.pub("/map/createcontent", this);
        return cc;
    }

    this.updateContent=function(content, paramsNext){ // OK
        if(typeof content=='undefined')return;
        if(content==null)return;
        var p=this.content[content];
        if(typeof p=='undefined')return;
        var contentNext = this.createContent(paramsNext);
        if(contentNext==null)return;
        var pNext = this.content[contentNext];
        if(typeof pNext=='undefined')return;
        switch(p.type){
        case 'location':this.updateImage(p,paramsNext);break;
        case 'polyline': this.updatePolyline(p,pNext);break;
        case 'container': this.updateContainer(p,pNext);break;
        }
        this.removeContent(contentNext);
        Hafas.ps.pub("/map/updatecontent", this);
    }

    this.showContent=function(content){ // OK
        if(typeof content=='undefined')return;
        if(content==null)return;
        var p=this.content[content];
        if(typeof p=='undefined')return;
        switch(p.type){
           case 'location':this.showLocation(p);break;
           case 'route':
           case 'point':this.showPoint(p);break;
           case 'polyline':this.showPolyline(p);break;
           case 'polygon':this.showPolygon(p);break;
           case 'circle':this.showCircle(p);break;
           case 'container':this.showContainer(p);break;
        }
        p.show = true;
        Hafas.ps.pub("/map/showcontent", this);
    }

}

function CCoord(param)
{
    this.param = param;
    this.lat = param.lat;
    this.lon = param.lon;
    this.getLat = function()
    { return this.param.lat; }

    this.getLon = function()
    { return this.param.lon; }
}

