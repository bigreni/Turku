
function eId(id)
{
    return document.getElementById(id);
}

Hafas.tools = {

    hasSessionStorage:null,

    getDataFromTripelId: function(id, dataName)
    {
        var dataList = id.split("@");
        for (var i = 0; i < dataList.length; i++)
        {
            var data = dataList[i].split("=");
            if (data[0] == dataName)
                return data[1];
        }
        return null;
    },
    getCurrentDateTime: function()
    {
        var date = new Date();
        var toTime = function(v) {
            if (v < 10)
                return "0" + v;
            return v;
        };
        var timeString = toTime(date.getHours()) + ":" + toTime(date.getMinutes());
        var dateString = toTime(date.getDate()) + "." + toTime(date.getMonth() + 1) + "." + date.getFullYear();
        return { time:timeString, date:dateString };
    },

    decodeHTML: function(v)
    {
        var div = document.createElement("div");
        div.innerHTML = v;
        return div.innerHTML;
    },

    showWaitScreen: function()
    {
        jQuery("#hafasWaitScreen").show();
    },

    hideWaitScreen: function()
    {
        jQuery("#hafasWaitScreen").hide();
    },
    getMediaLevel: function()
    {
        return document.getElementById("MediaLevelChecker").clientWidth;
    },
    isInMobileMode: function()
    {
        return this.getMediaLevel() == 3;
    },
    isInTabletMode: function()
    {
        return this.getMediaLevel() == 2;
    },
    isInDesktopMode: function()
    {
        return this.getMediaLevel() == 1;
    },
    scrollTo: function(nodeId, d)
    {
        if(typeof d == "undefined")
            d = 0;
        jQuery('html, body').animate({ scrollTop: (jQuery('#'+nodeId).offset().top+d)}, 'slow');
    },
    decodeAllTexts: function(obj)
    {
        for (var key in obj)
        {
            if (typeof obj[key] == "string")
                obj[key] = Hafas.tools.decodeHTML(obj[key]);
            else if (typeof obj[key] == "object")
                Hafas.tools.decodeAllTexts(obj[key]);
        }
    },
    LineNumberSorter: function(a, b) // Sortiert Liniennummern. a und b müssen ein String sein.
    {
        var aNum = Hafas.tools.parseLineNumber(a);
        var bNum = Hafas.tools.parseLineNumber(b);

        if(aNum.pre != bNum.pre)
            return aNum.pre.localeCompare(bNum.pre);

        if(aNum.number != bNum.number)
            return aNum.number - bNum.number;

        return aNum.post.localeCompare(bNum.post);
    },

    parseLineNumber: function(s) // Teilt Liniennummen in [pre, nummer, post] z.B. 20B -> ["", 20, "B"]
    {
        var pre = "";
        var post = "";
        var numberS = "";

        var d = 0;
        for(var i = 0; i < s.length; i++)
        {
            var c = s[i];
            var cIsInt = !isNaN(parseInt(c));
            if(cIsInt)
            {
                if(d < 2)
                {
                    d = 1;
                    numberS += c;
                }
                else
                {
                    post += c;
                }

            }
            else if(d == 0)
                pre += c;
            else
            {
                d = 2;
                post += c;
            }
        }

        if(numberS == "")
            numberS = "999999";

        return { pre:pre.trim(), number:parseInt(numberS, 10), post:post.trim() };
    },
    replaceAll: function(s, v, r)
    {
        var res = "";
        for(var i = 0; i < s.length; i++)
        {
            if(s[i] == v)
                res += r;
            else
                res += s[i];
        }
        return res;
    }
};

try {
    sessionStorage.setItem("test", "test");
    Hafas.tools.hasSessionStorage = sessionStorage.getItem("test") == "test";
    sessionStorage.removeItem("test");
}
catch(e)
{
    Hafas.tools.hasSessionStorage = false;
}

function CheckboxButton(buttonId, checkboxId)
{
    this.button = jQuery("#"+buttonId)[0];
    this.checkbox = jQuery("#"+checkboxId)[0];

    this.onclick = function()
    {
        if(!this.checkbox.checked)
            jQuery(this.button).addClass("lc_inactive");
        else
            jQuery(this.button).removeClass("lc_inactive");
    };

    if(this.checkbox.checked)
        jQuery(this.button).addClass("lc_inactive");
    else
        jQuery(this.button).removeClass("lc_inactive");
    this.button.onclick = this.onclick.bind(this);
}



