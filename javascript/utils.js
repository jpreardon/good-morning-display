"use strict"

/** 
 * Returns the response object when status is 200 (OK), otherwise, throws error
 * @param {Response} response - The response object from a fetch statement.
 */
function handleFetchErrors(response) {
    if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
    }
    return response;
};

/** 
 * Fills a given select element with options from the given array
 * @param {String} elementID - The select element to populate
 * @param {Array} idNameObject - An array of objects containing value and text
 * @param {String} valueLabel - The label that identifies the values
 * @param {String} textLabel - The label that identifies the text
 */
function populateSelectElement(elementID, idNameObject, valueLabel, textLabel) {
    idNameObject.forEach(item => {
        var optionElement = document.createElement("option");
        optionElement.value = item[valueLabel];
        optionElement.text = item[textLabel];
        document.getElementById(elementID).add(optionElement);
    });
};

/** 
 * Sorts an object (alphabetically) on the key
 * @param {Object} obj - Object to sort
 * @param {String} key - Key to sort on
 */
function sortObject(obj, key) {
    obj.sort(function (a, b) {
        var keyA = a[key].toUpperCase()
        var keyB = b[key].toUpperCase()
        if ( keyA < keyB ) {
            return -1
        }
        if ( keyA > keyB ) {
            return 1
        }
        return 0
    })
    return obj
}

/** 
 * Sorts a given select list in place, alphabetically. 
 * @param {Select Element} selectList - The select list to be sorted
 */
function sortSelectList(selectList) {
    var options = []

    for (let option of selectList.options) {
        options.push({text: option.text, selected: option.selected, optionObject: option})
    }
    
    sortObject(options, "text")

    for (var i = 0; i < selectList.length; i++) {
        selectList.options[i] = options[i].optionObject
        selectList.options[i].selected = options[i].selected
    }

}

/** 
 * Check if local storage is available 
 * @param {string} type - Can be localStorage or sessionStorage.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API} for source
 */
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type]
        var x = '__storage_test__';
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0)
    }
}