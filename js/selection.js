class Selection {
    constructor() {
        this.http = new Http();
    }

    async createForm(target) {
        const formHTML = `
        <form data-id="selection-form">
            <div class="form-group">
                <label for="job">Job</label>
                <select class="form-control" id="job" data-id="job" disabled></select>
            </div>
            <div class="form-group">
                <label for="class">Class</label>
                <select class="form-control" id="class" data-id="class" disabled></select>
            </div>
        </form>
        `;
        target.append(formHTML);
        await this.loadJobs();
    }

    async loadJobs() {
        const response = await this.http.get('https://sandbox.gibm.ch/berufe.php');
        debugger;
    }

    registerHandlers() {

    }
}