/**
 * Class Modal
 *
 * A helper class to create and handle the modal
 */
class Modal {
    /**
     * Modal class constructor.
     */
    constructor() {
        this.utils = new Utils();
    }

    /**
     * Show the selection modal.
     * @param selection
     * @returns {Promise<void>}
     */
    async showModal(selection) {
        // Modal with background click and ESC press disabled
        $('[data-id=selection-modal]').modal({
            backdrop: 'static',
            keyboard: false
        });
        const modalBody = $('[data-id=selection-modal-body]');
        await selection.buildForm(modalBody);
    }

    onModalClose(callback){
        $('[data-id=selection-modal]').on('hidden.bs.modal', callback)
    }
}