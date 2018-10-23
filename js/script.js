/**
 * This is the main script.
 */
$(() => {
    // create new selection and timetable object
    const selection = new Selection();
    const timetable = new TimeTable();

    // A helper method to build the form and register callbacks
    const buildForm = function () {
        selection.buildForm($('[data-id=inline-selection]'), false).then(() => {
            selection.onSelection(() => {
                const classId = localStorage.getItem(config.key.class);
                timetable.loadTimeTable($('[data-id=timetable]'), classId, 'rtl');
            });
            selection.onJobSelection(() => {
                timetable.clearTimeTable($('[data-id=timetable]'));
            })
        });
    };

    // Check if the selection was already completed
    const isSelectionComplete = localStorage.getItem(config.key.selectionComplete);
    if (isSelectionComplete === null || isSelectionComplete === '0') {
        // If the selection is unfinished, a modal will be created.
        // On the callback of the modal close even will be a callback to build the inline form registered.
        const modal = new Modal();
        modal.showModal(selection);
        modal.onModalClose(() => {
            // Build the inline form and create the timetable
            buildForm();
            const classId = localStorage.getItem(config.key.class);
            timetable.loadTimeTable($('[data-id=timetable]'), classId, 'rtl');
        });
    } else {
        // Build the inline form and create the timetable
        buildForm();
        const classId = localStorage.getItem(config.key.class);
        timetable.loadTimeTable($('[data-id=timetable]'), classId, 'rtl');
    }
});