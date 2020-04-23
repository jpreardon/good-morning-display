# Worklog

## Summary

For this version 2 of the Good Morning display, I'm currently targeting a Raspberry Pi touch display. It's overkill for simple stuff, but one day, I might want to get more advanced. It would be great if this thing turned itself on and off either based on time of day, or if anyone is standing in front of it, or both.

## Notes

### 2020-04-23

- Some settings icon stylings - #20

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