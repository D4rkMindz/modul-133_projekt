/**
 * Class Utils
 *
 * A collection of helper methods
 */
class Utils {
    /**
     * Compare two objects like the spaceship operator (<=>)
     * @param a
     * @param b
     * @returns {number}
     */
    compare(a, b) {
        // Spaceship operator in JS
        return a < b ? -1 : a > b ? 1 : 0;
    }

    /**
     * Check if an object is empty
     * @param object
     * @returns {boolean}
     */
    empty(object) {
        for (var key in object) {
            if (object.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

/**
 * Get the week number of a year from a date
 *
 * @see https://stackoverflow.com/a/6117889/6805097
 * @returns {number}
 */
Date.prototype.getWeekNumber = function () {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};
