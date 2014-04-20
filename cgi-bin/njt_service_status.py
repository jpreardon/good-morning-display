#!/usr/bin/python

import json
import xmltodict as xml
import urllib

# the xml file is available at http://www.mta.info/status/serviceStatus.txt
s = urllib.urlopen("http://mybusnow.njtransit.com/bustime/eta/getStopPredictionsETA.jsp?route=158&stop=11415&key=0.5417057257145643").read()
# we convert it to a dictionary
d = xml.xmltodict(s)
# output as JSON
output = "Content-Type: application/json\n\n"
output = output + json.dumps(d)
print output
