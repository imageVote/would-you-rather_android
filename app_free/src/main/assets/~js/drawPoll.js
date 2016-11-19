
//PIXEL RATIO
var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

function getCanvasImage(divQuery, obj, keyId, width, listPoll, callback) {
    var url = appPath + "/" + keyId;

    var question = obj.question;
    var options = obj.options;
    var style = obj.style;
    var country = obj.style.country;

    if (!width) {
        width = 506; //twitter width
    }
    console.log(width)

    var opts = sortOptions(obj);
    
    //let debug on console
    var mainPoll = new poll({
        style: style,
        width: width,
        question: question,
        options: opts,
        url: url,
        country: country
    }); //draw image

    $(divQuery).addClass("image");

    if (!listPoll) {
        console.log("!listPoll");
//            var href = "http://click-to-vote.at/" + keyId;
//            if (Device) {
//                href = "?" + keyId;
//            }
//            $(divQuery).append("<div class='link'>link: <a href='" + href + "'>" + url + "</a></div>");

        var container = $("<div class='link'>link: </div>");
        var a = $("<a>" + url + "</a>");
        container.append(a);
        $(divQuery).append(container);

        a.click(function () {
            $("body").append("<img class='loading absoluteLoading' src='~img/loader.gif'/>");

            if (window.Device) {
                //prevent hash works
                location.href = location.origin + location.pathname + "?" + keyId;
//                location.hash = "";
//                location.search = keyId;                
            } else {
                //location.href = "http://click-to-vote.at/" + keyId + "#translucent";
                location.href = "http://click-to-vote.at/" + keyId;
            }
        });
    }

    mainPoll.drawCanvas(function (canvas) {
        //ARROWS, prepend before link
        if (!listPoll && options.length > 2) {
            $(divQuery).prepend("<div id='heightScale'><div class='up'></div><div class='down'></div></div>");
            heightScale(divQuery, mainPoll);
        }

        //convert to image to let copy on any device
        var img = mainPoll.canvasImg(canvas);
        $(divQuery).prepend(img);

        if (callback) {
//            callback(image.toDataURL());
            callback(img.attr("src"));
        }
    });
    
    window.ctxx = mainPoll;
}

function heightScale(divQuery, poll) {
    $(divQuery).find(".up").click(function () {
        poll.maxOptions--;
        poll.drawCanvas(function (canvas) {
            var oldCanvas = $(divQuery).find("canvas, img");
            
            var img = poll.canvasImg(canvas);
            oldCanvas.after(img);
            oldCanvas.remove();
        });

    });
    $(divQuery).find(".down").click(function () {
        poll.maxOptions++;

        poll.drawCanvas(function (canvas) {
            var oldCanvas = $(divQuery).find("canvas, img");

            var img = poll.canvasImg(canvas);
            oldCanvas.after(img);
            oldCanvas.remove();
            //scroll bottom
            $("body").scrollTop($(document).height() - $(window).height());
        });
    });
}

////////////////////////////////////////////////////////////////////////////
//DRAW CANVAS //////////////////////////////////////////////////////////////

function poll(values) {
    for (var key in values) {
        this[key] = values[key];
    }

    if (!this.style) {
        this.style = screenPoll.style;
    }
    this.maxOptions = 4; //for twitter mobile visualization
}

poll.prototype.drawCanvas = function (callback) {
    var _this = this;
    var w = this.width;
    var question = this.question;
    var opts = this.options;
    var url = this.url;
    var country = this.country;
    console.log(opts);

    $("#warnMaximumOptions").remove();
    //limit maximum
    if (this.maxOptions > opts.length) {
        this.maxOptions = opts.length;
    }
    if (this.maxOptions > 4) {
        $("#image > div").prepend("<small id='warnMaximumOptions'>" + transl("warnMaximumOptions") + "</small>");
    }
    //limit minimum
    if (this.maxOptions < 2) {
        this.maxOptions = 2;
    }

    //disable arrows
    if (this.maxOptions == opts.length) {
        $("#heightScale .down").addClass("disabled");
    } else {
        $("#heightScale .down").removeClass("disabled");
    }
    if (this.maxOptions == 2) {
        $("#heightScale .up").addClass("disabled");
    } else {
        $("#heightScale .up").removeClass("disabled");
    }

    //create canvas and store context
    this.canvas = newCanvas(w, this.maxOptions);
    this.ctx = this.canvas.getContext("2d");

    this.totalVotes = 0;
    for (var i = 0; i < opts.length; i++) {
        this.totalVotes += opts[i][2];
    }

    //not move head down to show polls easely
    this.h = w / 5.5; //100
    this.iconHeight = this.h; //THIS height

    this.drawBackground();
    if (this.style.owner) {
        this.drawOwner(this.style.owner);
    }
    this.drawQuestion(question);
    for (var i = 0; i < opts.length; i++) {
        //limit options
        if (i == this.maxOptions) {
            break;
        }
        var name = opts[i][1];
        var val = opts[i][2];
        this.drawOption(name, val, this.h, opts.length, i);
        this.h += w / 12; //50
    }

    //store 'iconHeight' for out calls
    this.drawIcon(); //after cropImageFromCanvas. browser detects insecurity to read images

    // 'more'
    var ctx = this.ctx;
    if (this.maxOptions < this.options.length) {
        var margin = w / 60;
        var more = this.options.length - this.maxOptions;
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(" + screenPoll.style.questionColor.toString() + ",0.6)";
        ctx.font = w / 28 + "px Verdana";
        ctx.fillText("( " + more + " " + transl("more") + " )", margin, this.h - margin);

        this.h += w / 16;
    }

    this.drawFooter(url, country, function () {
        //w8 canvas footer images..
        cropImageFromCanvas(ctx, _this.h);
        callback(_this.canvas);
    });
};

poll.prototype.canvasImg = function () {
    var canvas = this.canvas;
    var d = canvas.toDataURL();
    var image = $("<img src='" + d + "'/>");
    image.css({
        width: $(canvas).width() + "px"
    });
    return image;
};

poll.prototype.drawBackground = function () {
    var ctx = this.ctx;
    var canvas = this.ctx.canvas;

    ctx.fillStyle = "rgb(" + screenPoll.style.backgroundColor.toString() + ")";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
};

poll.prototype.drawOwner = function (owner) {
    var ctx = this.ctx;
    var w = this.width;
    var top = w / 32;
    var margin = w / 90;

    //like footer link
    var by = "by: ";
    ctx.fillStyle = "rgba(" + screenPoll.style.questionColor.toString() + ",0.5)";
    ctx.font = w / 33 + "px Verdana";
    ctx.fillText("by: ", margin, top);

    var byWidth = ctx.measureText(by).width;
    ctx.fillStyle = "rgba(" + screenPoll.style.questionColor.toString() + ",0.65)";
    ctx.font = w / 33 + "px Verdana";
    owner = decode_uri(owner);
    ctx.fillText(owner, margin + byWidth, top);
};

poll.prototype.drawQuestion = function (q) {
    var ctx = this.ctx;
    var w = this.width;
    var h = this.h;
    var margin = w / 60;

    var array = q.split("\n");
    //if sub-Title
    if (array.length > 1) {
        q = array[0];

        ctx.fillStyle = "rgba(" + screenPoll.style.questionColor.toString() + ",0.7)";
        ctx.font = w / 25 + "px Verdana"; //26
        var sub = decode_uri(array[1]);
        ctx.fillText(sub, margin, h - w / 30, w - margin); //10, 80, 580
        this.h += w / 20; //35
    }

    ctx.fillStyle = "rgb(" + screenPoll.style.questionColor.toString() + ")";
    ctx.font = w / 20 + "px Arial"; //32
    q = decode_uri(q);
    ctx.fillText(q, margin, h - w / 11, w - w / 9); //10, 42, 540
};

poll.prototype.drawOption = function (optionName, value, h, length, pos) {
    //console.log(optionName + " : " + value);
    var ctx = this.ctx;
    var w = this.width;
    var totalWidth = w - w / 30; //580
    var fontSize = w / 23;

    var textStyle = "";
    if (0 === pos && value > 0 || value === this.maxOptionValue) { //first
        textStyle = "bold";
        this.maxOptionValue = value;
    }

    //if only 1 option
    if (1 == length) {
        var first;
        var string = String(value);
        var char = string.charAt(0);
        if (char == 1) { //to 2xx
            first = "2";
        } else if (char < 5) { //to 5xx
            first = "5";
        } else { //to 10xx
            first = "10";
        }

        var number = first;
        for (var i = 0; i < string.length - 1; i++) {
            number + "0";
        }

        this.totalVotes = Math.max(parseInt(number), 10);

        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(" + this.style.questionColor.toString() + ",0.7)";
        ctx.font = w / 33 + "px Arial"; //18
        ctx.fillText("/" + this.totalVotes, w - w / 50, h + w / 15); //588, +35

        //revert if only 1 option
        textStyle = "";
    }

    var percent = 0;
    if (this.totalVotes) {
        percent = value / this.totalVotes;
    }

    var width = percent * totalWidth;
    if (!width) {
        width = 0;
    }

    //grey
    ctx.beginPath();
    ctx.fillStyle = "rgb(" + screenPoll.style.gradientBackground.toString() + ")";
    ctx.rect(w / 60, h - w / 19, totalWidth, w / 14); //10, 32, 42
    ctx.fill();

    //gradient:
    var c1 = this.style.color1;
    var c2 = this.style.color2;

    var red = Math.round(c1[0] + (c2[0] - c1[0]) * percent); //to 150
    var green = Math.round(c1[1] + (c2[1] - c1[1]) * percent); //to 255
    var blue = Math.round(c1[2] + (c2[2] - c1[2]) * percent); //to 255

    var color1 = "rgb(" + c1[0] + "," + c1[1] + "," + c1[2] + ")";
    var color2 = "rgb(" + red + "," + green + "," + blue + ")";

    ctx = fillGradient(ctx, color1, color2, [w / 60, h - w / 19, width, w / 14]); //10, 32, 42
    ctx.fill();

    //votes number
    var textValue = formatNumber(value);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgb(" + screenPoll.style.textColor.toString() + ")";
    ctx.font = textStyle + " " + fontSize + "px Arial"; //32
    ctx.fillText(textValue, w - w / 40, h); //585
    var textWidth = ctx.measureText(textValue).width;

    var marginRight = w / 36;

    //percentage
    ctx.textAlign = "right";
    ctx.fillStyle = "rgb(150,150,150)";
    ctx.font = "italic " + w / 26 + "px Arial"; //32
    var perc = Math.floor(percent * 100);

    var percWidth = w / 20;
    //only show if
    if (0 != perc && perc < 99 && this.totalVotes > 10 && (this.options.length > 1 || this.totalVotes > 100)) {
        var txt = perc + "% - ";
        ctx.fillText(txt, w - marginRight - textWidth, h); //15, h, 510
        percWidth = ctx.measureText(txt).width;
    }

    //text
    ctx.textAlign = "left";
    ctx.fillStyle = "rgb(" + screenPoll.style.textColor.toString() + ")";
    ctx.font = textStyle + " " + fontSize + "px Arial"; //32
    optionName = decode_uri(optionName);
    ctx.fillText(optionName, w / 40, h, w - marginRight - percWidth - textWidth); //15, h, 510
};

poll.prototype.drawFooter = function (url, country, callback) {
    var ctx = this.ctx;
    var w = this.width;
    this.h = Math.max(this.h, w / 1.9);
    var margin = w / 90;
    var footerHeight = this.h - margin;

    //link
    if (url) {
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(" + screenPoll.style.questionColor.toString() + ",0.45)";
        ctx.font = w / 33 + "px Verdana";
        ctx.fillText(url, margin, footerHeight); //10
    }

    //date
    var date = new Date();
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();
    var string = year + '-' + month + '-' + day;

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(" + screenPoll.style.questionColor.toString() + ",0.7)";
    ctx.font = w / 36 + "px Verdana"; //18
    ctx.fillText(string, w - margin, footerHeight);

    //flag
    if (window.country || !country) {
        callback();
        return;
    }

    var flagIcon = new Image;
    flagIcon.onload = function () {
        ctx.drawImage(flagIcon, w - w / 4.4, footerHeight - w / 37, w / 30, w / 30);
        callback();
    };
    flagIcon.onerror = function () {
        //error(transl("e_flagNotFound") + " " + country.toUpperCase());
        console.log(transl("e_flagNotFound") + " " + country.toUpperCase());
        callback();
    };
    flagIcon.src = "~img/flags/48/" + country.toUpperCase() + ".png";
};

var appIcon = new Image;
appIcon.src = "data:image/png;base64,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";

poll.prototype.drawIcon = function () {
    var ctx = this.ctx;

    var w = this.width;
    ctx.beginPath();
    ctx.fillStyle = "rgb(" + this.style.backgroundColor.toString() + ")";
    ctx.rect(w - w / 12, w / 60, w / 15, w / 15); //550, 10, 40, 40
    ctx.fill();

    var vh = 0, vw = 0;
    var iW = appIcon.width;
    var iH = appIcon.height;

    var iconSize = w / 15;
    if (iW > iH) {
        iH = iH / iW * iconSize;
        iW = iconSize;
        vh = (iW - iH) / 2;
    } else {
        iW = iW / iH * iconSize;
        iH = iconSize;
        vw = (iH - iW) / 2;
    }

    var marginTop = (this.iconHeight - w / 6.7) + vh; //margin + image proportions
    this.ctx.drawImage(appIcon, w - w / 13 + vw, marginTop, iW, iH); //550, 10
};
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function newCanvas(width, options) {
    console.log("canvas width = " + width);

    var ratio = PIXEL_RATIO;
    var w = width * ratio;
    var maxHeight = w + w / 1.5;

    if (options) {
        var h = 0.2 + options * 0.1;
        maxHeight = w * Math.max(h, 1);
    }

    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = maxHeight;

    //canvas.style.maxWidth = "100%"; //case when scroll appears and modifies screen width
    //let max-width 100% (2.3 bug)
    canvas.style.width = w / PIXEL_RATIO + "px"; //case when scroll appears and modifies screen width
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);

    return canvas;
}


function fillGradient(ctx, color1, color2, position) {
    ctx.beginPath();
    //ctx.fillStyle = "rgb(255,200,100)";
    if (!position) {
        position = [0, 0, ctx.canvas.width, ctx.canvas.height];
    }
    var grd = ctx.createLinearGradient(position[0], 0, position[2], 0);
    grd.addColorStop(0, color1);
    grd.addColorStop(1, color2);
    ctx.fillStyle = grd;
    ctx.rect(position[0], position[1], position[2], position[3]);
    return ctx;
}

//not do canvas works out of main file
function cropImageFromCanvas(ctx, h) {
    var canvas = ctx.canvas;
    var w = canvas.width;

    var height = h * PIXEL_RATIO;
    console.log(canvas.width)
    console.log(canvas.style.width)
    var cut = ctx.getImageData(0, 0, w, height);
    canvas.height = height;
    ctx.putImageData(cut, 0, 0);
}
