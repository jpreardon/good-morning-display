"use strict"
const STATION_JSON_PATH = "/testing/stations.json"
const MTA_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F"
const MTA_API_KEY = localStorage.getItem("subwayApiKey")
const protoBufDef = "nyct-subway.proto.txt"
var stations

function initMtaArrivals() {
    return fetch(STATION_JSON_PATH)
    .then(handleFetchErrors)
    .then(response => {
        return response.json()
    })
    .then(json => {
        stations = json
    })
}

function getDestinationName(gtfsStopId) {
    return stations.find(sta => sta.gtfs_stop_id == gtfsStopId).stop_name
}

function getStationName(gtfsStopId) {
    var station = stations.find(me => me.gtfs_stop_id == gtfsStopId)
    return `${station.stop_name} - ${station.daytime_routes.join(", ")}`   
}

function getDirectionLabel(gtfsStopId, Direction) {
    var station = stations.find(me => me.gtfs_stop_id == gtfsStopId)
    if (Direction == "N") {
        return station.north_direction_label
    } else {
        return station.south_direction_label
    }
}

function getLinesForGtfsStopId(gtfsStopId) {
    return stations.find(station => station.gtfs_stop_id == gtfsStopId).daytime_routes
}

function getFeedForLine(line) {
    var feedUrl = MTA_FEED_URL 

    if (line == "A" || line == "C" || line == "E") {
        return feedUrl + "gtfs-ace"
    } else if (line == "B" || line == "D" || line == "F" || line == "M") {
        return feedUrl + "gtfs-bdfm"
    } else if (line == "G") {
        return feedUrl + "gtfs-g"
    } else if (line == "J" || line == "Z") {
        return feedUrl + "gtfs-jz"
    } else if (line == "N" || line == "Q" || line == "R" || line == "W") {
        return feedUrl + "gtfs-nqrw"
    } else if (line == "L") {
        return feedUrl + "gtfs-l"
    } else if (line == "7") {
        return feedUrl + "gtfs-7"
    } else if (line == "SIR") {
        return feedUrl + "gtfs-si'"
    } else {
        return feedUrl + "gtfs"
    }
}

function getFeedUrlsForGtfsStopId(gtfsStopId) {
    var feeds = []
    getLinesForGtfsStopId(gtfsStopId).forEach(line => {
        // We only need each feed once
        if (!feeds.includes(getFeedForLine(line))) {
            feeds.push(getFeedForLine(line))
        }
    })  
    return feeds
}

// TODO: This function fetches two files every time it runs (often). Can those be preloaded?
function decodeProtoBuf(feedMsg) {
    return new Promise ( (resolve, reject) => {
        const ProtoBuf = protobuf
        ProtoBuf.load(protoBufDef, (error, root) => {
            const FeedMessage = root.lookupType('transit_realtime.FeedMessage')
            const buffer = new Uint8Array(feedMsg)
            if (error) reject(error)
            resolve(FeedMessage.decode(buffer))
        })
    })
}

function addFeedArrivalsToArray(decodedFeed, gtfsStopId, arrivalsArray) {
    for (const message of decodedFeed.entity) {
        // Only look at tripUpdates
        if (!message.tripUpdate) {
            continue
        }
        // Loop through the stopTimeUpdates
        for (const stopUpdate of message.tripUpdate.stopTimeUpdate) {
            //  Don't show stations we don't care about
            if (stopUpdate.stopId.substr(0, stopUpdate.stopId.length - 1) != gtfsStopId) {
                continue
            }
            // MTA removes trains that aren't on scheduled tracks from their countdown displays--we will too. 
            // See https://github.com/jpreardon/good-morning-display/issues/38 for detail
            // This doesn't seem to work very well for the 2/3/4/5 etc. at least on 2021-02-26, only one or two
            // trains showed up at a time. Commented it out. Check later, maybe something weird was going on.
          /*   if (stopUpdate[".nyctStopTimeUpdate"].scheduledTrack != stopUpdate[".nyctStopTimeUpdate"].actualTrack) {
                continue
            } */
            var arrivalTimeSeconds = (stopUpdate.arrival.time - (Date.now() / 1000))
            var direction = stopUpdate.stopId.substr(stopUpdate.stopId.length - 1)
            // Skip trains that are probably already in the station
            if (arrivalTimeSeconds < 0) {
                continue
            }
            var lastStop = message.tripUpdate.stopTimeUpdate[message.tripUpdate.stopTimeUpdate.length - 1]
            var lastStopId = lastStop.stopId.substr(0,lastStop.stopId.length - 1)
            arrivalsArray.push({"line":message.tripUpdate.trip.routeId, "destination":getDestinationName(lastStopId), "seconds":arrivalTimeSeconds, "direction":direction })
        }
    }
    return arrivalsArray
}

function getArrivalsForGtfsStopId(gtfsStopId) {
    var allArrivals = []
    var feedPromises = []

    getFeedUrlsForGtfsStopId(gtfsStopId).forEach(url => {
        feedPromises.push(
            fetch(url, { headers: { 'x-api-key': MTA_API_KEY } })
            .then(handleFetchErrors)
            .then(response => response.arrayBuffer())
            .then(response => {
                return decodeProtoBuf(response)
            })
            .then(decodedFeed => {
                return addFeedArrivalsToArray(decodedFeed, gtfsStopId, allArrivals)
            })
            .catch(error => {
                return error
            })
        )
    })
    
    return new Promise ( (resolve, reject) => {
        Promise.all(feedPromises)
        .then(() => {
                // Stop may be in more than one feed, we merge them together here
                allArrivals.sort((a, b) => {
                    return Number(a.seconds) - Number(b.seconds)
                })
        
                var arrivalsFormatted = new Object()
                arrivalsFormatted.north = {label:getDirectionLabel(gtfsStopId, "N"), trains:[]}
                arrivalsFormatted.south = {label:getDirectionLabel(gtfsStopId, "S"), trains:[]}
                allArrivals.forEach(arrival => {
                    if (arrival.direction == "N") {
                        arrivalsFormatted.north.trains.push(arrival)
                    } else {
                        arrivalsFormatted.south.trains.push(arrival)
                    }
                })
                
                // Only show 3 arrivals in each direction
                arrivalsFormatted.north.trains.splice(3)
                arrivalsFormatted.south.trains.splice(3)
                
                resolve(arrivalsFormatted)
        })
        .catch(error => {
            reject(error)
        })
    })
}

function populateLinesForBorough(borough) {
    var selectElement = document.getElementById("subway-lines")
    var lines = []
    stations.forEach(station => {
        if (station.borough == borough) {
            station.daytime_routes.forEach(route => {
                if (!lines.includes(route)) {
                    lines.push(route)
                }
            })
        }
    })
    selectElement.innerHTML = ""
    lines.forEach(line => {
        selectElement.innerHTML += `<option value="${line}">${line}</option>`
    })
    // Load up the stations too
    populateStationsForBoroughLine(borough, selectElement.value)
}

function populateStationsForBoroughLine(borough, line) {
    var selectElement = document.getElementById("subway-stations")
    selectElement.innerHTML = ""
    stations.forEach(station => {
        if (station.borough == borough && station.daytime_routes.includes(line)) {
            selectElement.innerHTML += `<option value="${station.gtfs_stop_id}">${station.stop_name}</option>`
        }
    })
}