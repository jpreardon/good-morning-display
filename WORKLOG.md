# Worklog

## Summary

**Note: Version 2.0.3 will most likely be the last release of V2. V3 is in the works!**

This is version 2 of the Good Morning display. It targets a Raspberry Pi touch display--overkill for simple stuff, but one day, I might want to get more advanced. For example, it would be great if this thing turned itself on and off either based on time of day, or if anyone is standing in front of it, or both.

## Notes

### 2024-01-14

This project hasn't seen any work in almost 3 years. I also haven't really been using it. I looked at it a couple times over the last year or so, while the weather and Citibike information still worked, the MTA status was failing. Today I actually looked into why it wasn't working. Turns out, it was just that the developer API key expired. I created a new key, plugged it in, and it worked! Surprising!

Lately, I've been thinking about updating this project. More about that here: [Thoughts on the Good Morning Display](https://jpreardon.com/2024/01/14/thoughts-on-the-good-morning-display/).

I'm going to make a 2.0.3 release today. This will likely be the last one on the 2.0 line. Future work will be version 3. The release today is whatever has been committed since the last release since it has been running fine for quite some time now.

### 2021-05-29

MTA status updates have been failing for at least a week. It appears that the format of the alerts feed was changed slightly. The statusDetails was always populated with something originally, but now it only contains information when there is some sort of alert, otherwise it's null.

### 2021-03-07

Doing a little cleanup work today. Documenting the functions that aren't documented.

### 2021-03-06

I started looking at adding alerts last night. Here's the statuses I've seen:

- Weekday Service
- Weekend Service
- No Scheduled Service
- Planned Work
- Delays

The last two are the only ones I care about at this point. Rather than trying to display all of the information. I think I'll just go with a small icon next to the direction label (the alerts have a direction). I hope my guess that direction "0" is North and "1" is South (I couldn't find any documentation on this). I think this is good enough for yet another "MVP"! I'll commit this and keep an eye on it this week to see how it works.

Sort the subway select lists on the settings form.

### 2021-03-05

Took a look at the settings code. It looks pretty good. I think I can call that little refactoring "done" for now.

- Add a few semis to the utils.js. #28

I finally looked at how the express trains looked in the wild today. There are some problems. Time to simplify.... man...

- Deal with express trains on any line. Fixes #48.
- Be more slightly more informative when there are no trains. Fixes #46

### 2021-03-04

- Add load bike information into main form load function. I'm not really sure if this is an improvement or not. #28

### 2021-03-03

- Settings refactoring fun continues. #28
- Added re-sorting to the twin list picker. Moved a couple utility functions to utils.js.

### 2021-03-02

Combined a couple functions in the settings form code. #28

### 2021-03-01

Cleaned up a couple functions in the settings form code. #28

### 2021-02-28

Today, time allowing, I'd like to clean up the settings code. It's an absolute mess and pretty hard to understand at this point.

- Rearrange functions in main.js by common purpose. #28

This brings up an issue I should do some more research on. I put almost all of the subway related code into its own file. This makes the file more manageable, but it means I have to load up additional files in the HTML (which seems wrong). Node style require statements would really come in handy here, but I think the only way to get those is to use something like Browserify. Alternatively, I could start using a build process, which ultimately might be the way to go seeing as some linting would be nice too. Hey, I'll open an issue for this (#47)

### 2021-02-27

Integration continues! I'm not sure exactly how I want to do it. I have a crap design out there for the phone. maybe I'll go ahead and do that just to get everything running in one place, there's likely to be data problems there. Then move on to a better design.

- Merge all subway information with the main display. Relates to #24
- Handle missing subway config data. Fixes #24
- Fix update time display. Fixes #29
- Add express (diamond) icons for the 6 & 7 lines. Fixes #42
- Cache the protobuffer root object so we're not fetching the files for every request.

The Staten Island Railway isn't working. There's an open issue (#24) for it, but it's a bit beyond me right now. I commented Staten Island out on the settings page so it can't be selected for now. 

### 2021-02-26

MTA testing time is over. Time to really integrate this thing. Tonight, I got the "MVP" of the settings page working on my local. It really lives up to all of the promise of an MVP, it is really just "minimal", not really all that viable, and certainly not a product. The /testing.index page is using those settings instead of the hard coded settings now.

Next step will be to integrate the displays. That's probably a job for tomorrow.

### 2021-02-25

Not much time tonight. Cleaned up the function that creates the arrivals array. I also added a common error handling function for fetch errors. I put it in a separate utils.js file since it seemed like something that may be useful in many projects.

### 2021-02-24

Introduced a bug last night. Fixed it.

I really need to clean up the fetching of arrivals, it's a mess. I'll focus on that tonight. Unfortunately, it didn't seem to make refreshing any faster, in fact, it looks like it is about 9ms (avg) slower based on my very unscientific test. That's pretty close though. And the code is somewhat more readable. It could still use a bit of work though. 

I also DRYed up the way the HTML was being created for the arrivals.

### 2021-02-23

Noticed that the "ARRIVING" status seemed to linger for too long. Changed the logic a bit there. Now I'm not sure we'll see "ARRIVING" much at all. It's really not that useful for this application though. This display is really meant to be more than a few seconds walk from the platform anyway.

Also cleaned up the way last stops were being assigned. I was looping more than really needed.

### 2021-02-22

- Finish refactoring the MTA code (for now). 
- Use strict mode for main.js. Fixes #39

The MTA stuff is looking pretty good. There's still work to be done, especially with the settings (which I don't have right now). I think that will be one of the last steps because I'm still not 100% sure how I want to do it. So, I think I'll do a bit of design work first...

I'm thinking about creating a "micro" display first which incorporates some very limited weather, bikes, and trains. This is going to be a bit of a challenge. I also want to be able to show more than one train station. Since this is for me, I'm going to go for two. As for the question of how "micro" this should be, I'll target the iPhone 6/7/8 size (375x667).

- First draft of "micro" display with all data. Related to #24

### 2021-02-21

Read a bit of "You Don't Know Java Script" last night and this morning. Should have read this years ago.

- Use strict mode for MTA js. Relates to #39

### 2021-02-20

- Don't display trains that are on unscheduled tracks. Fixes #38

Today, I want to create and start using my own station information. I don't need everything in the csv file, and I'd like the values to be a little easier to use (no spaces).

- Create create-mta-station-json package. Fixes #36

Now that I have my very own stations.json file, time to use it!

- Use new stations.json file. Relates to #24

Started cleaning up the js code for the trains by moving it over to a separate js file, one that just deals with the fetching and data. I might have gone overboard on the functions though.

I also added direction labels, that's kind of cool, I think.

### 2021-02-19

Let's try to stop using the destination locations in favor of the last stop.

- Get destination from stop time update. Fixes #37

I was kind of bummed to "throw away" the work of cleaning up the destinations file. However, having that destination file got me to a running thing faster. However, my work in cleaning up that file made me more familiar with the data and led to a better solution. Plus, I made a pull request on it, maybe someone will get some benefit from it if it gets merged.

### 2021-02-18

Looked for undefined destinations at the end of the evening rush (plus its snowing--service changes) and got a few more undefined destinations. Showing the complete list here for completeness:

DEL | E | S | undefined | undefined  => Delancy (233)
PPK | FS | S | undefined | undefined => Prospect Park (42)
161 | D | N | undefined | undefined => 161 ST (219)
125 | D | N | undefined | undefined => 125th St (153)
MYR | M | N | undefined | undefined => Myrtle Ave (97)
137 | 1 | N | undefined | undefined => 137 St. City College (305)
DYK | 1 | S | undefined | undefined => Dyckman St. (299)
TSQ | 3 | S | undefined | undefined => Times Sq. (317)
MOT | 4 | S | undefined | undefined => ?
180 | 5 | S | undefined | undefined => E 180 St (426)
QBP | 7 | S | undefined | undefined => Queensboro Plaza (461)
BUR | 4 | N | undefined | undefined => Burnside Ave (384)
177 | 6 | N | ? | undefined
3AB | 6 | N | undefined | undefined => 3av 138 st (377)
WPT | 7 | N | undefined | undefined => Mets Willits Point (448)
111 | 7 | N | undefined | undefined => 111 St (449)
GHW | 5 | N | undefined | undefined => Gun Hill Road West? (421)
KGB => Kingsbridge Rd. (212)

Plus 1 correction: "BPK" Bedford Park Blvd => (211)

I updated destinationLocationToComplexIdMap.json in my fork of the MTA destinations project. I'll see if there are any more undefined stations in the morning and maybe on Saturday before submitting a pull request.

- Update the code for Kingsbridge Road, again. Fixes #35.
- Find station names in stations file rather than complexes. Fixes #34.
- Add latest destination location mappings.

I submitted a pull request for my changes, to the destination mapping, we'll see if they take it.

Now, after messing around with the data a bit, I might go in a different direction for the destination information. It looks like the stopTimeUpdate array is a pretty reliable source for the last stop (duh). If I use that, I don't have to keep a mapping file maintained. I think I'll work on a utility to convert the stations.csv to json and change my code to use the last stop as the destination rather than the destination location code.

### 2021-02-17

- Add KBG to destinationComplex.js for Kingsbridge Rd. headsign. Fixes #35

 I'm not super confident about the destination mappings. I'd like to simplify it somehow, so some research is in order...

 So... trips.txt can give me every possible (scheduled) destination (headsign) for each line. But, it doesn't give the three letter destination code :(

There's supposed to be historical data (http://web.mta.info/developers/MTA-Subway-Time-historical-data.html), but is says "no such bucket". [This page](http://web.mta.info/developers/data/archives.html) does have some old archives, however, I wonder if I'd just be better off starting with the destination complex data I have and looping through it. I started doing this yesterday, but I threw it all away (stupidly).

I'm forking mta-realtime-subway-departures so I can make a data cleaning app. The destinations there are right more often than not. But there are some holes in the data. This would be so much easier if someone from the MTA made this available. I asked on the groups. But in the meantime, I'll forge ahead.

Here are the stations unaccounted for in the mapping. I need to check in the morning since there are a couple others I know about that aren't on this list.

DEL | E | S | undefined | undefined  => Delancy
PPK | FS | S | undefined | undefined => Prospect Park
161 | D | N | undefined | undefined => 161 ST
125 | D | N | undefined | undefined => 125th St
MYR | M | N | undefined | undefined => Myrtle Ave
137 | 1 | N | undefined | undefined => 137 St. City College
DYK | 1 | S | undefined | undefined => Dyckman St.
TSQ | 3 | S | undefined | undefined => Times Sq.
MOT | 4 | S | undefined | undefined => ???
180 | 5 | S | undefined | undefined => E 180 St
QBP | 7 | S | undefined | undefined => Queensboro Plaza


### 2021-02-16

As expected, I saw a couple problems today, let's fix those up...

- Add function to catch undefined destination errors. Fixes #32
- Change mapping for "BPK" to Bedford Park Blvd. Fixes #33
- Add MTA line colors, to make it pretty. I promise, this is the last bit of styling I'll do for now.

### 2021-02-15

Today, I'd like to get at least some basic MTA information coming back. If only it was as easy at the bike information...

Honestly, the whole protobuf thing is over my head. I managed to cobble together something that kind of works in the browser by looking at these other files/projects:

- https://github.com/ericandrewlewis/mta-realtime-subway-departures (and the associated destination mapping files)
- https://gist.github.com/rolyatmax/360e74faf53c1875e4a1519d44f9c170
- https://github.com/ericandrewlewis/mta-realtime-subway-departures/blob/master/index.js

Also, much trial and error. But, I seem to be getting solid arrival times at a local stop. Woohoo!

The MTA Static Data is sometimes hard to find (for me anyway). Here are some links to CSVs.

- http://web.mta.info/developers/data/nyct/subway/StationComplexes.csv
- http://web.mta.info/developers/data/nyct/subway/Stations.csv
- http://web.mta.info/developers/developer-data-terms.html#data
- https://github.com/ericandrewlewis/mta-realtime-subway-departures/blob/master/destinationLocationToComplexIdMap.json (I couldn't find this anywhere in the MTA data, unless I tried to put it together from the tripupdates)

Now, lets try to clean it up a bit:

- [X] Deal with fetch errors
- [X] Limit to next several trains in either direction
- [X] Order the list properly
- [X] >0 minutes should be labeled as "arriving"
- [X] Get proper destinations from feed (or something) rather than hard coding
- [X] Minimalistic styling
- [X] Auto refresh!
- [X] Merge with master

Leaving the MTA stuff in the "testing" directory for now. I'll watch it for a few days before trying to put it on the main display page.

### 2021-02-14

Happy Valentine's Day!!! 💖

Continuing with yesterday's work. I looked at what it was going to take to incorporate the hacky js code I did to get the Citibike POC (more like a POS) up and running and decided it would be better to start that on a new day... Today is that day.

- [X] Refactor bike fetch and display code so it doesn't rely on the settings select boxes being on the same page
- [X] Move bike fetch and display code over to main.js
- [X] Add comments to all functions. Label constants with weather/bike prefixes. 
- [X] Rework settings page to include bike station settings
- [X] Add an option to replace forecast with bike info
- [X] Delete Cititest file and update README
- [X] Merge feature branch with master
- [X] Fix svg paths in production and padding in portrait mode

[Loris Bettazza](https://github.com/Pustur) sent a pull request to remove the jQuery dependencies. Awesome! Reviewed and merged.

Moving on to the subway, that's going to require some experimentation...

### 2021-02-13

Thoughts/goals: I've been watching the citibike test stuff for a week. It works well, so I think it's time to integrate it into the main page.

- [X] Add citibike styles to the main stylesheet
- [X] Work up a design that includes the citibike data
- [X] Preliminary work to add bike info

### 2021-02-10

Add a narrow layout.

### 2021-02-07

Everybody needs goals. Today, I wanted to get a standalone version of this page running.

- I'm tired of choosing my stations while testing, so first order of business is to save that locally.
- Create a page that shows a bunch of station data

In addition to these, I did some basic styling. I think it's working fine. Since it's snowing today, it is hard to tell if anything is updating, so I'll need ot monitor tomorrow.

Pretty much everything I did today needs to be refactored. Since it all needs to be integrated into the larger display with weather and such, I'm OK with that. A lot of that other code needs to get refactored as well.

### 2021-02-06

Continue experimenting with the citibike data. It's working pretty good, but I've put no thought into how this will integrate into the rest of the display.

### 2021-02-02

Experimenting with the Citibike data

### 2021-01-30

Keep track of last refresh time in order to wake up faster from device sleep mode.

### 2021-01-24

Add manifest.json for web app mode

### 2021-01-23

It's a cold day, and I'm thinking about doing something. Why not dust off the old dashboard project. As much as I'd like to start fresh (yet again), I'll resurrect what is here. Luckily, I found this branch I had been working on. It looks like I must have lost interest after I screwed up the wind direction arrow. I'll try to fix that first...

- Fix wind direction indicator
- Introduce a really basic responsive layout #18
- Add iPhone full screen code #18
- Change media query to orientation rather than width #18
- Add Apple Touch icon. Consolidate designs in one sketch file. Remove wind arrow sketch file. Fixes #18

Fix a few issues:

- Change wind speed conversion from meters per second to km per hour. Fixes #22
- Add credit for gear icon. Fixes #21 
- Add automatic reload from server. Fixes #15

### 2020-04-29

Ok, I've been goofing around with this on and off for a couple days now, time to get it wrapped up (for now) so I can move on to bigger and better things.

- Update design to include mobile phone screen sizes.

### 2020-04-24

- Finish adding settings icon fixes #20

That was way harder than it needed to be. I messed around with SVGs for a while before I gave up and went with a PNG. However, in the end, I don't think the image was causing my problem anyway. Bah

- Add pointer cursor to buttons
- Replace pixel based font sizing and margins with rems for paragraphs and form - #18

[This](https://css-tricks.com/scale-svg/) was helpful for further understanding of the viewBox attribute on SVGs.

- Set temperature and humidity circle sizes with rems (wind arrow is broken) - #18

### 2020-04-23

- Some settings icon stylings - #20

Getting to work on a smaller screen size. Reading through the rudiments on [Every Layout](https://every-layout.dev/) just drove home what I kind of knew already: I shouldn't have been using pixels for layout. Hey, I had to start somewhere. I'll start by changing the font sizing to rems.

### 2020-04-22

- Stop settings page from updating weather
- Show current settings on load
- Add some redirects around settings to make it less user hostile
- Fix if statement in updateWeather function so it doesn't fail on other servers
- Allow one to pick their station from a list
- A couple minor styling updates

### 2020-04-21

- Fix length of relative humidity arc. Add documentation to mapRelativeHumidity.
- Get form working in a slightly user hostile way - #9

I got the form working and I can set the needed location data with lat/long manually, or by fetching it from the browser. Side note, my browser provides location to an almost creepy level of accuracy.

To wrap this up, the settings form should:

- Show current setting on load
- Do validation and error checking
- Allow one to pick their station from a list
- Look nicer

### 2020-04-20

- Read through this: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API. 
- Added a function to ensure that local storage is available.
- Added a function to check that storage values are set in the browser
- Fix setUserLocation function to properly validate endpoints
- Use arrow functions consistently
- Update getCurrentConditions to reject promise on fail
- Update getForecast to reject promise on fail
- Simplified mapRelativeHumidity function. Fixes #10

### 2020-04-19

Continuing work on the settings page. I split the issues up so I can get the basics working first. So, what are the basics? I need to do the following:

- Ask user to enter station for current weather and grid coordinates for forecasts. (for now, they will need to know these two things)
- Store that information in local browser storage
- Use the stored information to construct the API urls
- Have decent validation and messaging around all of the above

This might turn into a multi-day project since I don't have a lot of time to devote to it.

- Make weather API URLs more dynamic - #9. I might have gone overboard with the functions here, but I sort of have a plan.
- Store user location parameters in localstorage, add some validation. Still needs work - #9.

### 2020-04-18

Having another look at the humidity indicator. [Issue 12](https://github.com/jpreardon/good-morning-display/issues/12) shows how the indicator can go off center. This is due to the current conditions being 2 lines. I think there are a couple things contributing to this. First, the SVG probably shouldn't be part of the "inner" div. Second, I'm applying styling to the SVG element when I think most of the styling should be applied to the circle element within the SVG. This should be fun...

- Put js and css in their own files (finally) and organize into subfolders.
- Clean up humidity svg code. Fixes #12.

As it turns out, a major part of my problem was that the bounding box for the temperature was a different size than I thought it was. I was shooting for 196px when, in reality, it was 190px. Duh. I also noticed that the wind indicator was a slightly different size. I changed it to 190px as well. One day, these should become relative anyway.

The NWS data seems a bit flaky. It frequently doesn't report wind direction or current conditions. It seemed a bit better on Friday than Thursday, so maybe this is a temporary problem. However, I'd like to make it a bit easier to swap out the API. I'm going to abstract the data to make that easier, it should also simplify the update code.

- Move current conditions get call to a promise
- Move forecast get call to a promise
- Remove moment.js reference fixes #14

I used promises here, I think that's right, they are working, but not 100% as expected. I tried adding a .catch, but it always runs, even when there are no errors. I think it's good enough for now, but I there might be issues down the road. Hopefully, I'll have more experience with creating promises by then. Progress not perfection, right? I consider issue #13 fixed.

- Add settings page

As it turns out, the promises weren't working the way I thought they were. I declared them as a constant, so they worked exactly once when the page loaded, but later calls to them did nothing. Making them functions fixes the problem, duh.

- Make update functions return promises
- Add padding to update time hours and minutes

### 2020-04-17

Doing some clean-up work on the wind indicator...

- Delete function degreesToCardinal(degrees) and hard code wind label
- Stop the flashing at 0º wind direction on page load/refresh and deal with nulls in wind direction gracefully
- Set max width and height on container

Working on the relative humidity indicator...

Going to try [svg](https://stackoverflow.com/questions/42234855/is-it-possible-to-draw-a-partial-circle-outline-in-css-open-ring-shape) first. This [explanation about animated svgs](https://css-tricks.com/svg-line-animation-works/) was also helpful.

This worked, but it seems a bit hacky the way I've implemented it. When I rotate the svg, I have to reposition it. I'm sure there's a way to do this by setting the proper origin or something. But, it seems to be working OK in Firefox. The other bit of hackyness is in the mapRelativeHumidity function. I'm pretty sure there is a purely mathematical way to do that, simply -or- a build in function. I'm going to open an issue for this one to do a bit more research.

Having said all that, I'm not sure that I'm wild about the whole relative humidity thing. It's not anywhere near as intuitive as the wind direction. I'll leave it for now.

### 2020-04-16

Let's try getting the wind direction indicator to work as designed. I really wanted to do this with CSS only (no images). While I'm sure this is possible, it was easier for me to get an image working. A problem with this is that it depends on the size of the element staying the same. Maybe I can get around this by using an SVG instead of a PNG. Anyway, the initial version is sort of working, but needs a bit of cleanup.

- Initial implementation of graphical wind indicator.

### 2020-04-15

Let's redo the layout in a way that allows for older browsers to actually render it (e.g. no css grid). This is really too bad since this was super easy with css grid. This probably isn't the right way to do this, but I'm going to lay this thing out at the original fixed size first (without grid), then work on making it proportional.

- Layout without css grid
- Make margins and padding of layout percentages

In the process of doing all this so I cold run this on an old iPad, I realized that it doesn't work at all on the iPad. It mush have something to do with jQuery. Bummer. I'm going to forget about the actual device for a bit and focus on getting it working the way I want on desktop--for now.

The two commits here essentially fix issue 7, although the responsive layout needs more work.

### 2020-04-13

I monitored this throughout the day, and it was a little disappointing that the forecast didn't work most of the day due to a 503 error. From time to time, null temperatures and wind speeds would come through as well. I'm going to do a couple quick fixes, but longer term, this weather API might not be the right one.

- Handle errors in the forecast data request fixes #2
- Handle nulls in current conditions data fixes #3
- Handle long current condition strings fixes #5
- Don't display -- for null wind direction

### 2020-04-12

Work on getting a basic page mocked up. We're targeting the 800x480 display on a Raspberry Pi touch for this project.

- Made a super simple HTML 5 index.html based on [HTML 5 boilerplate](https://github.com/h5bp/html5-boilerplate/blob/master/dist/index.html). I skipped much of what is there, I'll probably need to add it at some point. I'm putting all the styles in that file, for now. I'll break it out soon enough.
- I originally mocked this thing up with Helvetica, but I'm not paying for that web font, so I'm going with Roboto, it's close enough for this exercise.
- I'm using a grid layout, I hope the browser on the raspi can handle it
- Basic HTML mockup done
  - It doesn't include some of the cool wind/relative humidity features
  - I made some changes to the font sizes and weights to make things fit better in the viewport
- Setting up [Raspi in kiosk mode](https://pimylifeup.com/raspberry-pi-kiosk/), need a better browser.
  - This was a good setup guide, but it failed to tell me to install chromium (it probably expects a more recent raspi), so I installed it. It looks like Chromium doesn't support css grid :(
  - Installed Firefox. CSS grid works, but the page looks like crap on the raspitouch screen, and I've found that the touch screen no longer works :(
  - Given the low res and lack of touch interface, I might rethink my display strategy. I'm going to work on the data side of things for bit, then come back to this.
- Fix a couple issues in the style syntax
- Get basic weather conditions and forecast hooked up
  - Hook up [NWS API](https://www.weather.gov/documentation/services-web-api) ([json spec](https://api.weather.gov/openapi.json))
  - My grid square and zone are 34,33 and NYZ075
  - [Current conditions](https://api.weather.gov/stations/KNYC/observations/latest)
  - [Forecast](https://api.weather.gov/gridpoints/OKX/34,33/forecast) and [hourly forecast](https://api.weather.gov/gridpoints/OKX/34,33/forecast/hourly) are available. I went with the detailed forecast 
  - Add update time, remove placeholder data, fix grid height issue, change knots to MPH.
  - Add moment.js for date/time formatting. Fixes #1.

### 2020-04-11

- Create new branch
- Delete everything except the readme
- Update the readme
- Add the design file
- Add PDF of design ideas
- Experimented with the [National Weather Service API](https://www.weather.gov/documentation/services-web-api) a bit. I put the details in the TODO above.

For context:

This hasn't been working for quite some time. Here's a note from a now deleted branch that was meant to fix the issue:

> 2019-03-16

> The Weather Channel, which now owns Weather Underground now, have shut down the API that was being used here. I'm going to try using the [National Weather Service API](https://www.weather.gov/documentation/services-web-api) instead.

The transit status no longer works either. I think they changed the format and URL a few weeks ago. 

I'm going to ditch the whole thing and start fresh...

By the way, I'm not sure if it is best practice to do this sort of thing in a branch, then merge and tag a new version. I'm going with the latter just to keep it in one place.
