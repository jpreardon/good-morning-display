import jquery from 'jquery'

let utils = {
  // Universal data fetcher, not sure if this is really doing much here,
  // it could just as well be in the individual functions that call it.
  // TODO: Make this something other than jquery
  // TODO: What happens when there's an error???
  fetchData(url, callback) {
    jquery.ajax({
      type: 'GET',
      url: url,
      success: callback
    })
  },

  // Checks local storage to see if key exists and has data
  // Pass true to the optional isArray argument if the key is an array,
  // otherwise, it might return false even if the array is empty.
  localStorageIsSet(key, isArray) {
    // If it's an array, parse and check length
    if(isArray) {
      if(localStorage.getItem(key) === null || JSON.parse(localStorage.getItem(key)).length === 0) {
        return false
      } else {
        return true
      }
    }

    if (localStorage.getItem(key) === null || localStorage.getItem(key).trim() === '') {
      return false
    } else {
      return true
    }
  }

}

export default utils;
