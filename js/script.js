$(() => {
    const isSelectionComplete = localStorage.getItem(config.key.selectionComplete);
    if (!isSelectionComplete) {
        const modal = new Modal();
        modal.showModal();
    }
});