function AppManager()
{
  this.appDict = {};
  this.curr_app_drag = null;
  this.screen = document.getElementById('screenDiv');
  this.dimmer = document.createElement("div");
  this.maxZIndex = 999;
  this.dockLinesX = [];
  this.dockLinesY = [];
  this.dockWidth = 20;
  this.dockBorder = 3;
  this.orderAppDir = "right";
  this.appWidth = 250;
  this.appCount = 0;

  this.dimmer.className = "dimmer";
  this.screen.appendChild(this.dimmer);

  this.dialogDict = {};
  this.currentDialog = null;

  this.events = {};
}

AppManager.prototype = new Object();

function App(name, params)
{
  function checkParam(name, defaultValue) {
    if (typeof params[name] != 'undefined')
      return params[name];
    else
      return defaultValue;
  }
  this.name = name;
  this.currentPosition = checkParam("position", {x: 0, y: 0});
  this.vAlign = checkParam("vAlign", "left");
  this.hAlign = checkParam("hAlign", "top");
  this.visible = true;
  this.minimized = false;
  this.div = document.getElementById('app_' + name + '_div');
  this.content = document.getElementById('app_' + name + '_content');
  this.autoPosition = checkParam("useAutoPosition", true);
  this.dragable = checkParam("dragable", true);
  this.buttons = {
    show: document.getElementById('app_' + name + '_show'),
    hide: document.getElementById('app_' + name + '_hide')
  };

  this.div.style[this.vAlign] = this.currentPosition.x + "px";
  this.div.style[this.hAlign] = this.currentPosition.y + "px";
}

function AppDialog(name)
{
  this.name = name;
  this.div = document.getElementById("app_dialog_" + name + "_div");


}

AppManager.prototype.drag_app = function(evt)
{
  if (!evt)
    evt = event;
  if (this.curr_app_drag == null)
    return;
  var curr_x = evt.clientX;
  var curr_y = evt.clientY;

  var shift_x = curr_x - this.curr_app_drag.click_x;
  var shift_y = curr_y - this.curr_app_drag.click_y;

  var new_x = (this.curr_app_drag.start_x + shift_x);
  var new_y = (this.curr_app_drag.start_y + shift_y);

  for (var i = 0; i < this.dockLinesX.length; i++)
  {
    if (Math.abs(new_x - this.dockLinesX[i]) < this.dockWidth)
    {
      new_x = this.dockLinesX[i];
    }
  }
  for (var i = 0; i < this.dockLinesY.length; i++)
  {
    if (Math.abs(new_y - this.dockLinesY[i]) < this.dockWidth)
    {
      new_y = this.dockLinesY[i];
    }
  }
  if (new_x < this.dockBorder)
    new_x = this.dockBorder;
  if (new_y < this.dockBorder)
    new_y = this.dockBorder;
  if (new_x > this.getScreenWidth() - this.curr_app_drag.app.clientWidth - this.dockBorder)
    new_x = this.getScreenWidth() - this.curr_app_drag.app.clientWidth - this.dockBorder;
  if (new_y > this.getScreenHeight() - this.curr_app_drag.app.clientHeight - this.dockBorder)
    new_y = this.getScreenHeight() - this.curr_app_drag.app.clientHeight - this.dockBorder;

  this.curr_app_drag.app.style.left = new_x + 'px';
  this.curr_app_drag.app.style.top = new_y + 'px';

  this.curr_app_drag.cur_x = new_x;
  this.curr_app_drag.cur_y = new_y;

  if (!Client.isVersion(BrowserTypes.IE, 7))
  {
    if (document.selection)
      document.selection.removeAllRanges();
    if (window.getSelection)
      window.getSelection().removeAllRanges();
  }
}

AppManager.prototype.getScreenWidth = function()
{
  if (Client.isVersion(BrowserTypes.IE, 7))
    return document.documentElement.clientWidth;
  else
    return this.screen.clientWidth;
};

AppManager.prototype.getScreenHeight = function()
{
  if (Client.isVersion(BrowserTypes.IE, 7))
    return document.documentElement.clientHeight;
  else
    return this.screen.clientHeight;
};

AppManager.prototype.start_drag = function(evt, appname)
{
  console.log(evt);
  if (!evt)
    evt = event;
  this.appToTop(appname);
  this.curr_app_drag = {};
  this.curr_app_drag.app = document.getElementById('app_' + appname + '_div');
  this.screen.onmousemove = this.drag_app.bind(this);
  this.screen.onmouseup = this.stop_drag.bind(this);
  this.curr_app_drag.click_x = evt.clientX;
  this.curr_app_drag.click_y = evt.clientY;
  this.curr_app_drag.start_x = this.curr_app_drag.app.offsetLeft;
  this.curr_app_drag.start_y = this.curr_app_drag.app.offsetTop;
  this.curr_app_drag.cur_x = this.curr_app_drag.start_x;
  this.curr_app_drag.cur_y = this.curr_app_drag.start_y;
  this.curr_app_drag.appname = appname;
  this.createDockLines(appname);

};

AppManager.prototype.stop_drag = function(event)
{
  if (this.curr_app_drag == null)
    return;
  //setCookie(curr_app_drag.appname+'_data', curr_app_drag.cur_x+"#"+curr_app_drag.cur_y);
  this.appDict[this.curr_app_drag.appname].currentPosition = {x: this.curr_app_drag.cur_x, y: this.curr_app_drag.cur_y};
  this.curr_app_drag = null;
  this.screen.onmousemove = function() {
  };
  this.screen.onmouseup = function() {
  };

};

AppManager.prototype.hide_app_content = function(appname)
{
  var app = this.appDict[appname];
  app.content.style.display = 'none';
  app.buttons.hide.style.display = 'none';
  app.buttons.show.style.display = 'block';
  app.minimized = true;
  jQuery(app.div).addClass("miniApp");
};

AppManager.prototype.show_app_content = function(appname)
{
  var app = this.appDict[appname];
  app.content.style.display = 'block';
  app.buttons.hide.style.display = 'block';
  app.buttons.show.style.display = 'none';
  app.minimized = false;
  jQuery(app.div).removeClass("miniApp");
};

AppManager.prototype.add_app = function(appname, params, quick)
{
  if (Client.isVersion(BrowserTypes.IE, 7)) // Langsames einblenden geht im IE7 nicht
    quick = true;
  if (typeof this.appDict[appname] == 'undefined')
  {
    if (typeof params == 'undefined')
      params = {};
    var app = new App(appname, params);
    this.appDict[appname] = app;
    this.appCount++;
  }
  else
    var app = this.appDict[appname];
  app.div.style.display = "block";
  if (quick)
    app.div.style.opacity = 1;
  else
    window.setTimeout(function() {
      this.app.div.style.opacity = 1;
    }.bind({app: app}), 100);
  app.visible = true;
  //document.getElementById(appname+'_show_app_checkbox').checked = true;
  try {
    eval('var add_func = add_' + appname + '_app');
    if (typeof add_func == "function")
      add_func();
  } catch (e) {
  }

  if (app.dragable)
  {
    var dragbar = document.getElementById('app_' + appname + '_dragbar');
    var handler = {manager: this, appname: appname};

    dragbar.onmousedown = function(evt) {
      this.manager.start_drag(evt, this.appname);
    }.bind(handler);
  }
};

AppManager.prototype.remove_app = function(appname, quick)
{
  if (Client.isVersion(BrowserTypes.IE, 7)) // Langsames ausblenden geht im IE7 nicht
    quick = true;
  var app = this.appDict[appname];
  //app.div.style.display = "none";
  if (quick)
    app.div.style.display = 'none';
  else
    window.setTimeout(function() {
      this.app.div.style.display = 'none'
    }.bind({app: app}), 1000);
  app.div.style.opacity = 0;
  app.visible = false;
  //document.getElementById(appname+'_show_app_checkbox').checked = false;
  try {
    eval('var close_func = close_' + appname + '_app');
    if (typeof close_func == "function")
      close_func();
  } catch (e) {
  }
}

AppManager.prototype.moveAppToCustomerPosition = function(appname)
{
  /*var value = getCookie(appname+'_data');
   if(value == null)
   return;
   var app = document.getElementById('app_'+appname+'_div');
   var x_y = value.split('#');
   app.style.left = x_y[0] + 'px';
   app.style.top = x_y[1] + 'px';*/
}

AppManager.prototype.set_app_opacity = function(appname, isOpacity)
{
  /* var app = document.getElementById('app_'+appname+'_div');
   if(isOpacity)
   app.style.opacity = 0.8;
   else
   app.style.opacity = 1;
   */
}

AppManager.prototype.organizeApps = function()
{
  if (this.orderAppDir == "left")
    var curr_x = this.dockBorder;
  else
    var curr_x = this.getScreenWidth() - this.dockBorder - 4;
  var curr_y = 30;
  var zIndex = 999;
  for (appname in this.appDict)
  {
    var app = this.appDict[appname];
    if (!app.autoPosition)
      continue;
    app.div.style.zIndex = zIndex;
    zIndex++;
    if (this.orderAppDir == "left")
    {
      app.div.style.left = curr_x + "px";
      app.div.style.top = curr_y + "px";
      app.currentPosition = {x: curr_x, y: curr_y};
      curr_x += this.appWidth + this.dockBorder;
    }
    else
    {
      app.div.style.left = (curr_x - this.appWidth) + "px";
      app.div.style.top = curr_y + "px";
      app.currentPosition = {x: (curr_x - this.appWidth), y: curr_y};
      curr_x -= this.appWidth + this.dockBorder;
    }
  }
  this.maxZIndex = zIndex;
}

AppManager.prototype.appToTop = function(appname)
{
  this.maxZIndex++;
  var app = this.appDict[appname].div.style.zIndex = this.maxZIndex;
}

AppManager.prototype.createDockLines = function(name)
{
  this.dockLinesX = [];
  this.dockLinesY = [];
  var currapp = this.appDict[name];
  for (appname in this.appDict)
  {
    if (appname != name)
    {
      var app = this.appDict[appname];
      if (!app.visible)
        continue;
      this.dockLinesX.push(app.currentPosition.x);
      this.dockLinesX.push(app.currentPosition.x + app.div.clientWidth + this.dockBorder);
      this.dockLinesX.push(app.currentPosition.x - currapp.div.clientWidth - this.dockBorder);
      this.dockLinesY.push(app.currentPosition.y);
      this.dockLinesY.push(app.currentPosition.y + app.div.clientHeight + this.dockBorder);
      this.dockLinesY.push(app.currentPosition.y - currapp.div.clientHeight - this.dockBorder);
    }
  }
}

/* ######################## AppDialog ############## */

AppManager.prototype.addAppDialog = function(dialogName)
{
  var dialog = new AppDialog(dialogName);
  this.dialogDict[dialogName] = dialog;
}

AppManager.prototype.showAppDialog = function(dialogName, quick)
{
  this.dialogDict[dialogName].div.style.display = "block";
  this.showDimmer();
  this.dialogDict[dialogName].div.style.marginTop = (-this.dialogDict[dialogName].div.clientHeight / 2) + "px";
  this.dialogDict[dialogName].div.style.marginLeft = (-this.dialogDict[dialogName].div.clientWidth / 2) + "px";
}

AppManager.prototype.hideAppDialog = function(dialogName)
{
  this.dialogDict[dialogName].div.style.display = "none";
  this.hideDimmer();
}

AppManager.prototype.showDimmer = function()
{
  this.dimmer.style.display = "block";
}

AppManager.prototype.hideDimmer = function()
{
  this.dimmer.style.display = "none";
}

AppManager.prototype.regEventHandler = function(eventName, handler)
{
  if (typeof this.events[eventName] == "undefined")
  {
    this.events[eventName] = [];
  }
  this.events[eventName].push(handler);
};

AppManager.prototype.doEvent = function(eventName, data)
{
  if (typeof this.events[eventName] != "undefined")
  {
    for (var i = 0; i < this.events[eventName].length; i++)
    {
      this.events[eventName][i](data);
    }
  }
};


function AppSubContent(holder_id, content_id, visible)
{
  this.visible = visible;
  this.holder = document.getElementById(holder_id);
  this.contentDiv = document.getElementById(content_id);

  this.getFirstElementByClassNameFromHolder = function(className) // Fuer IE8
  {
    for (var i = 0; i < this.holder.childNodes.length; i++)
      if (this.holder.childNodes[i].className == className)
        return this.holder.childNodes[i];
    return null;
  }

  if (typeof this.holder.getElementsByClassName == 'undefined') // IE8 :|
  {
    this.hideButton = this.getFirstElementByClassNameFromHolder("hideButton");
    this.showButton = this.getFirstElementByClassNameFromHolder("showButton");
  }
  else
  {
    this.hideButton = this.holder.getElementsByClassName("hideButton")[0];
    this.showButton = this.holder.getElementsByClassName("showButton")[0];
  }

  this.toggleContent = function()
  {
    if (this.visible)
      this.hide();
    else
      this.show();
  }

  this.show = function()
  {
    this.contentDiv.style.display = "";
    this.visible = true;
    this.hideButton.style.display = "";
    this.showButton.style.display = "none";
  }

  this.hide = function()
  {
    this.contentDiv.style.display = "none";
    this.visible = false;
    this.hideButton.style.display = "none";
    this.showButton.style.display = "";
  }



  this.holder.onclick = this.toggleContent.bind(this);
  if (visible)
    this.show();
  else
    this.hide();
}


var BrowserTypes = {"IE": 1, "FF": 2, "Opera": 3, "Chrome": 4, "Safari": 5, "Other": 6};
function _Client()
{
  if (navigator.appVersion.indexOf("MSIE 7.") != -1)
  {
    this.browserTypeName = "IE";
    this.version = 7;
  }
  else if (navigator.appVersion.indexOf("MSIE 8.") != -1)
  {
    this.browserTypeName = "IE";
    this.version = 8;
  }
  else if (navigator.appVersion.indexOf("MSIE 9.") != -1)
  {
    this.browserTypeName = "IE";
    this.version = 9;
  }
  else if (navigator.appVersion.indexOf("MSIE 10.") != -1)
  {
    this.browserTypeName = "IE";
    this.version = 10;
  }
  else
  {
    this.browserTypeName = "Other";
    this.version = 0;
  }
  this.browserType = BrowserTypes[this.browserTypeName];

  this.isType = function(type)
  {
    return this.browserType == type;
  }

  this.isVersion = function(type, version)
  {
    return this.browserType == type && this.version == version;
  }
}

var Client = new _Client();