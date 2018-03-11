# Good Morning Display

This is simple display that shows weather and NYC transit information. It was created mostly as a proof of concept with a potential user base of one (me), and is very much a work in progress. **Proceed at your own risk**.

Read more here: [Good Morning Display](https://jpreardon.com/projects/good-morning-display/).

*Update 2016-01-01: Originally, this was built with Foundation and some jQuery. This configuration worked fine for years. More recently, I wanted to learn more about React, so I chose to rebuild this project with React. In the process of doing that, I got rid of Foundation, and with it went the responsive design. Right now, it is targeted for small screen. I plan to build on this in the future. Stay tuned...*

![Good Morning Display Screenshot](img/screenshot.png)

## Instructions

1. Get a [Weather Underground API key](http://www.wunderground.com/weather/api/).

2. If you just want to use this, put **index.html** and the contents of the **build** directory on a server somewhere. If you want to modify it, download everything locally and run <code>npm install</code>, that should install all of the dependancies, then you can run <code>gulp</code>.

3. Hit the index file with a browser. You'll be prompted to enter your Weather Underground API Key, zip code and select which NYC subway lines you want to display. All of the preferences are stored in the browser.

Copyright (c) 2013-18 John P. Reardon Licensed under the MIT license.
