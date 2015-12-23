import jquery from 'jquery'

let utils = {
  // Universal data fetcher, not sure if this is really doing much here,
  // it could just as well be in the individual functions that call it.
  // TODO: Make this something other than jquery
  // TODO: What happens when there's an error???
  fetchData : function(url, callback) {
    jquery.ajax({
      type: 'GET',
      url: url,
      success: callback
    })
  }
}

export default utils;
