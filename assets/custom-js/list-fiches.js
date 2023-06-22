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

        // ADD A BTN "UPDATE" FOR MANAGER N+2
        if (manager.type === '2') {
            
            $("#card-header-btn-section").append(`
            <button id="btn-fiche-update" type="button" class="btn action-btn btn-icon me-4  btn-primary">
                <i class="fe fe-refresh-cw"></i> Mise à jour 
            </button>
            `);
            
            // ADD EVENT LISTENER TO THE UPDATE BTN
            $("#btn-fiche-update").click(function (e) {

                // STEP 1 : OPEN MODAL CONTAINNING UPLOAD SECTION
                showModal("confirm", "update", `
                <div class="control-group form-group  row">
                    <div class="col-lg-12 col-sm-12">
                    <label class="form-label">Importer ICI</label>
                    
                    <div id="fine-uploader"></div>
                    </div>
                </div>
                <div class="container-login100-form-btn">
                    <a id="config-btn" class="login100-form-btn btn-primary">
                        Mise à jour
                    </a>
                </div>
                
                `, "", {
                    "text": "Fermer",
                    "color": "success",
                    "id": "dje1"
                }, function () {
                    // REDIRECT TO EVALUATION LIST PAGE
                    setTimeout(function () {
                        // currentUrl = window.location.href;
                        // window.location.href = extractDomain(currentUrl) + "evaluation/list";
    
                        // window.location.href = "../index.html";
                        // alert("email envoyé")
                    }, 1000)
                });
    
    
                // INITIALIZE FILE UPLOADER
                $('#fine-uploader').fineUploader({
                    template: 'qq-template-gallery',
                    autoUpload: false,
                    thumbnails: {
                        placeholders: {
                            waitingPath: '../assets/plugins/fine-uploader/placeholders/waiting-generic.png',
                            notAvailablePath: '../assets/plugins/fine-uploader/placeholders/not_available-generic.png'
                        }
                    },
                    validation: {
                        allowedExtensions: ['json'],
                        itemInvalidErrorMessage: "Seuls les fichiers JSON sont autorisés"
                    },
    
                    callbacks: {
                        onSubmit: function (id, name) {
                            var fileId = id;
    
                            var file = this.getFile(id);
                            console.log(file.type);
                            if (file) {
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                    var content = e.target.result;
                                    console.log(JSON.parse(content));
                                    var contentJson = JSON.parse(content);
    
                                    if (fileId == 0 || assessment_ID === "") {
                                        assessment_ID = contentJson.assessmentId;
                                    }
                                    // Do whatever you want with the content here
    
                                    // push it to the array that holding all the files content
                                    let fileJson = {
                                        'fileName': file.name,
                                        'content': contentJson
                                    };
                                    // filesJsonArr.push(fileJson);
    
                                    // CHECK FOR MORE ASSESSMENT IDS
                                    if (assessment_ID != contentJson.assessmentId) {
    
                                        // SHOW ERROR MESSAGE
                                        showModal("error", "Attention !", "Vous ne pouvez pas télécharger les fichiers de configuration de différentes campagnes d'évaluation ! Veillez à télécharger les mêmes fichiers de campagne d'évaluation.", "", {
                                            "text": "Retour à l'accueil",
                                            "color": "danger",
                                            "id": "btn-save"
                                        }, function () {
                                            location.reload();
                                        });
    
                                    } else {
    
    
                                        // console.log("CHANGING THIS IN DB WITH THE FILE ID :" + fileId);
                                        addToStoreWithId(idb_config, "files", fileJson, fileId + 1);
    
                                        // replaceAsseementToContainer("info-container", fileJson.content);
                                    }
                                }
                                reader.readAsText(file);
                            } else {
                                alert("Please select a file to submit");
                            }
                        },
                        onCancel: function (id, name) {
                            // Handle canceled upload
                            console.log("The file is concelled : " + id + " name:" + name);
                            // //deleteFileFromArr(name);
                            deleteFromStoreById(idb_config, "files", id + 1)
                                .then((dbName, storeName, id) => {
                                    console.log(`Value with ID ${id} deleted from ${storeName} store in ${dbName} database`);
                                })
                                .catch((dbName, storeName, id, error) => {
                                    console.error(`Error deleting value with ID ${id} from ${storeName} store in ${dbName} database: ${error}`);
                                });
                        }
                    }
                });
    
    
                $("#config-btn").one("click", function (e) {
    
                    // ADD LOADER TO BTN
                    addLoaderToBtn("#config-btn");
    
                    // GET ALL THE VALUES OF ASSESSMENTS-CONFIG
                    getAllDataFromDB(idb_config)
                        .then((result) => {
                            console.log(result);
    
                            var mergedFilesData = mergeFiles(result.files);
                            console.log(mergedFilesData);
    
                            clearAndReplaceStoreData(idb_config, "files", [mergedFilesData]).then(() => {
    
                                // HEAD TO THE LOGIN PAGE
                                location.reload();
                            }).catch((e) => {
    
                            })
                        })
    
                })
    
            })


        }


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
                // window.open(url, "_blank");
                window.location.href = url;
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

function mergeFiles(arr) {
    // GET THE LIST OF COLLABORATEURS OF THAT ASSESSMENT 

    //
    let mergedList = arr[0];
    let fichesEvaluationConsolides = mergedList.fichesEvaluations;
    console.log(arr, mergedList);

    arr.map((file, index) => {
        // console.log(file);
        console.log("FILE N : " + index);


        // SKIP THE FILE REPERE 
        if (index != 0) {

            var fichesEvaluations = file.content.fichesEvaluations;

            fichesEvaluations.map((fiche, i) => {


                // GET THE CORRESPONDING FICHE IN MERGE
                // console.log(mergedList.fichesEvaluations);
                console.log(fiche.collaborateur.firstName + "_" + fiche.collaborateur.lastName);

                let corspFiche = getFicheById(fichesEvaluationConsolides, fiche.ficheEvaluationId);
                if (corspFiche == -1) {
                    console.warn("MAKAYNACH")
                }

                console.log(corspFiche.status + "--" + fiche.status);

                // 2 CASES : SOIT LES DEUX ONT LE MEME STATUS ----> TAKE THE RECENT EVALUATION
                //          OR TAKE BASED ON STATUS
                if (fiche.status === corspFiche.status) {

                    // GET THE DATES
                    var dateFiche = new Date(fiche.evaluatedAt);
                    var corspFicheDate = new Date(corspFiche.evaluatedAt);

                    if (dateFiche < corspFicheDate) {
                        fichesEvaluationConsolides = updateFiche(fichesEvaluationConsolides, corspFiche, fiche);
                    } else {

                    }


                } else {

                    console.log("NOT THE SAME");

                    switch (corspFiche.status) {
                        case "NE0":
                            if (fiche.status === "NE1" || fiche.status === "E0" || fiche.status === "E1") {

                                fichesEvaluationConsolides = updateFiche(fichesEvaluationConsolides, corspFiche, fiche);
                            }
                            break;
                        case "E0":
                            if (fiche.status === "NE1" || fiche.status === "E1") {
                                fichesEvaluationConsolides = updateFiche(fichesEvaluationConsolides, corspFiche, fiche);
                            }
                            break;
                        case "NE1":
                            if (fiche.status === "E1") {
                                fichesEvaluationConsolides = updateFiche(fichesEvaluationConsolides, corspFiche, fiche);
                            }
                            break;
                        case "E1":

                            break;

                    }

                    console.log("---AFTER UPDATE----");
                    console.log(getFicheById(fichesEvaluationConsolides, fiche.ficheEvaluationId))

                }


            })
        }

    });
    console.log(fichesEvaluationConsolides);
    mergedList.fichesEvaluations = fichesEvaluationConsolides;

    return mergedList;
}

function addLoaderToBtn(btnId) {

    // ADD LOADER HTML ELEMENT
    $(btnId).prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
}

async function handlePageRefresh() {
    const dbName = idb_config;
    const storeName = 'files';

    indexedDB.open(dbName).onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            console.log(`Cleared data from '${storeName}' store in '${dbName}' database.`);
        };

        clearRequest.onerror = (event) => {
            console.error(`Error clearing data from '${storeName}' store: ${event.target.error}`);
        };
    };
}

async function clearAndReplaceStoreData(dbName, storeName, newData) {
    handlePageRefresh().then(() => {
        addToStoreWithId(dbName, storeName, newData[0], 0);
    })
}

function getFicheById(arr, id) {

    // console.log("I M LOOKING FOR : " + id + " INSIDE :" + arr);
    console.log(arr);

    for (let i = 0; i < arr.length; i++) {
        let fiche = arr[i];

        if (fiche.ficheEvaluationId === id) {
            return fiche;
        }
    }
    return -1;
}

function updateFiche(arr, oldOne, newOne) {
    // console.log(arr, newOne);
    let newArr = [];

    let index = 0;
    for (var i = 0; i < arr.length; i++) {
        let fiche = arr[i];

        if (fiche.ficheEvaluationId == oldOne.ficheEvaluationId) {
            index = i;
            arr[i] = newOne;
        }
    }

    newArr = arr;

    // console.log(newArr[index]);

    return newArr;




}

async function deleteFromStoreById(dbName, storeName, id) {

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            const deleteRequest = store.delete(id);

            deleteRequest.onsuccess = () => {
                console.log(`DELETED : ${dbName}, ${storeName}, ${id}`);

                // Check remaining record count
                const countRequest = store.count();
                countRequest.onsuccess = () => {
                    const count = countRequest.result;
                    console.log(`Remaining records in ${storeName}: ${count}`);
                    if (count === 0) {
                        // Execute something if there are no more records in the store
                        // Replace the following line with your desired code
                        console.log('No more records in the store. Executing something...');

                        assessment_ID = "";
                    }
                };

                resolve(dbName, storeName, id);
            };

            deleteRequest.onerror = (event) => {
                reject(dbName, storeName, id, event.target.error);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'id' });
        };
    });
}

function addToStoreWithId(dbName, storeName, value, id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            const addRequest = store.put({ ...value, id });

            addRequest.onsuccess = () => {
                resolve();
            };

            addRequest.onerror = (event) => {
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'id' });
        };
    });
}

function concatenateWithUnderscore() {
    var concatenatedString = Array.from(arguments).join('_');
    return concatenatedString;
}


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

function concatenateWithUnderscore() {
    var concatenatedString = Array.from(arguments).join('_');
    return concatenatedString;
}

function getFormattedDate() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    var year = today.getFullYear();

    var formattedDate = day + month + year;
    return formattedDate;
}


function openEmailModal(recipients, emailSubject, jsonObject) {
    const subject = emailSubject; // Replace with your desired subject
    const recipientString = recipients.join(";");
    console.log(recipients);


    // Create a data URI for the JSON object
    const jsonDataURI = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));

    let fileName = concatenateWithUnderscore(assessmentJson.name, manager.data.firstName, manager.data.lastName, getFormattedDate());

    let emailBody = `
        Bonjour,

        J'espère que vous allez bien. Je tenais simplement à vous informer que j'ai terminé ma partie de l'évaluation des collaborateurs. Je vous remercie pour votre collaboration tout au long de ce processus.

        Afin de poursuivre le flux des évaluations, je vous invite à télécharger le fichier TEXTE des fiches d'évaluation en piece jointe.
        
    Cordialement
    `;

    // console.log(emailBody);

    // copyToClipboard(emailBody);

    //OPEN SHOW MODAL WITH EMAIL ELEMENTS
    // showModal("success",)
    showModal("confirm", "Envoi des résultats", `
    <form>

    <div class="form-group">
        <div class="row align-items-center">
            <label class="col-xl-2 form-label">To :</label>
            <div class="col-xl-10 input-group mb-2">
                <input type="text" class="form-control" value="${recipients[0]}" placeholder=".....@.....">
                <span class="copy-btn input-group-text btn btn-primary">Copy</span>
            </div>
        </div>
    </div>
 
    <div class="form-group">
        <div class="row align-items-center">
            <label class="col-xl-2 form-label">Objet :</label>
            
            <div class="col-xl-10 input-group mb-2">
                <input type="text" class="form-control" value="${emailSubject}"placeholder=".................">
                <span class="copy-btn input-group-text btn btn-primary">Copy</span>
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="row ">
            <label class="col-xl-2 form-label">Message :</label>
            <div class="col-xl-10">
                <textarea rows="10" class="form-control">${emailBody}</textarea>
                <span class="copy-btn btn btn-primary">Copy</span>
            </div>
        </div>
    </div>

    <div class="form-group">
        <div class="row ">
            <label class="col-xl-4 form-label">Telécharger le fichier des résultats :</label>
            <div class="col-xl-8 d-flex justify-content-end">
                <button id="download-file-btn" class="btn btn-primary mx-4 pd-x-25"> <i class="fe fe-download"></i> Télécharger</button>
            </div>
        </div>
    </div>
</form>
    
    `, "", {
        "text": "Fermer",
        "color": "success",
        "id": "dje1"
    }, function () {
        // REDIRECT TO EVALUATION LIST PAGE
        setTimeout(function () {
            // currentUrl = window.location.href;
            // window.location.href = extractDomain(currentUrl) + "evaluation/list";

            // window.location.href = "../index.html";
            // alert("email envoyé")
        }, 1000)
    })

    // ADD EVENT LISTENERS TO THESE BTNS
    $(".copy-btn").click(function (e) {

        let btnElement = e.target;

        copyToClipboard($(btnElement).prev().val());
    })

    $("#download-file-btn").click(function (e) {

        downloadJsonAsFile(jsonObject, fileName);
    })



}

function downloadJsonAsFile(jsonObj, fileName) {
    var jsonContent = JSON.stringify(jsonObj, null, 2);
    var blob = new Blob([jsonContent], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName + '.json';
    downloadLink.click();

    URL.revokeObjectURL(url);
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

    // ADD A NOTIFICATION THAT THE TXT HAS BEEN COPIED
    showNotification("<b>Succès :</b> Le text est copié", "success", "center");

}

function showNotification(msg, type, position) {

    notif({
        "msg": msg,
        "type": type,
        "position": position
    });
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
                            
                             <span class="tag tag-radius tag-round tag-outline-primary">Évalué par N+1</span>
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
