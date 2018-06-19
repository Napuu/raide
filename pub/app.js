var socket = io();
socket.emit("message", "moI");

//debug
// setCookie("city1", "helsinki");
// setCookie("city2", "oulu");
// setCookie("trainNumber", 27);
// setCookie("city1", "kokkola");
// setCookie("city2", "oulu");
// setCookie("trainNumber", 29);

// //get values from cookie

$("#trainInfoForm #city1").val(getCookie("city1"));
$("#trainInfoForm #city2").val(getCookie("city2"));
$("#trainInfoForm #trainNumber").val(getCookie("trainNumber"));

if (parseInt($(window).width()) > 400) {
    $(".container").width(400);
}

$(".container .col").css({
    "display": "inline-block",
    "vertical-align": "middle",
    "float": "none"
});

$(".container").css({
    "padding-top": "20px",
    "justify-content": "center",
    "align-content": "center"
});
$(".container *").css({
    "font-size": "15px"
});
$(".container .row").css({
    "padding": "15px"
});
$(".container .col").css({
    // "text-align": "right"
});

var trainParams = {
    city1: getCookie("city1"),
    city2: getCookie("city2"),
    trainNumber: getCookie("trainNumber")
}

$("#trainInfoForm #fetch").on("click", function (ev) {
    trainParams.city1 = $("#trainInfoForm #city1").val();
    trainParams.city2 = $("#trainInfoForm #city2").val();
    trainParams.trainNumber = $("#trainInfoForm #trainNumber").val();
    setCookie("city1", trainParams.city1);
    setCookie("city2", trainParams.city2);
    setCookie("trainNumber", trainParams.trainNumber);
    console.log("fetching stuff");
    socket.emit("fetch", trainParams);
});

socket.on("answer", function (data) {
    console.log(data);
    let answerField1 = "", answerField2 = "";
    // scenarios:
    // 1: train has not arrived at departure station 
    // 2: is not ready at trips first station
    // 3: train is ready at trips departure station
    // 4: train is on its way from departure to arrival station
    //   4.1 estimated arrival late
    //   4.2 estimated arrival on schedule
    // 5: train has arrived at its destination 
    

    // updated scenarios
    //
    // 1. field
    //  train is arriving at its departure station
    //   estimated departure time
    //  train is not ready at its departure station
    //   estimated departure time
    //  train has left its departure station
    //  2. field
    //   train is arriving 
    //   train has already arrived
    // 1
    
    // stuff for departure station
    if (data.departure.actualTime == undefined) {
        if (data.arrivalToDeparture != undefined && data.arrivalToDeparture.actualTime == undefined) { 
            answerField1 += "Juna saapuu raiteelle " + data.arrivalToDeparture.commercialTrack;
            let timeToUse; 
            let estimate = false;
            if (data.arrivalToDeparture.liveEstimateTime != undefined) {
                timeToUse = data.arrivalToDeparture.liveEstimateTime;
                estimate = true;
            } else {
                timeToUse = data.arrivalToDeparture.scheduledTime;
            }
            if (estimate) {
                answerField1 += ", arvion mukaan ";
            } else {
                answerField1 += ", aikataulun mukaan ";
            }
            let dateTimeToUse = new Date(timeToUse);
            answerField1 += " klo. " + toDD(dateTimeToUse.getHours()) + ":" + toDD(dateTimeToUse.getMinutes()) + ".";
        } 
        // 2
        else if (data.departure.trainReady == undefined || !data.departure.trainReady.accepted) {
            answerField1 = "Juna ei ole vielä valmiina raiteella " + data.departure.commercialTrack + ".";
        }
        answerField1 += "<br>";
        let timeToUse;
        let estimate = false;
        if (data.departure.liveEstimateTime != undefined) {
            timeToUse = new Date(data.departure.liveEstimateTime);
            estimate = true;
        } else {
            timeToUse = new Date(data.departure.scheduledTime);
        }
        answerField1 += "Juna lähtee raiteelta " + data.departure.commercialTrack;
        if (estimate) {
            answerField1 += ", arvion mukaan ";
        } else {
            answerField1 += ", aikataulun mukaan ";
        }
        answerField1 += " klo. " + toDD(timeToUse.getHours()) + ":" + toDD(timeToUse.getMinutes()) + ".";
    } else {
        let timeToUse = new Date(data.departure.actualTime);
        answerField1 += "Juna lähti " + toDD(timeToUse.getHours()) + ":" + toDD(timeToUse.getMinutes()) + ".";
    }
    console.log("answer for request");
    console.log(answerField1);
    // $("#answer #answerField").html(answerField1);
    

    if (data.arrival.actualTime == undefined) {
        answerField2 += "Juna saapuu raiteelle " + data.arrival.commercialTrack;
        let timeToUse;
        if (data.arrival.liveEstimateTime != undefined) {
            timeToUse = new Date(data.arrival.liveEstimateTime);
            answerField2 += ", arvion mukaan ";
        } else {
            timeToUse = new Date(data.arrival.scheduledTime);
            answerField2 += ", aikataulun mukaan ";
        }
        answerField2 += "klo. " + toDD(timeToUse.getHours()) + ":" + toDD(timeToUse.getMinutes()) + ".";
    } else {
        answerField2 += "Juna on saapunut raiteelle " + data.arrival.commercialTrack + ".";
    }
    console.log(answerField2);

    if (data.arrival.differenceInMinutes != 0) {
        if (Math.abs(data.arrival.differenceInMinutes) != 1) answerField2 += " " + Math.abs(data.arrival.differenceInMinutes) + " minuuttia ";
        else answerField2 += " Minuutin ";
        if (data.arrival.differenceInMinutes < 0) answerField2 += "etuajassa";
        else answerField2 += "myöhässä";
        answerField2 += ".";
    }
    $("#answerCity1").html(firstToUpperCase(trainParams.city1));
    $("#answer #answerField1").html(answerField1);

    $("#answerCity2").html(firstToUpperCase(trainParams.city2));
    $("#answer #answerField2").html(answerField2);

    
});

function getCookie(key) {
    let val = "; " + document.cookie;
    let spl = val.split("; " + key + "=");

    if (spl.length == 2) return spl.pop().split(";").shift();
    return "";
}
function setCookie(key, val) {
    document.cookie = key + "=" + val;
}

function firstToUpperCase(str) {
    let ret = "";
    ret += str.charAt(0).toUpperCase(); 
    for (let i = 1; i < str.length; i++) {
        ret += str.charAt(i).toLowerCase();
    }
    return ret;
}

function toDD(n) {
    if (n < 10) return "0" + n;
    return n;
}