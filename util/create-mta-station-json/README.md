# Create MTA Stations JSON

This is a simple package that converts the MTA's [stations.csv](http://web.mta.info/developers/data/nyct/subway/Stations.csv) to a json file. Note that the json only contains the fields needed for the [GMD](https://github.com/jpreardon/good-morning-display) project, it also renames the keys so there are no spaces (personal preference).

The fields that project uses probably don't change that much unless a new subway station is added, or an existing one is renamed. However, if a new file is needed, here's what needs to happen.

Clone this repo, then run the following commands from the same directory as this README (should be create-mta-station-json):

```
npm install

npm run create-stations
```

Then, copy the stations.json file over to the /javascript directory so the application picks it up.