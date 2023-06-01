console.log("list-fiches.js")
const extractRootDomain = (url) => {

    const domain = new URL(url).hostname;
    const elems = domain.split('.');
    const iMax = elems.length - 1;

    const elem1 = elems[iMax - 1];
    const elem2 = elems[iMax];

    const isSecondLevelDomain = iMax >= 3 && (elem1 + elem2).length <= 5;
    return (isSecondLevelDomain ? elems[iMax - 2] + '.' : '') + elem1 + '.' + elem2;

}

currentUrl = window.location.href;

let manager = JSON.parse(localStorage.getItem("user"));

let managerMatricule = manager.data.matricule;;

let authorizedCol = ["id", "collaborateur", "evaluateurOne", "emploi", "niveau", "associatedAssessment", "status"];

let ficheDatatable;





let listFiches;

let assessment_ID = "";
const idb_config = "assessments_config";
const idb_result = "assessments_results";
let users = [];
let assessmentJson;

// INITIALIZATION
intializeDB()
    .then((data) => {
        assessment_ID = data.assessmentId;
        let fiches = data.fichesEvaluations;
        fichesEmplois = data.fichesEmploi;

        assessmentJson = data;

        fichesJson = data.fichesEvaluations;


        listFiches = fichesJson;

        // FILTER THE LIST BY THE MANAGER
        listFiches = filterByManager(manager.data.matricule)
        console.log(listFiches);

        // INITIALIZE DATATABLE
        let fiteredAuthorizedCol;

        if (manager.type === '1') {
            fiteredAuthorizedCol = authorizedCol.filter((col, index) => "evaluateurOne" != col);
        } else {
            fiteredAuthorizedCol = authorizedCol.filter((col, index) => "evaluateurTwo" != col);
        }

        let dataSet = getFichesDataFromJson(listFiches, fiteredAuthorizedCol);
        let col = getFichesColumnFromJson(listFiches[0], fiteredAuthorizedCol);

        ficheDatatable = $("#tb1").DataTable({
            data: dataSet,
            columns: col,
            columnDefs: [
                { "width": "6%", "targets": 2 }
            ],
            autoWidth: false,
            ordering: false
        })

        // ADD EVENTLISTENERS TO VIEW BTN
        $(".view-btn").click(function (e) {

            // let aElement;
            // if (e.target.tagName === "SPAN") {
            //     aElement = e.target.parentElement;
            // } else {
            //     aElement = e.target;
            // }

            // let btns = $(".view-btn").get();
            // // let indexOfFiche = btns.indexOf(aElement);
            // let indexOfFiche = $(aElement).parents(".g-1").attr("id");

            // // console.log(manager.type === 2 && listFiches[indexOfFiche].status === "CREATED");


            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let ficheEvaluationId = $(aElement).parents("td").siblings().slice(0, 1).text();

            let ficheFromArr = getFicheInfoFromArr(ficheEvaluationId).fiche;
            console.log(ficheEvaluationId, ficheFromArr)


            // CHECK IF THE FICHE IS ALREADY EVALUATED BY THE SAME MANAGER

            if ((manager.type === '1' && (ficheFromArr.status === "NE0" || ficheFromArr.status === "NE01")) || (manager.type === '2' && (ficheFromArr.status === "NE1" || ficheFromArr.status === "E0"))) {

                console.log("access authorized");

                // GET THE ASSOCIATED FIHCE D EVALUATION
                let fiche = ficheFromArr;
                console.log(fiche);

                //SAVE FICHE OBJECT ON LOCAL SESSION
                localStorage.setItem("ficheEvaluation", JSON.stringify(fiche));

                // REDIRECT TO THE FICHE PAGE : /evaluation/evaluate?.....

                let emploiName = encodeURIComponent(fiche.emploi.intitule);
                let emploiLevel = fiche.emploi.level;

                let doesResponsabilitesExist = false;
                let doesMarqueursExist = false;
                let doesExigencesExist = false;
                let doesCompetencesDcExist = false;
                let doesCompetencesSeExist = false;
                let doesCompetencesSfExist = false;


                //GET THE CATEGORY ASSESSMENT_CONTENT PROPERTY
                fiche.ficheContent.map((e, i) => {
                    switch (e) {
                        case "responsabilites":
                            doesResponsabilitesExist = true;
                            break;

                        case "exigences":
                            doesExigencesExist = true;
                            break;

                        case "marqueurs":
                            doesMarqueursExist = true;
                            break;

                        case "competences-dc":
                            doesCompetencesDcExist = true;
                            break;

                        case "competences-sf":
                            doesCompetencesSfExist = true;
                            break;

                        case "competences-se":
                            doesCompetencesSeExist = true;
                            break;


                    }
                })

                // BUILD URL 
                let urlParams = {
                    "eName": emploiName,
                    "level": emploiLevel,
                    "marqueurs": doesMarqueursExist,
                    "exigences": doesExigencesExist,
                    "responsabilites": doesResponsabilitesExist,
                    "competences_dc": doesCompetencesDcExist,
                    "competences_se": doesCompetencesSeExist,
                    "competences_sf": doesCompetencesSfExist,
                }
                let url = buildURL("./fiche-evaluation.html", urlParams);

                // window.location.href = extractDomain(currentUrl) + url;
                window.open(url, "_blank");
                // console.log(extractDomain(currentUrl) + url);

            } else {
                console.log("access denied");

                if (manager.type === '1') {
                    let errorBody;

                    if (ficheFromArr.status === "E0") {

                        errorBody = `Désolé, vous ne pouvez pas accéder ou modifier les fiches d'évaluations que vous avez envoyés à votre manager`;

                    } else if (ficheFromArr.status.includes("E1")) {

                        errorBody = `Désolé, vous ne pouvez pas accéder aux les fiches d'évaluations qui ont été évalués par votre manager.`
                    }

                    console.log("from N+1");
                    showModal("error", "Accès Refusé", errorBody, "");

                } else if (manager.type === '2') {

                    let errorBody;

                    if (ficheFromArr.status === "NE0" || ficheFromArr.status === "CREATED") {

                        errorBody = `Désolé, vous ne pouvez pas accéder aux fiches d'évaluations qui n'ont pas été validées par le manager N+1.`;

                    } else if (ficheFromArr.status === "E1") {

                        errorBody = `Désolé, vous ne pouvez pas accéder ou modifier les fiches d'évaluations que vous avez envoyés aux consultants DRH.`;
                    }

                    console.log("from N+2");
                    showModal("error", "Accès Refusé", errorBody, "");

                }
            }





        })

    });

// SEND THE RESULT OF THIS
$("#btn-fiche-send").click({
    finalValidation: true
}, function (e) {

    // VERIFY STATUS OF FICHES EVALUATIONS
    console.log(verifyFichesEvaluation(listFiches));
    if (verifyFichesEvaluation(listFiches)) {


        // STEP 1 : CREATE A JSON FILE HOLDING THE ASSESSMENT INFO 

        // STEP 2 : CREATE EMAIL : RECEIPIENTS, CC, OBJECT, BODY, ATTACHMENT
        openEmailModal(['farbusiness92@gmail.com'], "Évaluation terminée - Envoi des fiches d'évaluation", assessmentJson);

        // STEP 3 : VERIFY IF THE EMAIL HAS BEEN SENT

        // STEP 4 : SAVE THIS ASSESSMENT DATA IN ASSESSMENT-RESULTS

        // STEP 5 : SHOW SUCCESS MODAL
        // showModal("success", "Succès", "Merci d'avoir complété cette campagne d'assessment. Vos évaluations ont été soumise et envoyées avec succès", "", {
        //     "text": "Revenir à l'accueil",
        //     "color": "success",
        //     "id": "dje1"
        // }, function () {
        //     // REDIRECT TO EVALUATION LIST PAGE
        //     setTimeout(function () {
        //         // currentUrl = window.location.href;
        //         // window.location.href = extractDomain(currentUrl) + "evaluation/list";

        //         window.location.href = "../index.html";
        //     }, 1000)
        // })
    } else {
        // SHOW ERROR
        showModal("error", "Erreur", "Vous ne pouvez pas envoyer de fiches d'évaluation car vous ne les avez pas encore validés. Veuillez compléter les fiches non validés", "");
    }
})

function filterByManager(matricule) {
    return listFiches.filter((e, i) => {
        if (manager.type === "1") {
            if (matricule == e.evaluateurOne.matricule) {
                return true;
            }
        } else if (manager.type === '2') {
            if (matricule == e.evaluateurTwo.matricule) {
                return true;
            }
        }

        return false;
    })
}

function generateEmailContent(emailBody, jsonDataURI) {
    return `
    <html>
        <body>
          <p>${emailBody}</p>
          <a href="${jsonDataURI}" download="data.txt">Download JSON file</a>
        </body>
      </html>
    `
}

function openOutlook(recipients, CC, jsonObject, emailBody) {
    const recipientString = recipients.join(",");
    const ccString = CC.join(",");
    const subject = "Email subject"; // Replace with your desired subject

    // Create a data URI for the JSON object
    const jsonDataURI = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));

    // Create the email body with the download link
    const emailContent = generateEmailContent(emailBody, jsonDataURI);

    // Construct the mailto link
    const mailtoLink = `mailto:${encodeURIComponent(recipientString)}?cc=${encodeURIComponent(ccString)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;

    // Open the default email client
    window.location.href = mailtoLink;
}

function openEmailModal(recipients, emailSubject, jsonObject) {
    const subject = emailSubject; // Replace with your desired subject
    const recipientString = recipients.join(",");


    // Create a data URI for the JSON object
    const jsonDataURI = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));
    let fileName = "data.txt"

    let emailBody = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Download JSON Object as TXT</title>
    <script>
        function downloadJson() {
        var blob = new Blob([jsonContent], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);

        var downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = '${fileName}';
        downloadLink.click();

        URL.revokeObjectURL(url);
        }
    </script>
    </head>
    <body>
    <p>
        Bonjour,

        J'espère que vous allez bien. Je tenais simplement à vous informer que j'ai terminé ma partie de l'évaluation des collaborateurs. Je vous remercie pour votre collaboration tout au long de ce processus.

        Afin de poursuivre le flux des évaluations, je vous invite à télécharger les fiches d'évaluation via le lien suivant : 
    </p> 

    <button onclick="downloadJson()">Download JSON</button>

    Cordialement


    `;

    // console.log(emailBody);

    copyToClipboard(emailBody);



}

function copyToClipboard(text) {
    // Modern browsers
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch((error) => {
                console.error('Error copying text to clipboard:', error);
            });
    } else {
        // Fallback for older browsers
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Ensure off-screen positioning
        document.body.appendChild(textarea);
        textarea.select();
        try {
            var successful = document.execCommand('copy');
            var message = successful ? 'Text copied to clipboard' : 'Unable to copy text to clipboard';
            console.log(message);
        } catch (error) {
            console.error('Error copying text to clipboard:', error);
        }
        document.body.removeChild(textarea);
    }
}

function verifyFichesEvaluation(arr) {

    for (var i = 0; i < arr.length; i++) {
        let fiche = arr[i];


        if ((manager.type === '1' && ((fiche.status === "NE0") || (fiche.status === "NE01"))) || (manager.type === '2' && ((fiche.status === "NE1") || (fiche.status === "E0")))) {
            console.log(i);
            return false;
        }

    }

    return true;
}
function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
}

async function getListOfFichesByMatricule(matricule) {
    let url = "http://localhost:8080/preassessment/api/v1/ficheEvaluation/manager/" + matricule;
    return fetch(url, {
        method: 'GET'
    }).then(response => response.json())
        .then(success => {
            console.log(success);
            return success;
        }).catch((error) => {
            console.log(error);
        })
}

async function intializeDB() {
    return getAllDataFromDB(idb_config)
        .then((result) => {
            let assessmentData = result.files[0];
            console.log(assessmentData);
            return assessmentData;
        })
}

async function getAllDataFromDB(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        const result = {};

        request.onerror = (event) => {
            console.error(`Error while retrieving all data from ${dbName} database: ${event.target.error}`);
            reject(null);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction(db.objectStoreNames, 'readonly');
            tx.onerror = (event) => {
                console.error(`Error while retrieving all data from ${dbName} database: ${event.target.error}`);
                reject(null);
            };

            tx.oncomplete = (event) => {
                console.log(`Retrieved all data from ${dbName} database:`, result);
                resolve(result);
            };

            Array.from(db.objectStoreNames).forEach((storeName) => {
                const store = tx.objectStore(storeName);
                const storeRequest = store.getAll();
                storeRequest.onsuccess = (event) => {
                    const storeResult = event.target.result;
                    result[storeName] = storeResult;
                };
                storeRequest.onerror = (event) => {
                    console.error(`Error while retrieving all data from ${storeName} store: ${event.target.error}`);
                    reject(null);
                };
            });
        };
    });
}

function getFichesColumnFromJson(json, authorizedCol) {
    let colArr = [];
    console.log(json);


    // ADD CUSTOM COLUMNS


    authorizedCol.map((col, index) => {
        let value;
        // console.log(col);
        console.log(json.hasOwnProperty(col));
        if (json.hasOwnProperty(col)) {
            switch (col) {
                case "collaborateur":
                    value = "collaborateur";
                    break;
                case "id":
                    value = "id";
                    break;
                case "emploi":
                    value = "emploi ciblé"
                    break;
                case "evaluateurOne":
                    value = "evaluateurOne"
                    break;

                case "associatedAssessment":
                    value = "assessment";
                    break;
                case "status":
                    value = "status"
                    break;
            }

            // console.log(value);

            if (value === "collaborateur") {
                colArr.push({
                    "title": "Matriculle"
                }, {
                    "title": "Collaborateur"
                });
            } else if (value === "evaluateurOne") {
                colArr.push({
                    "title": "Mat. Manager N+1"
                }, {
                    "title": "Manager N+1"
                });
            } else {
                colArr.push({
                    "title": value
                });
            }




        } else {
            value = col; // CASE OF NIVEAU DE SENIORITE
            colArr.push({
                "title": value
            });
        }


    })

    // ACTION COL
    colArr.push({
        "title": "Actions"
    });

    return colArr;
}

function getFichesDataFromJson(arrJson, authorizedCol) {
    let finalArr = [];

    //
    for (var i = 0; i < arrJson.length; i++) {

        let e = arrJson[i];
        console.log(e);


        // IF DATE D'EVALUATION IS THE SAME AS TODAY
        let dateNow = new Date();
        if (comparingDates(dateNow.toISOString().split("T")[0], e.dateEvaluation.split("T")[0]).includes("less")) {
            continue;
        }

        // console.log(i);
        let arr = [];

        authorizedCol.map((authorized, index) => {

            switch (authorized) {
                case "id":
                    arr.push(e.ficheEvaluationId);
                    break;
                case "collaborateur":
                    arr.push(e.collaborateur.matricule);
                    arr.push(e.collaborateur.firstName + " " + e.collaborateur.lastName);
                    break;
                case "evaluateurOne":
                    arr.push(e.evaluateurOne.matricule);
                    arr.push(e.evaluateurOne.firstName + " " + e.evaluateurOne.lastName);
                    break;
                case "emploi":
                    arr.push(e.emploi.intitule);
                    break;
                case "niveau":
                    arr.push(e.emploi.level);
                    break;
                case "associatedAssessment":
                    console.log(assessmentJson.status);
                    switch (assessmentJson.status) {
                        case "LANCHED":
                            arr.push(
                                `
                                <button type="button" class="btn btn-outline-primary position-relative me-5 mb-2"> ${assessmentJson.name}
                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">active
                                        <span class="visually-hidden">unread messages</span>
                                    </span>
                                </button>
                                `
                            );

                            break;
                        case "FINISHED":
                            arr.push(
                                `
                                <button type="button" class="btn btn-outline-primary position-relative me-5 mb-2"> ${assessmentJson.name}
                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">terminé
                                        <span class="visually-hidden">unread messages</span>
                                    </span>
                                </button>
                                `
                            );
                            break;

                        case "SUSPENDED":
                            arr.push(
                                `
                                <button type="button" class="btn btn-outline-primary position-relative me-5 mb-2"> ${assessmentJson.name}
                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">suspendu
                                        <span class="visually-hidden">unread messages</span>
                                    </span>
                                </button>

                                `
                            );
                            break;

                    }
                    // arr.push(e.associatedAssessment.name);
                    break;

                case "status":
                    console.log("HERE STATUS", authorized);
                    // Status attribute has special style
                    if (e.status === "NE0") {
                        arr.push(`
                        <div class="mt-sm-1 d-block">
                            <span class="tag tag-radius tag-round tag-outline-danger">Non évalué</span>
                        </div>
                            `)
                    } else if (e.status.includes("NE01")) {
                        arr.push(`
                        <div class="mt-sm-1 d-block">
                            
                            <span class="tag tag-radius tag-round tag-outline-warning">Évalué</span>
                            
                        </div>
                        <div class="mt-sm-1 d-block">
                            
                            <span class="tag tag-radius tag-round tag-outline-warning">En cours</span>
                        </div>
                            `)
                    } else if (e.status.includes("E0")) {
                        arr.push(`
                        <div class="mt-sm-1 d-block">
                            
                             <span class="tag tag-radius tag-round tag-outline-success">Évalué par N+1</span>
                        </div>
                            `)
                    } else if (e.status.includes("NE1")) {
                        arr.push(`
                        <div class="mt-sm-1 d-block">
                            
                            <span class="tag tag-radius tag-round tag-outline-warning">Évalué par N+2</span>
                         </div>
                         <div class="mt-sm-1 d-block">
                            
                            <span class="tag tag-radius tag-round tag-outline-warning">En cours</span>
                         </div>
                        `)
                    } else if (e.status.includes("E1")) {
                        arr.push(`
                        <div class="mt-sm-1 d-block">
                            
                            <span class="tag tag-radius tag-round tag-outline-success">Validé par N+2</span>
                         </div>
                        `)
                    }
                    console.log("fin STATUS");
                    break;

            }
        })



        // ACTION COL
        arr.push(`
            <div id="${i}" class="g-1">
                <a class="btn text-primary btn-sm view-btn" data-bs-toggle="tooltip"
                    data-bs-original-title="Évaluer"><span
                        class="fe fe-edit fs-14"></span></a>
            </div>
            `)



        finalArr.push(arr);
    }

    return finalArr;
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


    var myModal = new bootstrap.Modal(document.getElementById(modalId));
    $(modalId).attr("data-bs-backdrop", "static");

    $(modalHeaderId).text(header);
    $(modalContentId).html(content);


    myModal.show();

}


function comparingDates(d1, d2) {
    let date1 = new Date(d1).getTime();
    let date2 = new Date(d2).getTime();

    if (date1 < date2) {
        return `${d1} is less than ${d2}`;
    } else if (date1 > date2) {
        return `${d1} is greater than ${d2}`;
    } else {
        return `Both dates are equal`;
    }
};

function getFicheInfoFromArr(ficheId) {

    for (var i = 0; i < listFiches.length; i++) {
        let ficheEva = listFiches[i];
        console.log(ficheId, ficheEva.id)

        if (ficheId == ficheEva.ficheEvaluationId) {
            return {
                "index": i,
                "fiche": ficheEva
            }
        }


    }
    return {
        "index": -1,
        "fiche": null
    }
}
