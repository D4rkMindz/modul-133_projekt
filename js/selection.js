/**
 * Class Selection
 *
 * A class to handle the job and class selection form.
 */
class Selection {
    /**
     * Selection class constructor
     */
    constructor() {
        this.utils = new Utils();
        this.http = new Http();
    }

    /**
     * Build the selection form in the specified target.
     * @param formTarget A DOM Element where the form should be loaded in
     * @param includeConfirmButton Indicates if a confirm button should be included (used in the modal)
     * @returns {Promise<void>}
     */
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

    /**
     * On Class Selection callback handler
     *
     * The callback of this method will be executed if either the class selection changes or the submit button is clicked.
     *
     * @param callback
     */
    onSelection(callback) {
        $('[data-id=class]').on('change', callback);
        $('[data-id=submit-selection]').on('click', callback);
    }

    /**
     * On Job Selection callback handler
     *
     * The callback of this method will be executed if a job is selected
     *
     * @param callback
     */
    onJobSelection(callback) {
        $('[data-id=job]').on('change', callback);
    }

    /**
     * Load the preselection
     *
     * Load the selection of the previous user visit. If there is nothing saved in the local storage, nothing will be
     * loaded.
     *
     * @returns {Promise<void>}
     * @private
     */
    async _loadPreselection() {
        const jobSelect = $('[data-id=job]');
        const jobId = localStorage.getItem(config.key.job);
        // Check if the job was previously selected
        if (!jobId) {
            // Reset the selection status in the local storage
            localStorage.setItem(config.key.selectionComplete, 0);
            return;
        }
        // Set the job selection to the previously selected value
        jobSelect.val(jobId);

        // Remove the empty field in the job selection
        $('[data-id=jobs-selection-empty]').remove();

        // Populate the classes selection
        await this._populateClasses(jobId);
        const classSelect = $('[data-id=class]');
        const classId = localStorage.getItem(config.key.class);

        // Check if the class was previously selected
        if (!classId) {
            // Reset the selection status in the local storage
            localStorage.setItem(config.key.selectionComplete, 0);
            return;
        }
        // Set the class selection to the previously selected value
        classSelect.val(classId);
        $('[data-id=class] :first(option)').remove();

        // Allow the user to submit the selection form
        this._enableSubmit();
    }

    /**
     * Register selection form callback handlers
     * @private
     */
    _registerHandlers() {
        // Register job selection handler
        $('[data-id=job]').on('change', (e) => {
            // Remove the empty field in the job selection
            $('[data-id=jobs-selection-empty]').remove();

            // Get the selected job ID and save it for later use
            const jobId = e.currentTarget.value;
            localStorage.setItem(config.key.job, jobId);

            // Remove class ID from storage and reset selection status
            localStorage.removeItem(config.key.class);
            localStorage.setItem(config.key.selectionComplete, 0);

            // Populate the classes selection
            this._populateClasses(jobId);
            this._disableSubmit();
        });

        // Register class selection handler
        $('[data-id=class]').on('change', (e) => {
            // Remove the empty field in the class selection
            $('[data-id=class] :first(option)').remove();

            // Get the selected class ID and save it for later use
            const classId = e.currentTarget.value;
            localStorage.setItem(config.key.class, classId);

            // Set selection status to finished
            localStorage.setItem(config.key.selectionComplete, 1);

            // Allow the user to submit the selection form
            this._enableSubmit();
        });
    }

    /**
     * Enable the submit button in the selection form (if there is any)
     *
     * @private
     */
    _enableSubmit() {
        $('[data-id=submit-selection]').attr('disabled', false);
    }

    /**
     * Disable the submit button in the selection form (if there is any)
     *
     * @private
     */
    _disableSubmit() {
        $('[data-id=submit-selection]').attr('disabled', true);
    }

    /**
     * Populate the job selection form field.
     *
     * @returns {Promise<void>}
     * @private
     */
    async _populateJobs() {
        // Load the available jobs
        const jobs = await this._loadJobs();

        const jobSelect = $('[data-id=job]');

        // Clear the current job selection
        jobSelect.empty();

        // Append an empty option to the job selection
        jobSelect.append(`<option>Please select...</option>`);

        // Iterate through the jobs and append them to the job selection
        $.each(jobs, (index, element) => {
            jobSelect.append(`<option value="${element.beruf_id}">${element.beruf_name}</option>`);
        });

        // Load the job ID
        const jobId = localStorage.getItem(config.key.job);
        if (jobId) {
            // Select the previously selected job
            jobSelect.val(jobId);
        }

        // Enable interaction with the job selection
        jobSelect.attr('disabled', false);
    }

    /**
     * Load the jobs from the server
     *
     * @returns {Promise<Object>}
     * @private
     */
    async _loadJobs() {
        // Load the jobs
        const response = await this.http.get(config.url.jobs, true);
        response.sort((a, b) => {
            // Sort the jobs by the alphabet and ignore upper and lowercase
            const nameA = a.beruf_name.toUpperCase();
            const nameB = b.beruf_name.toUpperCase();
            return this.utils.compare(nameA, nameB);
        });
        return response;
    }

    /**
     * Populate the classes selection
     *
     * @param jobId The ID of the selected job
     * @returns {Promise<void>}
     * @private
     */
    async _populateClasses(jobId) {
        // Load all available classes from the server
        const classes = await this._loadClasses(jobId);
        const classSelect = $('[data-id=class]');

        // Clear the class selection
        classSelect.empty();

        // Append an empty option to the class selection
        classSelect.append(`<option>Please select...</option>`);

        // Iterate through the classes and append them to the class selection
        $.each(classes, (index, element) => {
            classSelect.append(`<option value="${element.klasse_id}">${element.klasse_name} - ${element.klasse_longname}</option>`);
        });

        // Show the class selection
        classSelect.removeClass('hidden').addClass('visible');

        // Animate the "pop up" of the class selection
        anime({
            targets: '.class-select',
            scale: 0,
            duration: 1300,
            direction: 'reverse',
            easing: 'easeInOutQuart'
        })
    }

    /**
     * Load classes from the server
     *
     * @param jobId The selected job
     * @returns {Promise<Object>}
     * @private
     */
    async _loadClasses(jobId) {
        // Load the classes
        const response = await this.http.get(config.url.classes + jobId);
        response.sort((a, b) => {
            // Sort the classes by the alphabet and ignore upper and lowercase
            const nameA = a.klasse_name.toUpperCase();
            const nameB = b.klasse_name.toUpperCase();
            return this.utils.compare(nameA, nameB);
        });
        return response;
    }
}