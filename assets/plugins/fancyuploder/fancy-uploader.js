$(function () {
    //fancyfileuplod
    $('#demo').FancyFileUpload({
        onChange: function (file) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var fileContents = event.target.result;
                // Call a function to manipulate the file contents
                manipulateFileContents(fileContents);
            };
            reader.readAsText(file);
        }
    });
});