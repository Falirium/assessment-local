// CHECK IF THERE IS A MATRICE COMPETENCE IN LOCALSTORAGE
if (localStorage.getItem("drh") != null) {

    //STEP 1 : GET THE OBJECT OF DRH
    let drh = JSON.parse(localStorage.getItem("drh"));

    // STEP 2 : POPULATE VARIABLES
    drhJson = drh;


    // STEP 3 : PARSE RESULTS ON INPUTS + SECTIONS
    parseResultsOnInputs(drhJson);
    parseContactInfo(drhJson);

    // STEP 4 : 




} else {

    // REDIRECT TO THE LIST OF MATRICE OF COMPETENCE
    setTimeout(function () {
        let currentUrl = window.location.href;

        window.location.href = extractDomain(currentUrl) + "employee/drh/list";
    }, 500);
}


async function updateDrh(json) {

    let url = "http://localhost:8080/preassessment/api/v1/employee/drh/update"


    return fetch(url, { // Your POST endpoint
        method: 'PUT',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json) // This is your file object
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => {

            return success;



        } // Handle the success response object
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function parseResultsOnInputs(json) {

    $("#first-name-drh-input").val(json["firstName"]);
    $("#last-name-drh-input").val(json["lastName"]);

    $("#mat-drh-input").val(json["matricule"]);
    $("#mat-drh-input").attr("readonly", "");

    $("#email-drh-input").val(json["workEmail"]);
    $("#phone-drh-input").val(json["phoneNumber"].split("+212").slice(-1)[0]);
    $("#direction-drh-input").val(json["direction"]);

    if (json["codeSuffix"].length != 0) {
        json["codeSuffix"].map((e, i) => {
            // Set the value, creating a new option if necessary
            if ($('#code-suffix-drh-input').find("option[value='" + e + "']").length) {
                $('#code-suffix-drh-input').val(e).trigger('change');
            } else {
                // Create a DOM Option and pre-select by default
                var newOption = new Option(e, e, true, true);
                // Append it to the select
                $('#code-suffix-drh-input').append(newOption).trigger('change');
            }
        })
    }

    if (json["codePrefix"].length != 0) {
        json["codePrefix"].map((e, i) => {
            // Set the value, creating a new option if necessary
            if ($('#code-prefix-drh-input').find("option[value='" + e + "']").length) {
                $('#code-prefix-drh-input').val(e).trigger('change');
            } else {
                // Create a DOM Option and pre-select by default
                var newOption = new Option(e, e, true, true);
                // Append it to the select
                $('#code-prefix-drh-input').append(newOption).trigger('change');
            }
        })
    }

    $("#bpr-drh-input").val(json["topDirection"]);

}

function parseContactInfo(json) {

    $("#drh-email").text(json["workEmail"]);
    $("#drh-phone").text(json["phoneNumber"]);
    $("#drh-name").text(json["firstName"] + " " + json["lastName"]);

}