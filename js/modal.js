class Modal {
    constructor() {
        this.utils = new Utils();
        this.selection = new Selection();
    }

    showModal() {
        $('[data-id=selection-modal]').modal();
        const modalBody = $('[data-id=selection-modal-body]');
        this.utils.showLoader(modalBody);
        this.selection.createForm(modalBody);
    }
}