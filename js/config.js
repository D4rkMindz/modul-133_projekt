/**
 * Config variable that is globally accessible
 *
 * This constant contains all for application important configurations
 *
 * @type {{key: {job: string, class: string, year: string, weekNumber: string, selectionComplete: string}}}
 */
const config = {
    key: {
        job: 'category.job',
        class: 'category.class',
        year: 'category.year',
        weekNumber: 'category.weeknumber',
        selectionComplete: 'selection.complete',
    },
    url: {
        jobs: 'https://sandbox.gibm.ch/berufe.php',
        classes: 'https://sandbox.gibm.ch/klassen.php?beruf_id=',
        timetable: 'https://sandbox.gibm.ch/tafel.php',
    }
};