
var SLs = {};

function SimpleLocSuggest(input, options)
{
    this.input = input;
    this.options = options;
    if (typeof this.options.useJSONP == "undefined")
        this.options.useJSONP = false;
    this.maxSuggest = 8;
    this.startSuggest = 0;

    this._create = function() {

        this.markedIndex = null;
        this.maxIndex = null;
        this.searchTimeout = null;
        this.currData = [];

        this.preventEnter = false;
        this.hideTimeout = null;
        this.isVisible = false;
        this.reqIndex = 0;

        this.jQ_input = jQuery(this.input);
        this.achor = jQuery("<span class='suggestAchor'></span>").insertBefore(this.input);
        this.div = jQuery("<div class='suggest'></div>").appendTo(this.achor);

        this.input.onfocus = this._onfocus.bind(this);
        this.input.onclick = this._onfocus.bind(this);
        this.input.onblur = this._onblur.bind(this);
        this.input.setAttribute("autocomplete", "off");
        this.jQ_input.keyup(this._onkeyup.bind(this));
        this.jQ_input.keydown(this._onkeydown.bind(this));

        this._init();
    };

    this._init = function()
    {
        SimpleLocSuggest.Instances[input.id] = this;
        this.locType = 255;
        if (this.jQ_input.attr('data-locationType') != undefined) {
            this.locType = this.jQ_input.attr('data-locationType');
        }

        this.favButton = null;
        if (this.jQ_input.attr('data-fav-button') != undefined) {
            this.favButton = jQuery("#" + this.jQ_input.attr('data-fav-button'));
            this.favButton.click(this._onClickFavButton.bind(this));
        }

        this.idInput = jQuery("#" + this.input.id + "ID");
        this._updateFavButtonState();
    };

    this._onkeyup = function(event) {
        if (event.keyCode == 13) // enter
        {
            if (this.preventEnter)
            {
                event.preventDefault();
                this.preventEnter = false;
                return false;
            }
            else {
                this._onblur();
            }
            return;
        }
        // esc/tab
        else if ((event.keyCode == 27) || (event.keyCode == 9)) {
            this._onblur();
            return;
        }

        if (jQuery.inArray(event.keyCode, [37, 38, 39, 40]) != -1) // Pfeiltasten
            return;

        var inputValue = this.input.value.trim();
        this._getDataOnKeyUp(inputValue);
        this._updateFavButtonState();
    };

    this._onkeydown = function(event) {
        if (event.keyCode == 40) // down
            this._markNextItem("down");
        else if (event.keyCode == 38) // up
            this._markNextItem("up");
        else if (event.keyCode == 13)
        {
            if (this.markedIndex != null)
            {
                this._selectMarked();
                event.preventDefault();
                this.preventEnter = true;
                return false;
            }
            return;
        }
    };

    this._onfocus = function() {
        var inputValue = this.input.value.trim();
        //this._show();
        this._getDataOnFocus(inputValue);

        /*if((typeof Hafas != "undefined") && (Hafas.tools != undefined))
            if(Hafas.tools.isInMobileMode())
                Hafas.tools.scrollTo(this.input.id, -10);*/
    };

    this._onblur = function() {
        this.hideTimeout = setTimeout(this._hide.bind(this), 500);
        this.div.css("opacity", "0");
    };

    this._onSelect = function(name, id, type, x, y, evaId) {
        this.input.value = name;
        this.idInput.val(id);
        this._unmark();
        this._hide();
        this.div.html("");
        this._updateFavButtonState();
        if (this.options.onSelect)
            this.options.onSelect({name: name, tId: id, type: type,
                x: Hafas.tools.getDataFromTripelId(id, "X"),
                y: Hafas.tools.getDataFromTripelId(id, "Y"), id: evaId});

        /*if((typeof Hafas != "undefined") && (Hafas.tools != undefined))
            if(Hafas.tools.isInMobileMode())
                Hafas.tools.scrollTo(this.input.id, -10);*/
    };

    this._onClickFavButton = function()
    {
        if (hfsGui.favorites.isStationFav(this.idInput.val()))
            hfsGui.favorites.removeFavStation(this.idInput.val());
        else
            hfsGui.favorites.saveFavStation(this.idInput.val());
        this._updateFavButtonState();
    };

    this._updateFavButtonState = function()
    {
        if (this.favButton == null)
            return;
        var idValue = this.idInput.val().trim();
        if (idValue == "") // Keine Station ausgewaehlt
        {
            this.favButton.css("opacity", 0.6);
            this.favButton.removeClass("isFav");
            this.favButton.addClass("fav");
        }
        else // Station ausgewaehlt
        {
            this.favButton.css("opacity", 1);
            if (hfsGui.favorites.isStationFav(idValue)) // Station ist fav
            {
                this.favButton.addClass("isFav");
                this.favButton.removeClass("fav");
            }
            else // Station ist kein Fav
            {
                this.favButton.removeClass("isFav");
                this.favButton.addClass("fav");
            }
        }
    };

    this._markNextItem = function(dir)
    {
        var index = this.markedIndex;
        this._unmark();

        if (index == this.maxSuggest - 1 && dir == "down")
        {
            if (this.maxSuggest <= this.currData.length - 1)
            {
                this._scrollDown();
                index = this.startSuggest;
            }
            this._mark(index);
            return;
        }
        if (index == this.startSuggest && dir == "up")
        {
            this._scrollUp();
            index = this.maxSuggest - 1;
            this._mark(index);
            return;
        }

        if (index === null)
        {
            if (dir == "up")
                index = this.maxSuggest;
            else
                index = 0;
        }
        else
        {
            if (dir == "up")
                index--;
            else
                index++;
        }
        this._mark(index);
    };

    this._mark = function(index)
    {
        this.markedIndex = index;
        jQuery("#suggestItem_" + this.input.id + "_" + this.markedIndex).addClass("marked");
    };

    this._unmark = function()
    {
        if (this.markedIndex != null)
            jQuery("#suggestItem_" + this.input.id + "_" + this.markedIndex).removeClass("marked");
        this.markedIndex = null;
    };

    this._show = function() {
        this.isVisible = true;
        this.div.css("display", "block");
        this.div.css("width", (this.input.clientWidth + 4) + "px");
        this.div.css("opacity", "1");

    };

    this._hide = function() {
        this.hideTimeout = null;
        this.isVisible = false;
        this.div.css("display", "none");
    };

    this._getDataOnKeyUp = function(inputValue)
    {
        this.idInput.val("");
        if (inputValue.length >= 1) // Suggest
        {
            if (this.searchTimeout != null)
                clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(function() {
                this._load(inputValue);
            }.bind(this), 500);
        }
        else // Favoriten
        {
            //this._fill(hfsGui.favorites.getFavStations(inputValue, this.locType), true);
        }
    };

    this._getDataOnFocus = function(inputValue)
    {
        if (this.currData.length > 0)
        {
            this._fill(this.currData, false);
        }
        else if (inputValue.length < 1) // Suggest
        {
            //this._fill(hfsGui.favorites.getFavStations(inputValue, this.locType), true);
        }
    };

    this._fill = function(list, isFav)
    {
        this.div.html("");
        this.currData = list;
        this.maxIndex = list.length - 1;
        this.markedIndex = null;
        if (this.startSuggest > 0)
        {
            var item = jQuery("<div class='item prevButton'></div>");
            item.html(Hafas.Texts.Suggest.prev);
            item.click(this._scrollUp.bind(this));
            item.mouseenter(function() {
                this.sls._unmark();
            }.bind({sls: this}));
            this.div.append(item);
        }
        for (var i = this.startSuggest; i < list.length && i < this.maxSuggest; i++)
        {
            var item = jQuery("<div class='item'></div>");
            if (isFav)
                item.addClass("fav");
            if (i % 2 == 0)
                item.addClass("item_even");
            item.html(decodeURI(list[i].value));
            item.attr("id", "suggestItem_" + this.input.id + "_" + i);
            item.addClass("type_" + list[i].type);

            // zuordnung type und icon
            var iconType = 'icon_train';
            if (list[i].type == "1") {
                //var asd = this._getMostSignificantBitValue(list[i].prodClass);
            }
            else if (list[i].type == "2") {
                iconType = 'icon_marker';
            }
            else if (list[i].type == "4") {
                iconType = 'icon_poi';
            }

            item.append(jQuery("<span class='icon " + iconType + "'></span>"));
            item.mousedown(function() {
                this.sls._onSelect(decodeURI(this.loc.value), this.loc.id, this.loc.type, this.loc.x, this.loc.y, this.loc.extId);
            }.bind({sls: this, loc: list[i]}));
            item.mouseenter(function() {
                this.sls._unmark();
                this.sls._mark(this.index);
            }.bind({sls: this, index: i}));
            this.div.append(item);
        }
        if (list.length > this.maxSuggest)
        {
            var item = jQuery("<div class='item nextButton'></div>");
            item.html(Hafas.Texts.Suggest.next);
            item.click(this._scrollDown.bind(this));
            item.mouseenter(function() {
                this.sls._unmark();
            }.bind({sls: this}));
            this.div.append(item);
        }
        this._show();
    };
    
    this._selectMarked = function()
    {
        if((this.markedIndex == null) || (this.currData[this.markedIndex] == undefined))
            return;
        var loc = this.currData[this.markedIndex]; 
        this._onSelect(decodeURI(loc.value), loc.id, loc.type, loc.x, loc.y, loc.extId);
    };

    this._scrollDown = function()
    {
        this.maxSuggest += 7;
        this.startSuggest += 7;
        this._fill(this.currData, false);
        if (this.hideTimeout != null)
        {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        this._show();
    };

    this._scrollUp = function()
    {
        if (this.startSuggest == 0)
            return;
        this.maxSuggest -= 7;
        this.startSuggest -= 7;
        this._fill(this.currData, false);
        if (this.hideTimeout != null)
        {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        this._show();
    };

    this._load = function(inputValue)
    {
        var data = {
            encoding: 'utf-8',
            start: 1,
            getstop: 1,
            suggestMethod: 'none',
            S: inputValue + '?',
            REQ0JourneyStopsS0A: this.locType,
            REQ0JourneyStopsB: 50
        };

        if(this.options.noMetaStations)
            data.excludeMetaStations = "yes";

        this.maxSuggest = 8;
        this.startSuggest = 0;

        if (this.options.useJSONP)
        {
            var script = document.createElement("script");
            script.src = Hafas.Config.gUrlAjaxGetStop + jQuery.param(data);
            script.type = "text/javascript";
            script.onload = function()
            {
                this.app._loadResponse();
                document.getElementsByTagName('head')[0].removeChild(this.script);

            }.bind({app: this, script: script});

            script.onreadystatechange = function() // IE8
            {
                if((this.script.readyState == 'complete') || (this.script.readyState == 'loaded'))
                    this.app._loadResponse();
            }.bind({app: this, script: script});

            document.getElementsByTagName('head')[0].appendChild(script);
        }
        else
        {
            jQuery.ajax({
                url: Hafas.Config.gUrlAjaxGetStop + jQuery.param(data),
                success: this._loadResponse.bind(this),
                error: function(e) {
                    console.error(e);
                }
            });
        }
    };

    this._loadResponse = function(data)
    {
        if(!options.useJSONP)
            eval(data);
        if (typeof SLs.sls != "undefined")
            this._fill(SLs.sls.suggestions, false);
    };

    this.clear = function()
    {
        this.input.value = "";
        this.empty();
        this.markedIndex = null;
        this.maxIndex = null;
        this._updateFavButtonState();
    };

    this.empty = function()
    {
        this.currData = [];
        this.div.html("");
    };


    this._getMostSignificantBitValue = function(unsignedInt) {
        var bitVal = unsignedInt.toString(2);
        bitVal = bitVal.split("").reverse().join("");
        var ret = 0;
        for (var m = 0; m < bitVal.length; m++) {
            if (parseInt(bitVal.charAt(m)) == 1) {
                return Math.pow(2, m);
            }
        }
        return 0;
    };

    this.addSuggest = function(name, type, id, x, y)
    {
        var tripId = "A=" + type + "@O=" + name + "@X=" + x + "@Y=" + y + "@L=" + id;
        this.currData.push({
            value: name,
            type: type,
            x: x,
            y: y,
            extId: id,
            id: tripId
        });
    };

    this.loadSuggestForInput = function()
    {
        this.empty();
        this._show();
        this._load(this.input.value);
    };

    if (input == null || typeof SimpleLocSuggest.Instances[input.id] != "undefined")
        return;
    this._create();
}

SimpleLocSuggest.Instances = {};
SimpleLocSuggest.hideAll = function() {
    for (var key in SimpleLocSuggest.Instances)
        SimpleLocSuggest.Instances[key]._hide();
};
SimpleLocSuggest.clearAll = function() {
    for (var key in SimpleLocSuggest.Instances)
        SimpleLocSuggest.Instances[key].clear();
};

SimpleLocSuggest.emptyAll = function() {
    for (var key in SimpleLocSuggest.Instances)
        SimpleLocSuggest.Instances[key].empty();
};

