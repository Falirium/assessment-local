
console.log("list-assessments.js");

// REMOVE ANY SAVED ASSESSMENT ID;
removeAssessmentFromStorage();



let authorizedCol = ["id", "name", "startedAt", "finishesAt", "status"];

let assessmentDatatable;



let listAssessments;
let bpr;
let assessmentJson;

let listFiches;

let assessment_ID = "";
const idb_config = "assessments_config";
const idb_result = "assessments_results";
let users;

// INITIALIZATION
intializeDB()
    .then((data) => {

        assessment_ID = data.assessmentId;

        assessmentJson = data;

        // users = data.users;
        bpr = data.targetedDirection;

        // TRANSFROM DATA TO PAGE VARIABLES FORMAT

        // ADD UPLOAD BTN 
        // $("#card-header-btn-section").append(`
        //     <button id="btn-fiche-update" type="button" class="btn action-btn btn-icon me-4  btn-primary">
        //         <i class="fe fe-refresh-cw"></i> Mise à jour 
        //     </button>
        //     `)

        // STEP 1 : TO LIST ASSESSMENT FORMAT
        listAssessments = transformToPageFormat(data);

        // SET USER
        let user = (localStorage.getItem("user") === "admin") ? "admin" : JSON.parse(localStorage.getItem("user"));

        console.log(user);
        console.log(listAssessments);

        // UPDATE BREADCRUMB
        updateBreadcrumb(user);

        if (user === "admin") {

            listFiches = data.fichesEvaluations;

        } else {

            // GET LIST DES FICHES FROM INDEXDB FILTERED BY CONNECTED BPR
            listFiches = filterCollorateursByBpr(data.fichesEvaluations, user.data.codePrefix, user.data.codeSuffix);

        }




        // CONFIGURE DATATABLE
        let dataSet = []
        let col = []

        // CHECK IF WE ARE IN DRH SESSION
        if (user.type === "drh") {
            console.log(bpr);
            // listAssessments = filterAssessmentsByBpr(listAssessments, bpr);

            console.log(listAssessments);
            dataSet = getAssessmentsDataFromJson(listAssessments, true);
            col = getAssessmentColumnFromJson(listAssessments[0], authorizedCol);

        } else {
            dataSet = getAssessmentsDataFromJson(listAssessments, false);
            col = getAssessmentColumnFromJson(listAssessments[0], authorizedCol);
        }

        assessmentDatatable = $("#tbs2").DataTable({
            data: dataSet
        })

        // ADD EVENTLISTENERS TO VIEW BTN
        $(".edit-btn").click(function (e) {

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let assessmentName = $(aElement).parents("td").siblings().slice(1, 2).text();
            console.log(assessmentName);

            let assessment = getAssessmentInfoFromArr(assessmentName).assessment;
            console.log(assessment);

            // CHECK IF THE ASSESSMENT IS LANCHED OR NOT
            if (assessment.hasOwnProperty('status')) {

                // SHOW ERROR MESSAGE 
                showModal("error", "Accès refusé", "Vous ne pouvez pas modifier l'assessment après son lancement.");

            } else {

                //SAVE ASSESSMENT ON LOCAL SESSION
                localStorage.setItem("assessmentId", assessment.id);

                // REDIRECT TO THE ASSESSMENT PAGE 
                // let url = buildURL("evaluation/evaluate", urlParams);
                let currentUrl = window.location.href;

                window.location.href = extractDomain(currentUrl) + "assessment/edit";
                // console.log(extractDomain(currentUrl) + "assessment/add");
                // console.log(localStorage.getItem("assessmentId"));
            }


        })


        // ADD EVENT LINTENER TO CONSULTER BTN
        $(".view-btn").click(function (e) {

            // let aElement;
            // if (e.target.tagName === "SPAN") {
            //     aElement = e.target.parentElement;
            // } else {
            //     aElement = e.target;
            // }

            // let btns = $(".view-btn").get();
            // let indexOfAssessment = btns.indexOf(aElement);

            // // GET THE ASSOCIATED ASSESSMENT
            // let assessment = listAssessments[indexOfAssessment];
            // console.log(assessment);


            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let assessmentName = $(aElement).parents("td").siblings().slice(1, 2).text();
            console.log(assessmentName);

            let assessment = getAssessmentInfoFromArr(assessmentName).assessment;
            console.log(assessment)

            if (!assessment.hasOwnProperty('status')) {

                // SHOW ERROR MESSAGE
                showModal("error", "Accès refusé", "Vous ne pouvez pas voir les résultats d'un assessment qui n'est pas encore lancée.");

            } else {

                //SAVE ASSESSMENT ON LOCAL SESSION
                localStorage.setItem("assessmentId", assessment.id);

                // REDIRECT TO THE ASSESSMENT PAGE 
                // let url = buildURL("evaluation/evaluate", urlParams);
                let currentUrl = window.location.href;
                window.location.href = './assesment-result.html';

                // window.location.href = extractDomain(currentUrl) + "assessment/" + assessment.id;
                // console.log(extractDomain(currentUrl) + "assessment/add");
                // console.log(localStorage.getItem("assessmentId"));
            }
        })



        $("#btn-fiche-send").click({
            finalValidation: true
        }, function (e) {

            // VERIFY STATUS OF FICHES EVALUATIONS
            console.log(verifyFichesEvaluation(listFiches));
            if (verifyFichesEvaluation(listFiches)) {


                // STEP 1 : CREATE A JSON FILE HOLDING THE ASSESSMENT INFO 

                // STEP 2 : CREATE EMAIL : RECEIPIENTS, CC, OBJECT, BODY, ATTACHMENT
                console.log(assessmentJson);
                openEmailModal(['sghannam@groupebcp.com', 'mfarfaoua@groupe.com', 'jncho@groupebcp.com'], "Évaluation terminée - Envoi des fiches d'évaluation", assessmentJson, user);

                // STEP 3 : VERIFY IF THE EMAIL HAS BEEN SENT

                // STEP 4 : SAVE THIS ASSESSMENT DATA IN ASSESSMENT-RESULTS

                // STEP 5 : SHOW SUCCESS MODAL

            } else {
                // SHOW ERROR
                showModal("error", "Erreur", "Vous ne pouvez pas envoyer de fiches d'évaluation car vous ne les avez pas encore validés. Veuillez compléter les fiches non validés", "");
            }
        });

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

    })

// END INITIALISATION

function verifyFichesEvaluation(arr) {

    for (var i = 0; i < arr.length; i++) {
        let fiche = arr[i];

        if (fiche.status != 'E1') {
            console.log(i);
            return false;
        }

    }

    return true;
}

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

// THIS FUNCTION CHECKS ONLY THE PREFIX , NOT YET THE SUFFIX
function filterCollorateursByBpr(list, prefix, suffix) {

    let finalArr = [];
    // console.log(prefix, suffix);

    finalArr = list.filter((fiche, index) => {

        let affectationCode = fiche.collaborateur.affectationCode + "";
        // console.log(affectationCode);

        // console.log("Matricule : " + mat);

        if (prefix.length != 0) {

            for (var i = 0; i < prefix.length; i++) {
                let code = prefix[i] + "";

                // console.log("Code : " + code);

                // ITERATE OVER CODE
                let counter = 0;
                for (var j = 0; j < code.length; j++) {

                    // console.log(affectationCode[j], code[j], affectationCode[j] == code[j])

                    if (affectationCode[j] == code[j] && j < affectationCode.length) {
                        counter++;
                    } else {

                        // CHECK THE NEXT CODE
                        console.error(" maybe : prefix lenght > matricule lenght");
                        break;

                    }


                };

                if (counter == code.length) {
                    // WE VALIDATE A PREFIX
                    // console.log(" VALID CODE");
                    return true;
                }

            }

            // WE COMPLETE THE LIST OF PREFIX
            return false;
        }
    });

    // console.log(finalArr);

    return finalArr;

}

function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
}

function openEmailModal(recipients, emailSubject, jsonObject, user) {
    const subject = emailSubject; // Replace with your desired subject
    const recipientString = recipients.join(";");
    // console.log(recipientString);


    // Create a data URI for the JSON object
    const jsonDataURI = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));

    let fileName = concatenateWithUnderscore(assessmentJson.name, user.data.tag, user.data.firstName, user.data.lastName, getFormattedDate());

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
                <input type="text" class="form-control" value="${recipientString}" placeholder=".....@.....">
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
            <div class="col-xl-8 d-flex justify-content-start">
                <button id="download-file-btn" class="btn w-39 btn-primary mx-4 pd-x-25"> <i class="fe fe-download"></i> Télécharger</button>
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


async function getListOfAssessments() {
    let url = "http://localhost:8080/preassessment/api/v1/assessment/";
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
function getFormattedDate() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    var year = today.getFullYear();

    var formattedDate = day + month + year;
    return formattedDate;
}
async function getListOfTempAssessments() {
    let url = "http://localhost:8080/preassessment/api/v1/assessment/temp/list";
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

function getAssessmentColumnFromJson(json, authorizedCol) {
    let colArr = [];

    console.log(json, typeof (json));
    if (typeof (json) === 'undefined') {
        return colArr;
    }



    authorizedCol.map((col, index) => {
        let value;
        // console.log(col);
        console.log(json.hasOwnProperty(col));
        if (json.hasOwnProperty(col)) {
            switch (col) {
                case "name":
                    value = "Nom";
                    break;
                case "id":
                    value = "id";
                    break;
                case "startedAt":
                    value = "date de début"
                    break;
                case "finishesAt":
                    value = "date de fin";
                    break;
                case "status":
                    value = "status"
                    break;
            }

            // console.log(value);



            colArr.push({
                "title": value
            });


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

function getAssessmentsDataFromJson(arrJson, isDrh = false) {
    console.log(arrJson);
    let finalArr = [];
    arrJson.map((e, i) => {
        console.log(i);
        let arr = [];

        // HADI GHER ZA3TA OSF
        if (typeof (e.id) === 'string') {
            arr.push(e.id.split("-")[0]);
            arr.push(e.name);
            arr.push(e.startedAt.split("T")[0]);
            arr.push(e.finishesAt.split("T")[0]);
            // Status attribute has special style
            if (e.status === "CREATED") {
                arr.push(`
            <div class="mt-sm-1 d-block">
             
             <span class="tag tag-radius tag-round tag-outline-info">Enregistré</span>
            </div>
                `)
            } else if (e.status === "LANCHED") {
                let todayDate = new Date();
                let finishingDate = new Date(e.finishesAt.split("T")[0]);

                if (finishingDate < todayDate) {

                    arr.push(`
                <div class="mt-sm-1 d-block">
                    <span class="tag tag-radius tag-round tag-outline-primary">Lancé</span>
                </div>
                <div class="mt-sm-1 d-block">
                    <span class="tag tag-radius tag-round tag-outline-danger">Dépassé le délai</span>
                </div>
                    `)

                } else {

                    arr.push(`
                <div class="mt-sm-1 d-block">
                    <span class="tag tag-radius tag-round tag-outline-primary">Lancé</span>
                </div>
                <div class="mt-sm-1 d-block">
                    <span class="tag tag-radius tag-round tag-outline-warning">En cours</span>
                </div>
                    `)

                }

            } else if (e.status === "COMPLETED") {
                arr.push(`

            <div class="mt-sm-1 d-block">
                
                <span class="tag tag-radius tag-round tag-outline-success">Terminé</span>
            </div>
                `)
            } else if (e.status === "SUSPENDED") {
                arr.push(`
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-primary">Suspendu</span>
            </div>
    
                `)
            } else if (e.status === "ENDED") {
                arr.push(`
            
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-success">Terminé</span>
            </div>
                `)
            }

            arr.push(`
            <div class="g-2">
                <a class="btn text-primary btn-sm view-btn" data-bs-toggle="tooltip"
                        data-bs-original-title="Voir les résultas"><span
                            class="fe fe-eye fs-14"></span></a>
            </div>
            `);
        } else {
            let assessmentTempContent = JSON.parse(e.content);
            arr.push(e.id);
            arr.push(e.name);
            arr.push(assessmentTempContent.startedAt);
            arr.push(assessmentTempContent.finishesAt);

            arr.push(`
            <div class="mt-sm-1 d-block">
             <span class="tag tag-radius tag-round tag-outline-info">Enregistré</span>
            </div>
                `);

            arr.push(`
            <div class="g-2">
                <a class="btn text-primary btn-sm edit-btn" data-bs-toggle="tooltip"
                    data-bs-original-title="Éditer l'assessment"><span
                        class="fe fe-edit fs-14"></span></a>
            </div>
            `);





        }





        // // ACTION COL
        // if (isDrh) {
        //     arr.push(`
        //     <div class="g-2">
        //         <a class="btn text-primary btn-sm view-btn" data-bs-toggle="tooltip"
        //                 data-bs-original-title="Voir les résultas"><span
        //                     class="fe fe-eye fs-14"></span></a>
        //     </div>
        //     `);
        // } else {
        //     arr.push(`
        //     <div class="g-2">
        //         <a class="btn text-primary btn-sm edit-btn" data-bs-toggle="tooltip"
        //             data-bs-original-title="Éditer l'assessment"><span
        //                 class="fe fe-edit fs-14"></span></a>
        //         <a class="btn text-primary btn-sm view-btn" data-bs-toggle="tooltip"
        //                 data-bs-original-title="Voir les résultas"><span
        //                     class="fe fe-eye fs-14"></span></a>
        //     </div>
        //     `);
        // }




        finalArr.push(arr);
    })

    return finalArr;
}

function removeAssessmentFromStorage() {
    if (localStorage.getItem("assessmentId") != null) {
        localStorage.removeItem("assessmentId");
    }
}

function showModal(type, header, content, action, btnJson, eventHandler) {

    let modalId, modalHeaderId, modalContentId, color;

    // Close any open modals
    $(".modal").modal("hide");

    // HIDE LOADER IF IT EXIST
    if ($("#loading").is(':visible')) {
        $("#loading").modal('hide');
    }



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
    // data-bs-backdrop="static"
    $(modalId).attr("data-bs-backdrop", "static");

    if (modalId != "loading") {
        // SET HEADER
        $(modalHeaderId).text(header);

        // SET CONTENT
        $(modalContentId).html(content);
    }


    myModal.show();

}

function getAssessmentInfoFromArr(assessmentName) {

    for (var i = 0; i < listAssessments.length; i++) {
        let assessment = listAssessments[i];



        if (assessmentName == assessment.name) {
            return {
                "index": i,
                "assessment": assessment
            }
        }


    }

    return {
        "index": -1,
        "assessment": null
    }
}

function filterAssessmentsByBpr(arr, bpr) {

    // ASSESSMENT COULD BE SAVED OR PUBLISHED


    let newArr = arr.filter((assessment, index) => {

        let targetDirection;

        if (assessment.hasOwnProperty('content')) {
            let content = JSON.parse(assessment.content);
            targetDirection = content.targetedDirection;

        } else {
            targetDirection = assessment.targetedDirection;
        }

        return targetDirection.includes(bpr);
    });

    return newArr;

}

function updateBreadcrumb(user) {
    if (user.type === "drh") {
        $("#breadcrumb-text").text("Consultant DRH");

    } else if (user === "admin") {
        $("#breadcrumb-text").text("Consultant BCP");

    }

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

function transformToPageFormat(assessmentJson) {
    return [
        {
            "assessmentCategories": assessmentJson.assessmentCategories,
            "emplois": assessmentJson.targetEmplois,
            "finishesAt": assessmentJson.finishesAt,
            "id": assessmentJson.assessmentId,
            "listOfCollaborateurs": assessmentJson.collaborateurs,
            "listOfManagersOne": assessmentJson.managers1,
            "listOfManagersTwo": assessmentJson.managers2,
            "name": assessmentJson.name,
            "startedAt": assessmentJson.startedAt,
            "status": assessmentJson.status,
            "targetedDirection": assessmentJson.targetedDirection
        }
    ]
}