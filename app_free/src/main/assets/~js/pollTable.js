
function fillTable(divQuery, obj, conf) {
    if (!obj) {
        console.log("invalid object: " + JSON.stringify(obj));
        return;
    }

    console.log("divQuery = " + divQuery);
    //console.log(JSON.stringify(obj));
    var question = obj.question;
    var options = obj.options;

    //add html
    $(divQuery).html("");
    var table = $("<table class='options'>");
    $(divQuery).attr("class", 'votation')
            .append("<p class='question'></p>"
                    + "<p class='question2'></p>")
            .append(table);

    var questions = question.split("\n");
    if (questions.length > 1) {
        question = questions[0];

        var query = divQuery + " .question2";
        $(query).text(questions[1]);
        if (window.queryTranslation) {
            var sub = decode_uri(questions[1]);
            queryTranslation(query, sub);
        }
    }
    question = decode_uri(question);
    $(divQuery + " .question").text(question);

    console.log(options);

    //COUNT VOTES
    var optionsResult = sortOptions(obj);

    //FILL TABLE WITH RESULTS
    for (var i = 0; i < optionsResult.length; i++) {
        var option = optionsResult[i];
        var n = option[0];

        var tr = $("<tr class='option_" + n + "'>"
                + "<td class='option'></td>"
                + "<td class='input'><input class='checkbox' type='checkbox'/></td>"
                + "<td class='result'>" + formatNumber(option[2]) + "</td>"
                + "</tr>");
        table.append(tr);

        var query = divQuery + " .option_" + n + " .option";
        var decodeOption = decode_uri(option[1]);
        $(query).text(decodeOption);
        if (window.queryTranslation) {
            queryTranslation(query, decodeOption);
        }

        trEvents(tr, n);
    }

    //ADD OWN USER CHECKS
    var users = obj.users;
    //if users, user, votes..
    var deviceId = window.userId; //con be public or private
    var browserId = localStorage.getItem("userId");

    if (users) {
        var someId;
        if (users[deviceId] && (users[deviceId][1] || 0 === users[deviceId][1])) {
            someId = deviceId;

        } else if (users[browserId] && (users[browserId][1] || 0 === users[browserId][1])) {
            someId = browserId;
        }

        if (someId) {
            addUserVotes(divQuery, users[someId][1]);
        }
    }

    $("#votation").css("pointer-events", "auto");

    //EXTRAS
    if (conf) {
        var div = $(divQuery);

        if (conf.removable) {
            var parent = div.parent();
            var container = $("<div>");

            div.appendTo(container);
            container.attr("id", div.attr("id"));
            var forget = lang["forgetPoll"];
            container.append("<div class='removeInfo'>" + forget + "</div>");
            container.append("<div class='loader'><img src='~img/ajax-loader.gif'/></div>");

            div.attr("id", "");
            parent.append(container);
        }
    }
}

function addUserVotes(divQuery, vt) {
    var arr = voteArray(vt);
    for (var i = 0; i < arr.length; i++) {
        var votedOption = arr[i];
        console.log("user add check");
        $(divQuery + " .option_" + votedOption + " .checkbox")[0].checked = true;
    }
}

function trEvents(tr, option) {
    //make numbers arrays (not necessari now but secured)
    option = parseInt(option);

    tr.find(".checkbox").change(function() {
        console.log("change");
        if (!user.id) {
            $("#errorLog").text(lang["notValidUserId"]);
            return;
        }

        //add to userId votes
        var value = parseInt(tr.find(".result").text().replace(".", ""));
        if ($(this)[0].checked) {

            //if allows only 1 vote, REMOVE ALL other votations    
            var obj = screenPoll.obj;
            if (!obj.style || !obj.style.multipleChoice) {
                var arr = voteArray(user.vt);
                console.log("arr = " + JSON.stringify(arr));
                for (var i = 0; i < arr.length; i++) {
                    var optNumber = parseInt(arr[i]);
                    console.log("removing votation: " + optNumber);
                    unSelectOption(optNumber);
                }
            }

            user.vt = addVote(user.vt, option);
            tr.find(".result").text(formatNumber(value + 1));
            totalVotes++;

        } else {
            //remove from userId votes
            console.log("unselect " + option + ".")
            unSelectOption(option);
        }


        console.log(originalVotes + " : " + user.vt.toString());
        if (originalVotes != user.vt.toString()
                //if public button was changed
                || ($("#p_makePublic input").length && originalPublic != $("#p_makePublic input").is(':checked'))) {
            shareToSave();
        } else {
            saveToShare();
        }
    });
}

//unselect option table
function unSelectOption(option) {
    //parse int for indexOf recognition
    option = parseInt(option);
    user.vt = removeVote(user.vt, option);
    //modify global object
    if (window.obj && obj.users && obj.users[window.userId]) {
        obj.users[userId][1] = user.vt;
    }

    var tr = $("#votationBox .option_" + option);
    tr.find(".checkbox")[0].checked = false;
    var value = parseInt(tr.find(".result").text().replace(".", ""));
    tr.find(".result").text(formatNumber(value - 1));
    totalVotes--;
}

function addVote(element, option) {
    $(".option_" + option + " .checkbox")[0].checked = true;

    //try to remove first
    element = removeVote(element, option);

//    if ("object" == typeof element) { //array
    if (Object.prototype.toString.call(element) === '[object Array]') { //array
        element.push(option);
        element.sort();
    } else if (element || 0 === element) {
        element = [element, option];
        element.sort();
    } else {
        element = option;
    }

    //modify global object
    if (window.obj && obj.users && obj.users[window.userId]) {
        obj.users[userId][1] = element;
    }

    return element;
}

function removeVote(element, option) {
    console.log("" + element + "," + option);
    //remove
    if ("object" == typeof element) { //array
        //if is in votes array (parseInt WILL BE DEPRECATED)
        var index = user.vt.indexOf(parseInt(option));
        if (index > -1) {
            user.vt.splice(index, 1);
        }
        //or if as string (WILL BE DEPRECATED)
        var index = user.vt.indexOf("" + option);
        if (index > -1) {
            user.vt.splice(index, 1);
        }

        user.vt.sort();

        //convert
        if (element.length == 1) {
            element = element[0];
        }

    } else if (element === option || element === "" + option) {
        element = "";
    }

    console.log(element)
    return element;
}
