class Modal {
    constructor() {
        this.utils = new Utils();
    }

    async showModal(selection) {
        // Modal with background click and ESC press disabled
        $('[data-id=selection-modal]').modal({
            backdrop: 'static',
            keyboard: false
        });
        const modalBody = $('[data-id=selection-modal-body]');
        this.utils.showLoader(modalBody);
        await selection.buildForm(modalBody);
        this.utils.hideLoader();
    }

    onModalClose(callback){
        $('[data-id=selection-modal]').on('hidden.bs.modal', callback)
    }
}