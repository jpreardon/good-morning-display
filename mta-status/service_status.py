#!/usr/bin/python

import json
import xmltodict as xml
import urllib

# the xml file is available at http://www.mta.info/status/serviceStatus.txt
s = urllib.urlopen("http://www.mta.info/status/serviceStatus.txt").read()
# we convert it to a dictionary
d = xml.xmltodict(s)
# output as JSON
#output = "HTTP/1.1 200 OK\n"
output = "Content-Type: application/json\n\n"
# output = output + json.dumps(nextTrains)
output = output + json.dumps(d['subway'][0]['line'])
print output