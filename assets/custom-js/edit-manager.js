console.log("edit-manager");

// CHECK IF THERE IS A MATRICE COMPETENCE IN LOCALSTORAGE
if (localStorage.getItem("managerObj") != null) {

    //STEP 1 : GET THE OBJECT OF DRH
    let manager = JSON.parse(localStorage.getItem("managerObj"));

    // STEP 2 : POPULATE VARIABLES
    managerJson = manager;


    // STEP 3 : PARSE RESULTS ON INPUTS + SECTIONS
    parseResultsOnInputs(managerJson);
    parseContactInfo(managerJson);

    // STEP 4 : 

} else {

    // REDIRECT TO THE LIST OF MATRICE OF COMPETENCE
    setTimeout(function () {
        let currentUrl = window.location.href;

        window.location.href = extractDomain(currentUrl) + "employee/manager/list";
    }, 500);
}

console.log("add-drh.js");

// VARIABLES



// INITILIZATION 




// EVENT LISTENER ON BUTTONS

// CHANGE EVENT LISTENERS
$(".form-control").change(function (e) {
    $(".form-control").removeClass("is-invalid")
})

$("#pwd-input").change(function (e) {
    $("#pwd-input").removeClass("is-invalid");
});

$(".manager-full-name").change(function (e) {

    let fullName = "";

    $(".manager-full-name").each((index, element) => {
        fullName = fullName + $(element).val() + " ";
        console.log($(element).val());
    });

    // UPDATE THE NAME'S TEXT
    $("#manager-name").text(fullName);


})

// END CHANGE EVENT LISTENERS


// CLICK EVENT LISTENERS
$("#generate-pwd-btn").click(function (e) {
    let newPwd = generateStrongPwd();

    $("#pwd-input").val(newPwd);
});

$("#update-pwd-btn").click(function (e) {

    if ($("#pwd-input").val() != $("#confirm-pwd-input").val()) {

        $("#pwd-input")
            .addClass("is-invalid");

    } else {

        // ADD LOADER
        addLoaderToBtn("#update-pwd-btn");

        // SEND REQUEST TO CHANGE THE PASSWORD
        managerJson["hashedPwd"] = $("#pwd-input").val();
        updatePwd(managerJson).then((res) => {


            // DELETE LOADER
            deleteLoaderToBtn("#update-pwd-btn");

            showModal("success", "Succès", `
                Le mot de passe a été généré avec succès. Envoyez le nouveau mot de passe à le manager :
                    <h2 class="text-center text-red">${managerJson["hashedPwd"]}</h2>
                    `, "",
                {
                    "text": "Retour à l'accueil",
                    "color": "success",
                    "id": "btn-save"
                }, function () {
                    redirectTo("employee/manager/list", 1000);
                });

        }).catch((error) => {

            // DELETE LOADER
            deleteLoaderToBtn("#update-pwd-btn");

            console.log(error);
            showModal("error", "Échec", "Un problème interne doit être résolu : " + error, "", {
                "text": "Revenir à l'acceuil",
                "color": "danger",
                "id": "dfe1"
            }, function () {
                redirectTo("employee/manager/list", 500);
            });
        });

    }
})

// END CLICK EVENT LISTENERS



function checkInputsFields() {

    if ($("#first-name-drh-input").val() == '') {
        $("#first-name-drh-input").addClass("is-invalid");
        return false;

    } else if ($("#last-name-drh-input").val() == '') {
        $("#last-name-drh-input").addClass("is-invalid");
        return false;

    } else if ($("#email-drh-input").val() == '') {
        $("#email-drh-input").addClass("is-invalid");
        return false;

    }

    return true;


}

function generateStrongPwd() {
    return Math.random().toString(36).slice(-10);
}


function showModal(type, header, content, action, btnJson, eventHandler) {

    let modalId, modalHeaderId, modalContentId, color;



    switch (type) {
        case "success":
            modalId = "success";
            modalHeaderId = "#modal-success-header";
            modalContentId = "#modal-success-content";
            color = "success";
            break;

        case "warning":
            modalId = "warning";
            modalHeaderId = "#modal-warning-header";
            modalContentId = "#modal-warning-content";
            color = "warning";
            break;

        case "info":
            modalId = "info";
            modalHeaderId = "#modal-info-header";
            modalContentId = "#modal-info-content";
            color = "info";
            break;

        case "error":
            modalId = "modaldemo5";
            modalHeaderId = "#modal-error-header";
            modalContentId = "#modal-error-content";
            color = "danger";
            $("#confirm-yes-btn").attr("data-action", action);
            break;

        case "confirm":
            modalId = "confirm";
            modalHeaderId = "#modal-confirm-header";
            modalContentId = "#modal-confirm-content";
            color = "primary";
            $("#confirm-yes-btn").attr("data-action", action);
            break;

        case "loading":
            modalId = "loading";

            color = "primary";
            break;
    }

    // DELETE ALL BTNS
    $(modalHeaderId).parent().find("button").remove();


    if (btnJson != null && modalId != "lodaing") {
        // CREATE BTNS
        $(modalHeaderId).parent()
            .append(`<button id="${btnJson.id}" class="btn btn-${btnJson.color} mx-4 pd-x-25"
            data-bs-dismiss="modal">${btnJson.text}</button>`);

        if (btnJson.hasOwnProperty('hasFermerBtn')) {
            $(modalHeaderId).parent().append(`<button aria-label="Close" class="btn mx-4 btn-primary pd-x-25"
            data-bs-dismiss="modal">Fermer</button>`);
        }

        // ADD EVENT LISTENER TO THE BTN
        $("#" + btnJson.id).click(function (e) { eventHandler(e) });
    } else if (modalId != "lodaing") {
        $(modalHeaderId).parent().append(`<button aria-label="Close" class="btn mx-4 btn-${color} pd-x-25"
        data-bs-dismiss="modal">Fermer</button>`);
    }

    // UPDATE WITH CONTENT 
    $(modalHeaderId).text(header);
    $(modalContentId).html(content);

    var myModal = new bootstrap.Modal(document.getElementById(modalId));




    myModal.show();

}



async function deteleManagerEntity(json) {
    let url = "http://localhost:8080/preassessment/api/v1/employee/drh";

    return fetch(url, { // Your POST endpoint
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify([json]) // This is your file object
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => {
            console.log(success);
            return success;
        }
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function getSelectedValuesFromSelect2(arrObj) {
    let finalArr = [];
    arrObj.map((e, i) => {
        finalArr.push(parseInt(e.text));
    });

    return finalArr;
}

function redirectTo(url, timeInMilliseconds, data) {

    // REMOVE ANY DATA SAVED IN LOCALSTORAGE
    localStorage.removeItem("drh");

    setTimeout(function () {
        let currentUrl = window.location.href;

        window.location.href = extractDomain(currentUrl) + url;
    }, timeInMilliseconds);

}


async function updatePwd(json) {

    let url = "http://localhost:8080/preassessment/api/v1/employee/manager/pwd";

    return fetch(url, { // Your POST endpoint
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json) // This is your file object
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => {
            console.log(success);
            return success;
        }
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function addLoaderToBtn(btnId) {

    // ADD LOADER HTML ELEMENT
    $(btnId).prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
}

function deleteLoaderToBtn(btnId) {

    // REMOVE LOADER HTML ELEMENT
    $(btnId).find("span").remove();
}



async function updateDrh(json) {

    let url = "http://localhost:8080/preassessment/api/v1/employee/manager/update"


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

    $("#first-name-manager-input").val(json["firstName"]);
    $("#last-name-manager-input").val(json["lastName"]);

    $("#mat-manager-input").val(json["matricule"]);
    $("#mat-manager-input").attr("readonly", "");

    $("#email-manager-input").val(json["workEmail"]);
    // $("#phone-drh-input").val(json["phoneNumber"].split("+212").slice(-1)[0]);
    // $("#direction-drh-input").val(json["direction"]);



}

function parseContactInfo(json) {

    if (json["workEmail"] != null) {
        $("#manager-email").text(json["workEmail"]);
    }
    // $("#manager-phone").text(json["phoneNumber"]);
    $("#manager-name").text(json["firstName"] + " " + json["lastName"]);

}