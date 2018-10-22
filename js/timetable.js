class TimeTable {
    constructor() {
        this.http = new Http();
        this.utils = new Utils();
    }

    clearTimeTable(target) {
        target.empty();
    }

    nextWeek(target, classId) {
        let calendarWeek = this._getCurrentWeek() + 1;

        this.loadTimeTable(target, classId, 'rtl', calendarWeek);
    }

    previousWeek(target, classId) {
        let calendarWeek = this._getCurrentWeek() - 1;

        this.loadTimeTable(target, classId, 'ltr', calendarWeek);
    }

    nextQuartal(target, classId) {
        let calendarWeek = this._getCurrentWeek();
        let quartal = Math.round(calendarWeek / (52 / 4));
        let year = localStorage.getItem(config.key.year) || new Date().getFullYear();
        year = parseInt(year);

        quartal += 1;
        if (quartal > 4) {
            quartal -= 4;
            year++;
        }
        const quartalWeek = (quartal * (52 / 4));

        this.loadTimeTable(target, classId, 'rtl', quartalWeek, year);
    }

    previousQuartal(target, classId) {
        let calendarWeek = this._getCurrentWeek();
        let quartal = Math.round(calendarWeek / (52 / 4));
        let year = localStorage.getItem(config.key.year) || new Date().getFullYear();
        year = parseInt(year);

        quartal -= 1;
        if (quartal < 1) {
            quartal = 4;
            year--;
        }
        const quartalWeek = (quartal * (52 / 4));

        this.loadTimeTable(target, classId, 'ltr', quartalWeek, year);
    }

    async loadTimeTable(target, classId, animationDirection, calendarWeek, year) {
        this.clearTimeTable(target);
        const date = new Date();
        calendarWeek = calendarWeek || localStorage.getItem(config.key.weekNumber) || date.getWeekNumber();
        year = year || localStorage.getItem(config.key.year) || date.getFullYear();
        const week = `${calendarWeek.toString()}-${year.toString()}`;

        localStorage.setItem(config.key.weekNumber, calendarWeek);
        localStorage.setItem(config.key.year, year);
        const url = `https://sandbox.gibm.ch/tafel.php?klasse_id=${classId}&woche=${week}`;
        const response = await this.http.get(url);
        const events = this._sortEvents(response);
        this._render(target, classId, events, animationDirection, calendarWeek, year);
    }

    _sortEvents(events) {
        // sort by date
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
            // this code should, if the data is correct, never be reached
            return 0;
        });

        const dates = {};

        // format
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

    _getCurrentWeek() {
        let calendarWeek = parseInt(localStorage.getItem(config.key.weekNumber));
        if (!calendarWeek) {
            calendarWeek = new Date().getWeekNumber();
        }

        if (calendarWeek > 52) {
            calendarWeek -= 52;
        }

        return calendarWeek;
    }

    _render(target, classId, events, direction, weeknumber, year) {
        this._renderNavigation(target, classId);
        target.append(`<div class="row justify-content-center"><h2>Week ${weeknumber.toString()} - ${year.toString()}</h2></div>`);
        if (this.utils.empty(events)) {
            let vacationHTML = `
            <div class="row justify-content-center slide-in">
                <h3>Teachers right now:</h3>
                <img src="https://media.giphy.com/media/NbX7puR9dgS2Y/giphy.gif" style="width: 100%;">
                <p>Or the data just isnt available... Thanks GIBM</p>
            </div>`;
            target.append(vacationHTML);
            return;
        }
        Object.keys(events).forEach((date, i, array) => {
            let rows = '';
            events[date].forEach((event) => {
                rows += `
                <tr>
                    <td>${event.start.format('hh:mm')} - ${event.end.format('hh:mm')}</td>
                    <td>${event.lesson}</td>
                    <td>${event.teacher}</td>
                    <td>${event.room}</td>
                </tr>`;
            });

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

            if (i >= array.length - 1) {
                let translateX = ['100%', '0%'];
                if (direction === 'ltr') {
                    translateX = ['-100%', '0%'];
                }
                anime({
                    targets: '.slide-in',
                    translateX: translateX,
                    duration: 2000,
                    delay: function (el, i, l) {
                        return i * 100;
                    }
                });
            }
        });
    }

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

    _registerNavigationHandlers(target, classId) {
        $('[data-id=previous-quartal]').on('click', (event) => {
            event.preventDefault();
            this.clearTimeTable(target);
            this.previousQuartal(target, classId);
        });
        $('[data-id=previous-week]').on('click', (event) => {
            event.preventDefault();
            this.clearTimeTable(target);
            this.previousWeek(target, classId);
        });
        $('[data-id=now]').on('click', (event) => {
            event.preventDefault();
            this.clearTimeTable(target);
            const date = new Date();
            let animationDirection = 'rtl';
            const week = parseInt(localStorage.getItem(config.key.weekNumber));
            const year = parseInt(localStorage.getItem(config.key.year));
            if (year >= date.getFullYear() && week > date.getWeekNumber()) {
                animationDirection = 'ltr';
            }
            this.loadTimeTable(target, classId, animationDirection, date.getWeekNumber(), date.getFullYear());
        });
        $('[data-id=next-week]').on('click', (event) => {
            event.preventDefault();
            this.clearTimeTable(target);
            this.nextWeek(target, classId);
        });
        $('[data-id=next-quartal]').on('click', (event) => {
            event.preventDefault();
            this.clearTimeTable(target);
            this.nextQuartal(target, classId);
        });

    }
}