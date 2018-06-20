var socket = io();

$("#city1Input").val(getCookie("city1"));
$("#city2Input").val(getCookie("city2"));
$("#trainNumberInput").val(getCookie("trainNumber"));



$("#questionForm").css({
    "padding": "10px",
    "margin-top": "10px",
    "margin-left": "10px",
    "margin-right": "10px"
});


$("#errorMessage").css({
    "width": $("#questionForm").width() + 22 + "px",
    "margin-left": "10px" 
}).hide();
$("#answer").css({
    "left": $("#questionForm").offset().left + "px",
    "width": $("#questionForm").width() + 22 + "px",
    "padding": "10px",
    "margin-top": "10px",
    "margin-left": "10px",
    "margin-right": "10px"
}).hide();
$("#fetchButton").css({
    "margin-top": "5px"
});

// $(".container .col").css({
    // "display": "inline-block",
    // "vertical-align": "middle",
    // "float": "none"
// });


var trainParams = {
    city1: getCookie("city1"),
    city2: getCookie("city2"),
    trainNumber: getCookie("trainNumber")
}

var indicatorContent = "";
//var indicatorInterval = setInterval(updateIndicator, 200);
var indicatorInterval;
function updateIndicator() { 
    let next = indicatorContent + ".";
    if (next == "......") next = "";
    $("#loadingIndicator").html(next);
    indicatorContent = next;
}
$("#fetchButton").on("click", function (ev) {

    trainParams.city1 = $("#city1Input").val();
    trainParams.city2 = $("#city2Input").val();
    trainParams.trainNumber = $("#trainNumberInput").val();
    setCookie("city1", trainParams.city1);
    setCookie("city2", trainParams.city2);
    setCookie("trainNumber", trainParams.trainNumber);
    console.log("fetching stuff");
    $("#answer, #errorMessage").fadeOut(400, () => {
        setTimeout(() => {$("#loadingIndicator").fadeIn()}, 200);
    });
    indicatorInterval = setInterval(updateIndicator, 200); 
    socket.emit("fetch", trainParams);
});

$(document).keypress(function (ev) {
    if (ev.which == 13) $("#fetchButton").click().focus();
});
socket.on("answer", function (data) {
    clearInterval(indicatorInterval);
    $("#loadingIndicator").html("").fadeOut(400, () => {
        if (data.err) {
            $("#errorMessage").html("Junaa ei löytynyt näillä tiedoilla").fadeIn(); 
        }
        else {
            $("#answer").fadeIn();
            let answerCity1 = firstToUpperCase(trainParams.city1);
            let answerCity2 = firstToUpperCase(trainParams.city2);
            
            let city1Track = "Raide " + data.departure.commercialTrack;
            if (data.departure.commercialTrack == "") city1Track += "ei tiedossa";
            let city2Track = "Raide " + data.arrival.commercialTrack;
            if (data.arrival.commercialTrack == "") city2Track += "ei tiedossa";

            let city1DepartureTime = "";
            let timeToUse1;
            if (data.departure.actualTime != undefined) {
                timeToUse1 = new Date(data.departure.actualTime);
                city1DepartureTime += "Toteutunut lähtöaika: ";
            } else if (data.departure.liveEstimateTime != undefined) {
                timeToUse1 = new Date(data.departure.liveEstimateTime);
                city1DepartureTime += "Arvioitu lähtöaika: ";
            } else {
                timeToUse1 = new Date(data.departure.scheduledTime);
                city1DepartureTime += "Arvioitu lähtöaika: ";
            }
            city1DepartureTime += toDD(timeToUse1.getHours()) + ":" + toDD(timeToUse1.getMinutes());

            let city2DepartureTime = "";
            let timeToUse2;
            if (data.arrival.actualTime != undefined) {
                timeToUse2 = new Date(data.arrival.actualTime);
                city1DepartureTime += "Toteutunut saapumisaika: ";
            } else if (data.arrival.liveEstimateTime != undefined) {
                timeToUse2 = new Date(data.arrival.liveEstimateTime);
                city2DepartureTime += "Arvioitu saapumisaika: ";
            } else {
                timeToUse2 = new Date(data.arrival.scheduledTime);
                city2DepartureTime += "Arvioitu saapumisaika: ";
            }
            city2DepartureTime += toDD(timeToUse2.getHours()) + ":" + toDD(timeToUse2.getMinutes());


            $("#answerCity1").html(firstToUpperCase(trainParams.city1));
            $("#city1Track").html(city1Track);
            $("#city1DepartureTime").html(city1DepartureTime);

            $("#answerCity2").html(firstToUpperCase(trainParams.city2));
            $("#city2Track").html(city2Track);
            $("#city2DepartureTime").html(city2DepartureTime);
        }
    });    
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
