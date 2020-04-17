# Worklog

## Summary

For this version 2 of the Good Morning display, I'm currently targeting a Raspberry Pi touch display. It's overkill for simple stuff, but one day, I might want to get more advanced. It would be great if this thing turned itself on and off either based on time of day, or if anyone is standing in front of it, or both.

## TODO

- Get mockup running on raspi? (see 2020-04-12 notes), if not, what to do? Might need to make a more responsive interface.
- Mock up cool wind/relative humidity features in HTML
  - Stop the flashing at 0º wind direction on page load/refresh
  - Deal with nulls/no wind direction gracefully
  - Remove un-needed code (e.g. the degrees to cardinal function)
  - Start work on relative humidity

## Notes

### 2020-04-17

Doing some clean-up work on the wind indicator...

- Delete function degreesToCardinal(degrees) and hard code wind label

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