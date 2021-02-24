"use strict"
const STATION_JSON_PATH = "./stations.json"
const MTA_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F"
const protoBufDef = "nyct-subway.proto.txt"
var stations

function initMtaArrivals() {
    return fetch(STATION_JSON_PATH)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else {
            throw new Error(`${response.status} - ${response.statusText}`)
        }
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

function getArrivalsForGtfsStopId(gtfsStopId) {
    const ProtoBuf = protobuf
    return new Promise( (resolve, reject) => {
        ProtoBuf.load(protoBufDef, (error, root) => {
            // TODO: The next three variables are a hack to combine multiple lines, a promise might be better here
            var numFeeds = getFeedUrlsForGtfsStopId(gtfsStopId).length
            var iteration = 0
            var arrivals = []
            if (error) throw error
            const FeedMessage = root.lookupType('transit_realtime.FeedMessage')
            for (const feedUrl of getFeedUrlsForGtfsStopId(gtfsStopId)) {
                fetch(feedUrl, { headers: { 'x-api-key': API_KEY } })
                .then(res => {
                    if (res.ok) {
                        return res
                    } else {
                        throw new Error(res.status)
                    }
                })
                .then(res => res.arrayBuffer())
                .then(body => {
                    // TODO: This mess of nested for statements is a mess clean it up
                    const buf = new Uint8Array(body)
                    const feed = FeedMessage.decode(buf)
                    for (const message of feed.entity) {
                        // Only look at tripUpdates
                        if (message.tripUpdate) {
                            // Loop through the stopTimeUpdates and only show those for the station we care about
                            for (const stopUpdate of message.tripUpdate.stopTimeUpdate) {
                                if (stopUpdate.stopId.substr(0, stopUpdate.stopId.length - 1) == gtfsStopId) {
                                    // MTA says they remove trains that aren't on schedules tracks from their countdown displays, so we will too. 
                                    // See https://github.com/jpreardon/good-morning-display/issues/38 for detail
                                    if (stopUpdate[".nyctStopTimeUpdate"].scheduledTrack == stopUpdate[".nyctStopTimeUpdate"].actualTrack) {
                                        var arrivalTimeSeconds = (stopUpdate.arrival.time - (Date.now() / 1000))
                                        var direction = stopUpdate.stopId.substr(stopUpdate.stopId.length - 1)
                                        // Skip trains that are probably already in the station
                                        if (arrivalTimeSeconds >= 0) {
                                            var lastStop = message.tripUpdate.stopTimeUpdate[message.tripUpdate.stopTimeUpdate.length - 1]
                                            var lastStopId = lastStop.stopId.substr(0,lastStop.stopId.length - 1)

                                            arrivals.push({"line":message.tripUpdate.trip.routeId, "destination":getDestinationName(lastStopId), "seconds":arrivalTimeSeconds, "direction":direction })
                                        } 
                                    }
                                }
                            }
                        }
                    }
                    iteration++
                }).then(() => {
                    // Stations may be in more than one feed, here, we merge them together
                    if (iteration == numFeeds) {
                        // Sort array
                        arrivals.sort((a, b) => {
                            return Number(a.seconds) - Number(b.seconds)
                        })

                        // Make an object with the arrivals
                        var arrivalsFormatted = new Object()
                        arrivalsFormatted.north = {label:getDirectionLabel(gtfsStopId, "N"), trains:[]}
                        arrivalsFormatted.south = {label:getDirectionLabel(gtfsStopId, "S"), trains:[]}
                        arrivals.forEach(arrival => {
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
                    }
                })
            }
        })
    })
}