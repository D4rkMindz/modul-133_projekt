class Utils {
    showLoader(target) {
        target = target || $('body');
        const loaderHTML = `<div class="loader"></div>`;
        target.append(loaderHTML);
    }
}