$(() => {
    const selection = new Selection();
    const timetable = new TimeTable();

    const buildForm = function () {
        selection.buildForm($('[data-id=inline-selection]'), false).then(() => {
            selection.onSelection((e) => {
                const classId = localStorage.getItem(config.key.class);
                timetable.loadTimeTable($('[data-id=timetable]'), classId, 'rtl');
            });
            selection.onJobSelection(() => {
                timetable.clearTimeTable($('[data-id=time-table]'));
            })
        });
    };

    const isSelectionComplete = localStorage.getItem(config.key.selectionComplete);
    if (isSelectionComplete === null || isSelectionComplete === '0') {
        const modal = new Modal();
        modal.showModal(selection);
        modal.onModalClose((e) => {
            buildForm();
            const classId = localStorage.getItem(config.key.class);
            timetable.loadTimeTable($('[data-id=timetable]'), classId, 'rtl');
        });
    } else {
        buildForm();
        const classId = localStorage.getItem(config.key.class);
        timetable.loadTimeTable($('[data-id=timetable]'), classId, 'rtl');
    }
});