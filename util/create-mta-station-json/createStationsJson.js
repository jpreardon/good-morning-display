const fetch = require('node-fetch')
const parse = require('csv-parse')
const fs = require('fs')

// Where to get it, where to save it...
const STATION_FILE_URL = "http://web.mta.info/developers/data/nyct/subway/Stations.csv"
const LOCAL_FILE_NAME = "stations.json"
// There are many columns in the csv file, but we are only using a handful of them. Add more as needed.
const OUTPUT_COLUMNS = [ "gtfs_stop_id",
                        "stop_name",
                        "borough",
                        "daytime_routes",
                        "north_direction_label",
                        "south_direction_label"]

const createStationsFile = () => fetch(STATION_FILE_URL)
    .then(response => response.text())
    .then(text => new Promise( (resolve, reject) => {
        parse(text, { columns: header => header.map(column => column.toLowerCase().replace(/\s/gi, "_")) }, (error, stations) => {
            stations.forEach(station => {
                station['daytime_routes'] = station['daytime_routes'].split(' ')
            })
            resolve(stations)
        })
    }))

createStationsFile()
    .then((stations) => {
        fs.writeFile(LOCAL_FILE_NAME, JSON.stringify(stations, OUTPUT_COLUMNS, 2  ), (error) => {
            if (error) {
                throw error
            }
            console.log(`Station info written to ${LOCAL_FILE_NAME}`)
        })
    })