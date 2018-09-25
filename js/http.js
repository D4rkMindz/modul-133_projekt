class Http {
    get(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'GET',
                contentType: 'application/json',
                cache: false,
                processData: true,
                url: url,
            }).done((response) => resolve(response));
        });
    }
}