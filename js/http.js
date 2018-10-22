/**
 * Class Http
 *
 * Collection of methods to execute HTTP Requests
 */
class Http {
    /**
     * HTTP GET data from an URL
     *
     * Load some data form the Internet and cache it. If the URL will be called a second time, the data will be fetched
     * from the localStorage.
     *
     * @param {string}  url The URL where the data should be fetched from
     * @param {boolean} forceReload Indicates whether the data should be loaded either from the cache (if possible)
     *                  or over the Internet
     * @returns {Promise<Object>} The response data
     */
    get(url, forceReload) {
        forceReload = forceReload || false;
        return new Promise((resolve, reject) => {
            const response = localStorage.getItem(url);
            if (response && !forceReload) {
                resolve(JSON.parse(response));
            }
            $.ajax({
                method: 'GET',
                cache: false,
                processData: true,
                url: url,
            }).done((response) => {
                // localStorage.setItem(url, JSON.stringify(response));
                resolve(response);
            }).fail((err) => {
                this._setError(err);
            });
        });
    }

    /**
     * Handle HTTP Error
     *
     * This method displayes a Error Message to the user and immediatly stops every script afterwards.
     *
     * @param {Object} err The error from the HTTP Request (or just something else)
     * @private
     */
    _setError(err) {
        const styles = 'body,html {height: 100%;display: grid;} span {margin: auto;}';
        const style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = styles;
        } else {
            style.appendChild(document.createTextNode(styles));
        }
        document.getElementsByTagName('head')[0].appendChild(style);
        localStorage.clear();
        $('body').html('<span>ERROR FETCHING DATA. Please <a href="" onclick="window.reload()">reload</a> the page. If the error persists, please <a href="mailto:bjoern.pfosterl@gibmit.ch?subject=Modul%20133%20AJAX%20ERROR">contact the developer</a></span>');
        throw new Error(JSON.stringify(err));
    }
}