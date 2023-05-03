console.log("add-drh.js");

// VARIABLES
let drhJson = {
    "firstName": "",
    "lastName": "",
    "matricule": "",
    "topDirection": "",
    "direction": "",
    "role": "",
    "phoneNumber": "",
    "workEmail": "",
    "hashedPwd": "",
    "tag": "",
    "codePrefix": [],
    "codeSuffix": []
}


// INITILIZATION 

// INITIALIZE SELECT2 INPUTS

// DISABLE UPDATE PWS BTN IN CASE OF NEW DRH ENITY
if (localStorage.getItem("drh") == null) {
    $("#update-pwd-btn").addClass("disabled");
    $("#cancel-pwd-btn").addClass("disabled");

}
$(document).ready(function () {
    $("#code-suffix-drh-input").select2({
        tags: true,
        tokenSeparators: [',', ' '],
        createTag: function (params) {
            var term = $.trim(params.term);

            if (term === '' || isNaN(term)) {
                return null;
            }

            return {
                id: term,
                text: term,
                newTag: true // add additional parameters
            }
        }

    });

    $("#code-prefix-drh-input").select2({
        tags: true,
        tokenSeparators: [',', ' '],
        createTag: function (params) {
            var term = $.trim(params.term);

            if (term === '' || isNaN(term)) {
                return null;
            }

            return {
                id: term,
                text: term,
                newTag: true // add additional parameters
            }
        }
    });
});

// END INITIALIZATION



// EVENT LISTENER ON BUTTONS



$("#save-btn").click(function (e) {



    // CHECK IF ANY FIELD IS EMPTY 
    if (checkInputsFields()) {

        // ADD LOADER 
        addLoaderToBtn("#save-btn");

        // GET ALL INPUT DATA
        drhJson["firstName"] = $("#first-name-drh-input").val();
        drhJson["lastName"] = $("#last-name-drh-input").val();
        drhJson["hashedPwd"] = generateStrongPwd();
        drhJson["matricule"] = $("#mat-drh-input").val();
        drhJson["workEmail"] = $("#email-drh-input").val();
        drhJson["phoneNumber"] = "+212" + $("#phone-drh-input").val();
        drhJson["direction"] = $("#direction-drh-input").val();
        drhJson["codeSuffix"] = getSelectedValuesFromSelect2($("#code-suffix-drh-input").select2('data'));
        drhJson["codePrefix"] = getSelectedValuesFromSelect2($("#code-prefix-drh-input").select2('data'));
        drhJson["topDirection"] = $("#bpr-drh-input").select2('data')[0].id;

        drhJson["tag"] = $("#bpr-drh-input").select2('data')[0].id;
        drhJson["role"] = "DRH";
        console.log(drhJson);

        if (localStorage.getItem("drh") == null) {
            postDrhEntity(drhJson).then((response) => {

                // DELETE LOADER
                deleteLoaderToBtn("#save-btn");

                if (response.status == '400') {

                    console.log("error");
                    showModal("error", "Échec", "Un problème interne doit être résolu : " + response.message, "");

                } else {
                    console.log(response);

                    showModal("success", "Succès", `
                    Un nouveau compte DRH a été créé avec succès. Le mot de passe généré pour ce compte est :
                        <h2 class="text-center text-red">${drhJson["hashedPwd"]}</h2>
                    `, "",
                        {
                            "text": "Retour à l'accueil",
                            "color": "success",
                            "id": "btn-save"
                        }, function () {
                            redirectTo("employee/drh/list", 1000);
                        });

                }



            }).catch((error) => {
                console.log(error);
                showModal("error", "Échec", "Un problème interne doit être résolu : " + error, "", {
                    "text": "Revenir à l'acceuil",
                    "color": "danger",
                    "id": "dfe1"
                }, function () {
                    redirectTo("employee/drh/list", 500);
                });
            });

        } else {

            updateDrh(drhJson).then((response) => {

                // DELETE LOADER
                deleteLoaderToBtn("#save-btn");

                if (response.status == '400') {

                    console.log("error");
                    showModal("error", "Échec", "Un problème interne doit être résolu : " + response.message, "");

                } else {
                    console.log(response);

                    showModal("success", "Succès", `
                    Les informations du compte DRH ont été modifiées avec succès.
                    `, "",
                        {
                            "text": "Retour à l'accueil",
                            "color": "success",
                            "id": "btn-save"
                        }, function () {
                            redirectTo("employee/drh/list", 1000);
                        });

                }



            }).catch((error) => {

                // DELETE LOADER
                deleteLoaderToBtn("#save-btn");

                console.log(error);
                showModal("error", "Échec", "Un problème interne doit être résolu : " + error, "", {
                    "text": "Revenir à l'acceuil",
                    "color": "danger",
                    "id": "dfe1"
                }, function () {
                    redirectTo("employee/drh/list", 500);
                });
            });

        }



    }




})

$("#reset-btn").click(function (e) {

})

// CHANGE EVENT LISTENERS
$(".form-control").change(function (e) {
    $(".form-control").removeClass("is-invalid")
})

$("#pwd-input").change(function (e) {
    $("#pwd-input").removeClass("is-invalid");
});

$(".drh-full-name").change(function (e) {

    let fullName = "";

    $(".drh-full-name").each((index, element) => {
        fullName = fullName + $(element).val() + " ";
        console.log($(element).val());
    });

    // UPDATE THE NAME'S TEXT
    $("#drh-name").text(fullName);


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
        drhJson["hashedPwd"] = $("#pwd-input").val();
        updatePwd(drhJson).then((res) => {


            // DELETE LOADER
            deleteLoaderToBtn("#update-pwd-btn");

            showModal("success", "Succès", `
                Le mot de passe a été changé avec succès. Envoyez le nouveau mot de passe à l'utilisateur DRH :
                    <h2 class="text-center text-red">${drhJson["hashedPwd"]}</h2>
                    `, "",
                {
                    "text": "Retour à l'accueil",
                    "color": "success",
                    "id": "btn-save"
                }, function () {
                    redirectTo("employee/drh/list", 1000);
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
                redirectTo("employee/drh/list", 500);
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

    } else if ($("#mat-drh-input").val() == '') {
        $("#mat-drh-input").addClass("is-invalid");
        return false;

    } else if ($("#email-drh-input").val() == '') {
        $("#email-drh-input").addClass("is-invalid");
        return false;

    } else if ($("#phone-drh-input").val() == '') {
        $("#phone-drh-input").addClass("is-invalid");
        return false;

    } else if ($("#direction-drh-input").val() == '') {
        $("#direction-drh-input").addClass("is-invalid");
        return false;

    }



    if ($("#code-suffix-drh-input").select2('data').length === 0 && $("#code-prefix-drh-input").select2('data').length === 0) {


        showModal("error", "Échec", "Veuillez remplir l'un des champs suivants : suffixe ou préffixe avec certaines valeurs", "");
        return false;

    } else if ($("#bpr-drh-input").select2('data')[0].id === "0") {

        showModal("error", "Échec", "Veuillez remplir le champ du BPR, choisissez un BPR dans la liste déroulante.", "");
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

async function postDrhEntity(json) {
    let url = "http://localhost:8080/preassessment/api/v1/employee/drh";

    return fetch(url, { // Your POST endpoint
        method: 'POST',
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

async function deteleDrhEntity(json) {
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

    let url = "http://localhost:8080/preassessment/api/v1/employee/drh/pwd";

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
