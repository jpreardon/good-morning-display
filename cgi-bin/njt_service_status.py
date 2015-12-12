#!/usr/bin/env python

import json
import xmltodict as xml
import urllib
import cgi

params = cgi.FieldStorage()
url = "http://mybusnow.njtransit.com/bustime/eta/getStopPredictionsETA.jsp?route="
url = url + params["route"].value
url = url + "&stop="
url = url + params["stop"].value
url = url + "&key=0.5417057257145643"

# the xml file is available at http://www.mta.info/status/serviceStatus.txt
s = urllib.urlopen(url).read()
# we convert it to a dictionary
d = xml.xmltodict(s)
# output as JSON
output = "Content-Type: application/json\n\n"
output = output + json.dumps(d)
print output
