const request = require("request");
const path = require("path");
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.render('index', { title: 'Hey', message: 'Hello there!', departure: "Lähtöpaikka", arrival: "Määränpää", trainNumber: "Junan numero", fetchStuff: "Hae tiedot" })
})
app.use("/static", express.static(path.join(__dirname, "pub")));
app.set("view engine", "pug");

http.listen(3000, () => console.log('Example app listening on port 3000!')) 
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on("message", function (data) {
        console.log(data);
    });
    socket.on("fetch", function (data) {
        console.log(data); 
        fetchStationEvents(data, (answer) => {
            socket.emit("answer", answer); 
        });
    });
});

// fetchStationEvents({
    // city1: "helsinki",
    // city2: "oulu",
    // trainNumber: 27 
// }, (answer) => console.log(answer));
function fetchStationEvents(params, callback) {



    // following parameters are acquired from the ticket 
    // let params = {
        // city1: "tampere",
        // city2: "oulu",
        // trainNumber: 23 
    // };
    
    let answer = {};
    cityToStationShortCode(params.city1, function (stationShortCode1) {
        cityToStationShortCode(params.city2, function (stationShortCode2) {
            fetchTrainInfo(params.trainNumber, function (trainInfo) {
                if (stationShortCode1.includes("not found") || stationShortCode2.includes("not found") || trainInfo == undefined) {
                    answer.err = true;
                } else {
                    for (i in trainInfo.timeTableRows) {
                        let stationEvent = trainInfo.timeTableRows[i];
                        if (stationEvent.type == "ARRIVAL" && stationEvent.stationShortCode == stationShortCode1) {
                            // stationevent of train's arrival to trips departure station
                            answer.arrivalToDeparture = stationEvent;
                        }
                        if (stationEvent.type == "DEPARTURE" && stationEvent.stationShortCode == stationShortCode1) {
                            // stationevent of train's departure station
                            answer.departure = stationEvent;
                        }
                        if (stationEvent.type == "ARRIVAL" && stationEvent.stationShortCode == stationShortCode2) {
                            // stationevent of train's arrival station
                            answer.arrival = stationEvent;
                        } 
                    }
                }
                callback(answer);
            });
        });
    });
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
