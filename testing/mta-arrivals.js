const STATION_JSON_PATH = "./stations.json"
const MTA_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F"
const ProtoBuf = protobuf
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
    station = stations.find(me => me.gtfs_stop_id == gtfsStopId)
    return `${station.stop_name} - ${station.daytime_routes.join(", ")}`   
}

function getLinesForGtfsStopId(gtfsStopId) {
    return stations.find(station => station.gtfs_stop_id == gtfsStopId).daytime_routes
}

function getFeedForLine(line) {
    feedUrl = MTA_FEED_URL 

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
    feeds = []
    getLinesForGtfsStopId(gtfsStopId).forEach(line => {
        // We only need each feed once
        if (!feeds.includes(getFeedForLine(line))) {
            feeds.push(getFeedForLine(line))
        }
    })  
    return feeds
}