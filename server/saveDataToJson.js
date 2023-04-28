function saveDataToJSON(data, filename) {
    var outputLocation = require("path").resolve(__dirname, filename);
    require("fs").writeFile(
        outputLocation,
        JSON.stringify(data, null, 4),
        function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + outputLocation);
            }
        }
    );
}
module.exports = {
    saveDataToJSON,
};