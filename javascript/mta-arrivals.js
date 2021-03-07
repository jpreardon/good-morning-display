"use strict"
const MTA_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F"
const MTA_ALERT_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-status.json"
var stations
var protoBuffRoot

function initMtaArrivals() {
    return fetch(STATION_JSON_PATH)
    .then(handleFetchErrors)
    .then(response => {
        return response.json()
    })
    .then(json => {
        // Cache the stations information, it gets used a lot
        stations = json
    })
    .then( () => {
        // Cache an instance of this protobuffer object so it's not loaded for every request
        return new Promise ( (resolve, reject) => {
            protobuf.load(protoBufDef, (error, root) => {
                protoBuffRoot = root.lookupType('transit_realtime.FeedMessage')
                if (error) reject(error)
                resolve()
            })  
        }) 
    })
}

/**
 * Returns alerts as an object with north and south directions for all lines at a given stop
 * @param {*} gtfsStopId - GTFS Stop ID of the station in question
 */
function getAlerts(gtfsStopId) {
    var lines = getLinesForGtfsStopId(gtfsStopId)

    return fetch(MTA_ALERT_FEED_URL, { headers: { 'x-api-key': MTA_API_KEY } })
    .then(handleFetchErrors)
    .then(response => {
        return response.json()
    })
    .then(json => {
        var routeDetails = json.routeDetails
        var serviceAlerts = new Object()

        serviceAlerts.north = {summaries:[]}
        serviceAlerts.south = {summaries:[]}

        lines.forEach(line => {
            var routeStatusDetails = routeDetails.find(detail => detail.route == line).statusDetails
            routeStatusDetails.forEach(statusDetail => {
                if (statusDetail.statusSummary == "Planned Work" || statusDetail.statusSummary == "Delays") {
                    if (statusDetail.direction == 0) {
                        if (!serviceAlerts["north"].summaries.includes(statusDetail.statusSummary)) {
                            serviceAlerts.north.summaries.push(statusDetail.statusSummary)
                        }
                    } else if (statusDetail.direction == 1) {
                        if (!serviceAlerts["south"].summaries.includes(statusDetail.statusSummary)) {
                            serviceAlerts.south.summaries.push(statusDetail.statusSummary)
                        }
                    }
                } 
            })
            
        })
        return serviceAlerts
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

function decodeProtoBuf(feedMsg) {
    const buffer = new Uint8Array(feedMsg)
    return protoBuffRoot.decode(buffer)
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
            return getAlerts(gtfsStopId)
        })
        .then(alerts => {
            // Arrival times will be all jumbled if there are multiple feeds, sort it out here
            allArrivals.sort((a, b) => {
                return Number(a.seconds) - Number(b.seconds)
            })
    
            var arrivalsFormatted = new Object()
            arrivalsFormatted.north = {label:getDirectionLabel(gtfsStopId, "N"), trains:[], alerts:alerts.north.summaries}
            arrivalsFormatted.south = {label:getDirectionLabel(gtfsStopId, "S"), trains:[], alerts:alerts.south.summaries}
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
    sortSelectList(selectElement)
}

function populateStationsForBoroughLine(borough, line) {
    var selectElement = document.getElementById("subway-stations")
    selectElement.innerHTML = ""
    stations.forEach(station => {
        if (station.borough == borough && station.daytime_routes.includes(line)) {
            selectElement.innerHTML += `<option value="${station.gtfs_stop_id}">${station.stop_name}</option>`
        }
    })
    sortSelectList(selectElement)
}