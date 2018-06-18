var request = require("request");
console.log(run({
    city1: "loimaa",
    city2: "tampere",
    trainNumber: 919
}));
function run(params) {



    // following parameters are acquired from the ticket 
    // let params = {
        // city1: "tampere",
        // city2: "oulu",
        // trainNumber: 23 
    // };
    return cityToStationShortCode(params.city1, function (stationShortCode1) {
        return cityToStationShortCode(params.city2, function (stationShortCode2) {
            console.log("city1: " + stationShortCode1);
            console.log("city2: " + stationShortCode2);
            return fetchTrainInfo(params.trainNumber, function (trainInfo) {
                for (i in trainInfo.timeTableRows) {
                    let stationEvent = trainInfo.timeTableRows[i];
                    if (stationEvent.type == "DEPARTURE" && stationEvent.stationShortCode == stationShortCode1) {
                        // stationevent of train's departure station. train might not be there or not 
                        
                    }
                    if (stationEvent.type == "ARRIVAL" && stationEvent.actualTime == undefined && stationEvent.stationShortCode == stationShortCode2) {
                        // train has not yet arrived at its destination. it is also possible that train has not left its first station
                        console.log("arrivalstationevent");
                        console.log(stationEvent);
                        let dateNowJSON = new Date().toJSON();
                        let dateArrivalScheduleJSON = stationEvent.scheduledTime;
                        let dateArrivalEstimateJSON = stationEvent.liveEstimateTime;
                        let differenceInMinutes = stationEvent.differenceInMinutes;
                        let dateArrivalEstimate = new Date(dateArrivalEstimateJSON);
                        let dateArrivalSchedule = new Date(dateArrivalScheduleJSON);
                        console.log(+ new Date(dateNowJSON));
                        console.log(+ new Date());
                        let conclusion = "Arvion mukaan juna saapuu ";
                        conclusion += " raiteelle " + stationEvent.commercialTrack + " ";
                        if (dateArrivalEstimate != "Invalid Date") {
                            conclusion += toDoubleDigit(dateArrivalEstimate.getHours()) + ":" + toDoubleDigit(dateArrivalEstimate.getMinutes());
                        } else {
                            conclusion += toDoubleDigit(dateArrivalSchedule.getHours()) + ":" + toDoubleDigit(dateArrivalSchedule.getMinutes());
                        }
                        // train is late. if destination is many stations ahead, differenceinminutes is not updated
                        if (differenceInMinutes > 0) {
                            conclusion += " (" + differenceInMinutes + " minuuttia aikataulusta myöhässä) ";
                        } else {
                            // conclusion += "ajallaan";
                        }
                        console.log(conclusion);

                    } else if (stationEvent.stationShortCode == stationShortCode2 && stationEvent.actualTime != undefined) {
                        //train has already arrived at its target station
                        console.log("train has already arrived at target station");
                        return "train has already arrived";
                    }
                }
            });
        });
    });
}

function toDoubleDigit(n) {
    if (n < 10) return "0" + n;
    return n;
}

function cityToStationShortCode(city, callback) { 
    (function (callback) {
        request("https://rata.digitraffic.fi/api/v1/metadata/stations", function (err, resp, body) {
            if (err != null) {
                console.log(err);
                return;
            }
            let answerJSON = JSON.parse(body);
            let answerCity =  "Stations on city '" + city + "' not found";
            for (i in answerJSON) {
                let station = answerJSON[i];
                if (station.stationName.toLowerCase() == city.toLowerCase() ||
                    station.stationName.toLowerCase() == city.toLowerCase() + " asema") {
                    answerCity = station.stationShortCode;
                    break;
                }
            }
            callback(answerCity);
        });
    })(callback); 
}


function fetchTrainInfo(trainNumber, callback) {
    (function (callback) {
        request("https://rata.digitraffic.fi/api/v1/trains/latest/" + trainNumber, function (err, resp, body) {
            if (err != null) {
                console.log(err);
            }
            console.log("fetched train info");
            let answerJSON = JSON.parse(body)[0];
            callback(answerJSON);
        }); 
    })(callback);
}

function handleRequest(target) {
    console.log("sdfölkj");
    let answer;
    request(target, function (err, res, body) {
        console.log("parsed: ");
        console.log(JSON.parse(body)[0]);
    });
}
