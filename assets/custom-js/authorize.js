// CHECK FOR MANAGER ENTITY
let currentUrl = window.location.href;;

let auth = null
let regexList = []
let hiddenSections = []
let showSections = []
let defaultHomePage = "";
if (localStorage.getItem("user") === null) {
    console.log("can 't have user");
    window.location.replace(extractDomain(currentUrl));

} else {

    // SET DEFAULT HOMEPAGE
    let user = (localStorage.getItem("user") === "admin") ? ("admin") : ( JSON.parse(localStorage.getItem("user")) ) ;
    if (user.type === "drh") {
        defaultHomePage = "assessment/list";
    } else if (user.type === "1" || user.type === "2") {
        defaultHomePage = "evaluation/list";
    } else {
        defaultHomePage = "assessment/list";
    }

    // STEP 1 : GET THE LIST OF AUTHORIZED URLS
    auth = JSON.parse(localStorage.getItem("auth"));
    regexList = auth.regex;
    hiddenSections = auth.sections.hide;
    showSections = auth.sections.show;


    // STEP 2 : CHECK FOR HIDDEN SECTIONS : LIST OF ID OF THE TARGET ELEMENTS
    if (hiddenSections.length != 0) {
        hiddenSections.map((element) => {
            $(element.id).remove();
        })
    }


    // STEP 3 : CHANGE SOME PARTS
    showSections.map((element) => {
        switch (element.type) {
            case "anchor":
                $(element.id).find("a").attr("href", element.link);
                break;

            case "text":
                $(element.id).text(element.text);
                break;

        }
        
    })

    // STEP 4 : CHECK THE TARGET URL IS AUTHORIZED
    console.log(regexList, currentUrl);
    console.log(checkUrl(regexList, formatUrl(currentUrl)));


    if (!checkUrl(regexList, formatUrl(currentUrl))) {

        // currentUrl = window.location.href;
        // window.location.href = extractDomain(currentUrl) + "evaluation/list";

        // SHOW ERROR MODAL;

        $(".target-container").addClass("modal-is-activated")
        showModalV1("error", "Accès non autorisé", "Vous serez redirigé automatiquement vers la page d'accueil.", "", {
            "text": "Revenir à l'accueil",
            "color": "danger",
            "id": "dje1"
        }, function () {
            // REDIRECT TO EVALUATION LIST PAGE
            setTimeout(function () {
                currentUrl = window.location.href;
                window.location.href = extractDomain(currentUrl) + defaultHomePage;
            }, 1000);
        })

    }

}

function extractDomain(url) {
    const elems = url.split("/");
    return elems[0] + "//" + elems[2] + "/";
}

function checkUrl(list, url) {

    for (var i = 0; i < list.length; i++) {
        let regex = list[i];
        let regex1 = new RegExp(regex, 'g');

        // console.log(regex + "--" + url + " = " + regex1.test(url) );
        if (regex1.test(url)) {
            return true;
        }
    }

    return false;
}

function showModalV1(type, header, content, action, btnJson, eventHandler) {

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
    }

    // DELETE ALL BTNS
    $(modalHeaderId).parent().find("button").remove();


    if (btnJson != null) {
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
    } else {
        $(modalHeaderId).parent().append(`<button aria-label="Close" class="btn mx-4 btn-${color} pd-x-25"
        data-bs-dismiss="modal">Fermer</button>`);
    }


    var myModal = new bootstrap.Modal(document.getElementById(modalId));

    // SET HEADER
    $(modalHeaderId).text(header);

    // SET CONTENT
    $(modalContentId).text(content)

    myModal.show();


    // //ADD BLUR EFFECT
    // $(".page-main").addClass("blur");
    // $(myModal).addClass("no-blur")

}

function formatUrl(url) {
    let arr = url
        .split("//")[1]
        .split("/");

    return "/" + arr[1] + "/" + arr[2];

}
