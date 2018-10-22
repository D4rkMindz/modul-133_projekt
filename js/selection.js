class Selection {
    constructor() {
        this.utils = new Utils();
        this.http = new Http();
    }

    async buildForm(formTarget, includeConfirmButton = true) {
        const formHTML = `
        <form data-id="selection-form">
            <div class="form-group">
                <label for="job">Job</label>
                <select class="form-control full-width" id="job" data-id="job"></select>
            </div>
            <div class="form-group">
                <label for="class">Class</label>
                <select class="form-control full-width hidden class-select" id="class" data-id="class"></select>
            </div>
            <div data-id="submit-button-placeholder"></div>
        </form>
        `;
        formTarget.append(formHTML);
        if (includeConfirmButton) {
            const buttonHTML = `
            <button type="submit" class="btn btn-primary float-right" data-id="submit-selection"  data-dismiss="modal" disabled>
                Confirm
            </button>`;
            $('[data-id=submit-button-placeholder]').append(buttonHTML);
        }
        this._registerHandlers();
        await this._populateJobs();
        this._loadPreselection();
    }

    onSelection(callback) {
        $('[data-id=class]').on('change', callback);
        $('[data-id=submit-selection]').on('click', callback);
    }

    onJobSelection(callback) {
        $('[data-id=job]').on('change', callback);
    }

    async _loadPreselection() {
        const jobSelect = $('[data-id=job]');
        const jobId = localStorage.getItem(config.key.job);
        if (!jobId) {
            localStorage.setItem(config.key.selectionComplete, 0);
            return;
        }
        jobSelect.val(jobId);
        $('[data-id=jobs-selection-empty]').remove();

        await this._populateClasses(jobId);
        const classSelect = $('[data-id=class]');
        const classId = localStorage.getItem(config.key.class);
        if (!classId) {
            localStorage.setItem(config.key.selectionComplete, 0);
            return;
        }
        classSelect.val(classId);
        $('[data-id=class] :first(option)').remove();
        this._enableSubmit();
    }

    _registerHandlers() {
        $('[data-id=job]').on('change', (e) => {
            $('[data-id=jobs-selection-empty]').remove();
            const jobId = e.currentTarget.value;
            localStorage.setItem(config.key.job, jobId);
            localStorage.removeItem(config.key.class);
            localStorage.setItem(config.key.selectionComplete, 0);
            this._populateClasses(jobId);
            this._disableSubmit();
        });
        $('[data-id=class]').on('change', (e) => {
            $('[data-id=class] :first(option)').remove();
            const classId = e.currentTarget.value;
            localStorage.setItem(config.key.class, classId);
            localStorage.setItem(config.key.selectionComplete, 1);
            this._enableSubmit();
        });
    }

    _enableSubmit() {
        $('[data-id=submit-selection]').attr('disabled', false);
    }

    _disableSubmit() {
        $('[data-id=submit-selection]').attr('disabled', true);
    }

    async _populateJobs() {
        const jobs = await this._loadJobs();
        const jobSelect = $('[data-id=job]');
        jobSelect.empty();
        jobSelect.append(`<option>Please select...</option>`);
        $.each(jobs, (index, element) => {
            jobSelect.append(`<option value="${element.beruf_id}">${element.beruf_name}</option>`);
        });
        const jobId = localStorage.getItem(config.key.job);
        if (jobId) {
            jobSelect.val(jobId);
        }
        jobSelect.attr('disabled', false);
    }

    async _loadJobs() {
        const response = await this.http.get('https://sandbox.gibm.ch/berufe.php');
        response.sort((a, b) => {
            const nameA = a.beruf_name.toUpperCase(); // ignore upper and lowercase
            const nameB = b.beruf_name.toUpperCase(); // ignore upper and lowercase
            return this.utils.compare(nameA, nameB);
        });
        return response;
    }

    async _populateClasses(jobId) {
        const classes = await this._loadClasses(jobId);
        const classSelect = $('[data-id=class]');
        classSelect.empty();
        classSelect.append(`<option>Please select...</option>`);
        $.each(classes, (index, element) => {
            classSelect.append(`<option value="${element.klasse_id}">${element.klasse_name} - ${element.klasse_longname}</option>`);
        });
        classSelect.removeClass('hidden').addClass('visible');
        anime({
            targets: '.class-select',
            scale: 0,
            duration: 1300,
            direction: 'reverse',
            easing: 'easeInOutQuart'
        })
    }

    async _loadClasses(jobId) {
        const response = await this.http.get(`https://sandbox.gibm.ch/klassen.php?beruf_id=${jobId}`);
        response.sort((a, b) => {
            const nameA = a.klasse_name.toUpperCase(); // ignore upper and lowercase
            const nameB = b.klasse_name.toUpperCase(); // ignore upper and lowercase
            return this.utils.compare(nameA, nameB);
        });
        return response;
    }
}