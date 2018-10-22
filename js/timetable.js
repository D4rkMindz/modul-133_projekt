/**
 * Class TimeTable
 *
 * The class to handle the time table of a class
 */
class TimeTable {
    /**
     * TimeTable class constructor
     */
    constructor() {
        this.http = new Http();
        this.utils = new Utils();
    }

    /**
     * Clear the timetable
     *
     * @param target
     */
    clearTimeTable(target) {
        target.empty();
    }

    /**
     * Select the next week
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     */
    nextWeek(target, classId) {
        let calendarWeek = this._getCurrentWeek() + 1;

        this.loadTimeTable(target, classId, 'rtl', calendarWeek);
    }

    /**
     * Select the previous week
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     */
    previousWeek(target, classId) {
        let calendarWeek = this._getCurrentWeek() - 1;

        this.loadTimeTable(target, classId, 'ltr', calendarWeek);
    }

    /**
     * Select the next quartal
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     */
    nextQuartal(target, classId) {
        // Get the current selected week
        let calendarWeek = this._getCurrentWeek();

        // Calculate current quartal
        let quartal = Math.round(calendarWeek / (52 / 4));

        // Get the current year and parse it to an integer
        let year = localStorage.getItem(config.key.year) || new Date().getFullYear();
        year = parseInt(year);

        // Increase the quartal
        quartal += 1;

        // Check if the quartal is more than 4 (impossible)
        if (quartal > 4) {
            // Reduce the quartal count and adjust year
            quartal = 1;
            year++;
        }

        // Calculate the week of the year
        const quartalWeek = (quartal * (52 / 4));

        // Load the timetable
        this.loadTimeTable(target, classId, 'rtl', quartalWeek, year);
    }

    /**
     * Select the next quartal
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     */
    previousQuartal(target, classId) {
        // Get the current selected week
        let calendarWeek = this._getCurrentWeek();

        //Calculate current quartal
        let quartal = Math.round(calendarWeek / (52 / 4));

        // Get the current year and parse it to an integer
        let year = localStorage.getItem(config.key.year) || new Date().getFullYear();
        year = parseInt(year);

        // Reduce the quartal
        quartal -= 1;

        // Check if the quartal is less than 1 (impossible
        if (quartal < 1) {
            // Increase the quartal count and adjust year
            quartal = 4;
            year--;
        }

        // Calculate the week of the year
        const quartalWeek = (quartal * (52 / 4));

        // Load the timetable
        this.loadTimeTable(target, classId, 'ltr', quartalWeek, year);
    }

    /**
     * Load the timetable
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     * @param animationDirection Indicates if eitehr the table should be animated from left to right (ltr) or right to left (rtl)
     * @param calendarWeek The week of the year
     * @param year The year
     * @returns {Promise<void>}
     */
    async loadTimeTable(target, classId, animationDirection, calendarWeek, year) {
        // Reset the tme table
        this.clearTimeTable(target);

        // Create a new date (now)
        const date = new Date();

        // Either use the given calendar week, if this is empty, the localStorage wil be scanned and if this is also
        // empty, the current week will be used.
        calendarWeek = calendarWeek || localStorage.getItem(config.key.weekNumber) || date.getWeekNumber();

        // Either use the given year, if this is empty, the localStorage wil be scanned and if this is also empty,
        // the current year will be used.
        year = year || localStorage.getItem(config.key.year) || date.getFullYear();

        // Format the time for the API
        const week = `${calendarWeek.toString()}-${year.toString()}`;

        // Save the dates for later use
        localStorage.setItem(config.key.weekNumber, calendarWeek);
        localStorage.setItem(config.key.year, year);

        // Format the URL and load the data
        const url = `${config.url.timetable}?klasse_id=${classId}&woche=${week}`;
        const response = await this.http.get(url);

        // Format the events to render them properly
        const events = this._sortEvents(response);
        this._render(target, classId, events, animationDirection, calendarWeek, year);
    }

    /**
     * Sort the events
     *
     * @param events
     * @private
     */
    _sortEvents(events) {
        // Sort by date
        events.sort((a, b) => {
            if (a.tafel_datum < b.tafel_datum) {
                return -1;
            }
            if (a.tafel_datum > b.tafel_datum) {
                return 1;
            }
            if (a.tafel_von < b.tafel_von) {
                return -1;
            }
            if (a.tafel_von > b.tafel_von) {
                return 1;
            }
            // This code should, if the data is correct, never be reached
            return 0;
        });

        const dates = {};

        // Format the events
        for (let i = 0; i < events.length; i++) {
            const current = events[i];
            if (!dates[current.tafel_datum]) {
                dates[current.tafel_datum] = [];
            }

            const start = current.tafel_datum + ' ' + current.tafel_von;
            const end = current.tafel_datum + ' ' + current.tafel_bis;
            dates[current.tafel_datum].push({
                start: moment(start, 'Y-MM-DD HH:mm:ss'),
                end: moment(end, 'Y-MM-DD HH:mm:ss'),
                lesson: current.tafel_longfach,
                teacher: current.tafel_lehrer,
                room: current.tafel_raum,
                comment: current.tafel_kommentar,
            });
        }
        return dates;
    }

    /**
     * Get the current selected week of the year
     *
     * @returns {number} Currently selected week of the year
     * @private
     */
    _getCurrentWeek() {
        // Load the previous selection from the local storage
        let calendarWeek = parseInt(localStorage.getItem(config.key.weekNumber));

        // Check if the calendar week was previously selected
        if (!calendarWeek) {
            // Set default calendar week (now)
            calendarWeek = new Date().getWeekNumber();
        }

        // Adjust the calendar week if it is over 52 (impossible)
        if (calendarWeek > 52) {
            calendarWeek -= 52;
        }

        return calendarWeek;
    }

    /**
     * Render all events into the time table
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     * @param events The class events (Stunden) of the selected date
     * @param direction The animation direction (ltr or rtl)
     * @param weeknumber The number of the week in the year
     * @param year The selected year
     * @private
     * @see TimeTable::loadTimeTable
     */
    _render(target, classId, events, direction, weeknumber, year) {
        // Render the navigation to switch the weeks
        this._renderNavigation(target, classId);

        // Append the week number title
        target.append(`<div class="row justify-content-center"><h2>Week ${weeknumber.toString()} - ${year.toString()}</h2></div>`);

        // Check if the events are empty (vacation/not available)
        if (this.utils.empty(events)) {
            // Render a "error" message
            let vacationHTML = `
            <div class="row justify-content-center slide-in">
                <h3>Teachers right now:</h3>
                <img src="https://media.giphy.com/media/NbX7puR9dgS2Y/giphy.gif" style="width: 100%;">
                <p>Or the data just isnt available... Thanks GIBM</p>
            </div>`;
            target.append(vacationHTML);
            return;
        }

        // Iterate through all event arrays (days)
        Object.keys(events).forEach((date, i, array) => {
            let rows = '';

            // Append all events of the day as row to the table
            events[date].forEach((event) => {
                rows += `
                <tr>
                    <td>${event.start.format('hh:mm')} - ${event.end.format('hh:mm')}</td>
                    <td>${event.lesson}</td>
                    <td>${event.teacher}</td>
                    <td>${event.room}</td>
                </tr>`;
            });

            // Set the current day header and render the table rows into the table
            const currentMoment = moment(date, 'Y-MM-DD');
            const template = `
            <div class="row justify-content-center slide-in">
                <h3>${currentMoment.format('MMMM Do')}</h3>
                <!-- see https://github.com/twbs/bootstrap/issues/24638#issuecomment-341211051 -->
                <div class="table-responsive">
                    <table class="table">
                        <thead class="table-primary">
                            <tr>
                                <th>Zeit</th>
                                <th>Fach</th>
                                <th>Lehrer</th>
                                <th>Raum</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>`;
            target.append(template);

            // Check if last element was reached
            if (i >= array.length - 1) {
                // Set animation direction
                let translateX = ['100%', '0%'];
                if (direction === 'ltr') {
                    translateX = ['-100%', '0%'];
                }
                // Animate the time table
                anime({
                    targets: '.slide-in',
                    translateX: translateX,
                    duration: 2000,
                    delay: function (el, i) {
                        return i * 100;
                    }
                });
            }
        });
    }

    /**
     * Render the table navigation
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     * @private
     */
    _renderNavigation(target, classId) {
        const navigation = `
        <nav class="row justify-content-center">
            <ul class="pagination">
                <li class="page-item" data-id="previous-quartal">
                    <a class="page-link" data-id="previous-quartal">
                        <span class="d-none d-sm-none d-md-block">Previous quartal</span>
                        <span class="d-sm-block d-md-none">
                           <i class="fas fa-angle-double-left"></i>
                        </span>
                    </a>
                </li>
                <li class="page-item" data-id="previous-week">
                    <a class="page-link" data-id="previous-week">
                        <span class="d-none d-sm-none d-md-block">Previous week</span>
                        <span class="d-sm-block d-md-none">
                           <i class="fas fa-angle-left"></i>
                        </span>
                    </a>
                </li>
                <li class="page-item" data-id="now">
                    <a class="page-link" data-id="now">Today</a>
                </li>
                <li class="page-item" data-id="next-week">
                    <a class="page-link" data-id="next-week">
                        <span class="d-none d-sm-none d-md-block">Next week</span>
                        <span class="d-sm-block d-md-none">
                           <i class="fas fa-angle-right"></i>
                        </span>
                    </a>
                </li>
                <li class="page-item" data-id="next-quartal">
                    <a class="page-link" data-id="next-quartal">
                        <span class="d-none d-sm-none d-md-block">Next quartal</span>
                        <span class="d-sm-block d-md-none">
                           <i class="fas fa-angle-double-right"></i>
                        </span>
                    </a>
                </li>
            </ul>
        </nav>
        `;
        target.append(navigation);
        this._registerNavigationHandlers(target, classId);
    }

    /**
     * Register the handlers for the navigation
     *
     * @param target Where the table should be rendered
     * @param classId Which class timetable should be displayed
     * @private
     */
    _registerNavigationHandlers(target, classId) {
        // On previous quartal click handler
        $('[data-id=previous-quartal]').on('click', (event) => {
            event.preventDefault();

            // Clear the current time table
            this.clearTimeTable(target);

            // Load the previous quartal
            this.previousQuartal(target, classId);
        });

        // On previous week click handler
        $('[data-id=previous-week]').on('click', (event) => {
            event.preventDefault();

            // Clear the current time table
            this.clearTimeTable(target);

            // Load the previous week
            this.previousWeek(target, classId);
        });

        // On today click handler
        $('[data-id=now]').on('click', (event) => {
            event.preventDefault();

            // Clear the current time table
            this.clearTimeTable(target);

            // Determine the animation direction
            let animationDirection = 'rtl';
            const week = parseInt(localStorage.getItem(config.key.weekNumber));
            const year = parseInt(localStorage.getItem(config.key.year));
            const date = new Date();
            if (year >= date.getFullYear() && week > date.getWeekNumber()) {
                animationDirection = 'ltr';
            }

            // Load the time table
            this.loadTimeTable(target, classId, animationDirection, date.getWeekNumber(), date.getFullYear());
        });

        // On next week click handler
        $('[data-id=next-week]').on('click', (event) => {
            event.preventDefault();

            // Clear the current time table
            this.clearTimeTable(target);

            // Load the next week
            this.nextWeek(target, classId);
        });

        // On next quartal click handler
        $('[data-id=next-quartal]').on('click', (event) => {
            event.preventDefault();

            // Clear the current time table
            this.clearTimeTable(target);

            // Load the next quartal
            this.nextQuartal(target, classId);
        });
    }
}