function loadPlaceholderImage(placeholder) {
    if (placeholder.getAttribute('data-src')) {
        var placeholder_img = new Image();
        placeholder_img.src = placeholder.getAttribute('data-src');
        var width = placeholder.getAttribute('width');
        var height = placeholder.getAttribute('height');
        var ctx = placeholder.getContext('2d');
        placeholder_img.addEventListener('load', function () {
            ctx.drawImage(
                placeholder_img,
                0,
                0,
                width,
                height);
        }, false);
    }
}
function loadPlaceholderImages() {
    var placeholders = document.querySelectorAll('canvas[data-src]');
    // Progressively load placeholder images on page load
    [].forEach.call(placeholders, loadPlaceholderImage);
}
// We want to load the placeholder images as soon as possible
loadPlaceholderImages();