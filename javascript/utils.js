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