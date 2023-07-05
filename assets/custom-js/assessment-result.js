// GET PARAMS FROM URL
const url = window.location.href;
let idParam = url.split("/").at(-1);

console.log(idParam);

// THIS VARIABLE DEFINED THE SHOWN COLUMN ON THE TABLE

let authorizedCol = ["id", "collaborateur", "code affectation", "evaluateurOne", "evaluateurTwo", "emploi", "niveau", "Score", "% Res", "% Exi", "% Marq", "% D.C", "% S.E", "% S.F", "status"];

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

        assessmentJson = data;
        console.log(assessmentJson, fiches);

        if (fiches.hasOwnProperty("status")) {
            if (fiches.status === 500) {
                showModal("error", "Échec", fiches.error, "", {
                    "text": "Revenir à l'acceuil",
                    "color": "danger",
                    "id": "dqz1"
                }, function () {

                    //  REDIRECT TO THE ASSESSMENT PAGE
                    redirectTo("./assesment-result.html", 1000);
                });
            }
        }
        fichesArrJson = fiches;

        // FILTER LIST OF FICHE EVALUATION BASED ON THE CONNECTED DRH
        let user = (localStorage.getItem("user") != "admin") ? JSON.parse(localStorage.getItem("user")) : ("admin");


        // UPDATE BREADCRUMB
        updateBreadcrumb(user);

        // REMOVE SUSPEND AND TERMINATE BTNS
        removeElements(["#btn-assessment-terminate", "#btn-assessment-sus"]);

        if (user.type === "drh") {

            

            fichesArrJson = filterCollorateursByBpr(fiches, user.data.codePrefix, user.data.codeSuffix);




        }

        // GET ASSESSMENTJSON FROM FICHE EVALUATION
        // assessmentJson = fiches[0].associatedAssessment;

        // COUNT HOLDS A JSON THAT CONTAINS : total, blank, inProgress, completed 
        let count = iterateOverEvaluations(fichesArrJson);
        console.log(count);

        // DISPLAY THE RESULTS
        displayBlankEvaluations(count.blank, count.total);
        displayInProgressEvaluations(count.inProgress, count.total);
        displayCompletedEvaluations(count.completed, count.total);
        displayTotalFiches(count.total);

        // CHECK ASSESSMENT STATUS
        if (assessmentJson.status === "SUSPENDED") {

            // CHANGE THE CONTENT OF SUSPEND BTN
            $("#btn-assessment-sus").addClass("btn-info").removeClass("btn-warning").html('<i class="fe fe-play me-2"></i>Reprendre l\'assessment');

        } else if (assessmentJson.status === "ENDED") {

            // DISABLES BTNS
            $("#btn-assessment-sus").addClass("disabled")
            $("#btn-assessment-terminate").addClass("disabled")
            $("#btn-assessment-inform").addClass("disabled")

        }


        // DISPLAY THE LIST OF FICHES
        let dataSet = [];
        let col = [];

        dataSet = getFichesDataFromJson(fichesArrJson);
        col = getFichesColumnFromJson(fichesArrJson[0], authorizedCol);


        // INITIALIZE DATATABLE


        // COSTUMIZE THE FILE NAME 
        let fileTitle = assessmentJson.name + "_At_" + new Date().toISOString().split("T")[0];
        if (user.type === "drh") {
            fileTitle = user.data.tag + "_" + fileTitle;
        } else {
            fileTitle = "BCP" + "_" + fileTitle;
        }


        ficheDatatable = $("#tb4").DataTable({
            data: dataSet,
            columns: col,
            columnDefs: [
                { "width": "6%", "targets": 3 },
                { "className": "success-light-cell", "targets": 10 },
                { "className": "default-light-cell ", "targets": [11, 12, 13, 14, 15, 16] }

            ],
            autoWidth: false,
            ordering: false,
            dom: 'Bfrtip',
            buttons: [

                {
                    extend: 'excelHtml5',
                    title: fileTitle,
                    text: "Télécharger les données sous Excel",
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                    },
                    autoFilter: true,
                    sheetName: assessmentJson.name
                }
            ]
        })

        // ADD EVENT LISTENER ON VIEW BTN
        $(".view-btn").click(function (e) {

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let ficheEvaluationId = $(aElement).parents("td").siblings().slice(0, 1).text();
            console.log(ficheEvaluationId);

            let ficheFromArr = getFicheInfoFromArr(ficheEvaluationId).fiche;


            // CHECK IF THE FICHE IS ALREADY EVALUATED BY THE SAM MANAGER




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


            // window.location.href = url
            window.open(url, "_blank");
            // console.log(url);
            // window.open(extractDomain(window.location.href) + url);
            // console.log(extractDomain(currentUrl) + url);


        })


        // ADD EVENT LISTENER TO SEND BTN
        $("#btn-fiche-send").click({
            finalValidation: true
        }, function (e) {

            // VERIFY STATUS OF FICHES EVALUATIONS
            console.log(verifyFichesEvaluation(fichesArrJson));
            if (verifyFichesEvaluation(fichesArrJson)) {


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


        // ADD EVENT LITENER ON UPDATE BTN
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


    });



// END INITIALIZATION

// GET THE ASSESSMENT JSON
// getFicheEvaluationsByAssessment(idParam).then((fiches) => {



// })

function getFormattedDate() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    var year = today.getFullYear();

    var formattedDate = day + month + year;
    return formattedDate;
}

function openEmailModal(recipients, emailSubject, jsonObject, user) {
    const subject = emailSubject; // Replace with your desired subject
    const recipientString = recipients.join(";");
    console.log(recipientString);


    // Create a data URI for the JSON object
    const jsonDataURI = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));

    let fileName = concatenateWithUnderscore(assessmentJson.name, user.data.tag ,user.data.firstName, user.data.lastName, getFormattedDate());

    let modalBody = `
    S'il vous plaît, vous devez <strong>télécharger le fichier JSON en cliquant sur le bouton de téléchargement situé en bas</strong>, et le conserver dans un dossier spécifique comme mentionné dans le guide des bonnes pratiques. Ensuite, vous devez <strong>l'envoyer à la BCP </strong>
       
    `;

    // console.log(emailBody);

    // copyToClipboard(emailBody);

    //OPEN SHOW MODAL WITH EMAIL ELEMENTS
    // showModal("success",)
    showModal("confirm", "Envoi des résultats", `
    <form>

    <div class="form-group">
        <div class="row align-items-center">
            <label class="col-xl-12 form-label">${modalBody}</label>
        
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

async function getFicheEvaluationsByAssessment(idParam) {
    let url = "http://localhost:8080/preassessment/api/v1/ficheEvaluation/assessment/" + idParam;

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

function displayBlankEvaluations(number, total) {

    $("#total-blank-evaluation").html(number);

    let width = (number / total) * 100;

    $("#progress-bar-blank").attr("style", `width: ${width}%;`);

}

function displayInProgressEvaluations(number, total) {
    $("#total-inprogress-evaluation").html(number);

    let width = (number / total) * 100;

    $("#progress-bar-inprogress").attr("style", `width: ${width}%;`);
}

function displayCompletedEvaluations(number, total) {
    $("#total-completed-evaluation").html(number);

    let width = (number / total) * 100;

    $("#progress-bar-completed").attr("style", `width: ${width}%;`);
}

function displayTotalFiches(total) {
    $("#total-fiches").html(total);
}

function iterateOverEvaluations(arrJson) {

    let numberOfBlank = 0;
    let numberOfInProgress = 0;
    let numberOfCompleted = 0;

    arrJson.map((fiche, index) => {
        if (fiche.status === "NE0") {
            numberOfBlank++;
        } else if (fiche.status.includes("E0") || fiche.status.includes("NE1")) {
            numberOfInProgress++;
        } else if (fiche.status.includes("E1")) {
            numberOfCompleted++;
        }
    });

    return {
        "total": arrJson.length,
        "blank": numberOfBlank,
        "inProgress": numberOfInProgress,
        "completed": numberOfCompleted
    }

}

function getFichesColumnFromJson(json, authorizedCol) {
    let colArr = [];



    // ADD CUSTOM COLUMNS
    console.log(json);

    authorizedCol.map((col, index) => {
        let value;
        // console.log(col);
        // console.log(json.hasOwnProperty(col));
        if (json.hasOwnProperty(col)) {
            switch (col) {
                case "collaborateur":
                    value = "collaborateur";
                    break;
                case "id":
                    value = "id";
                    break;
                case "code affectation":
                    value = "code affectation";
                    break;
                case "emploi":
                    value = "emploi ciblé";
                    break;
                case "evaluateurOne":
                    value = "evaluateurOne";
                    break;
                case "evaluateurTwo":
                    value = "evaluateurTwo";
                    break;
                case "Score":
                    value = "score";
                    break;
                case "section_res":
                    value = "% Res";
                    break;
                case "section_exi":
                    value = "% Exi";
                    break;
                case "section_marq":
                    value = "% Marq";
                    break;
                case "section_dc":
                    value = "% D.C";
                    break;
                case "section_se":
                    value = "% S.Ê";
                    break;
                case "section_sf":
                    value = "% S.F";
                    break;
                case "status":
                    value = "status";
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
                    "title": "Matriculle - N+1"
                }, {
                    "title": "Manager N+1"
                });
            } else if (value === "evaluateurTwo") {
                colArr.push({
                    "title": "Matriculle - N+2"
                }, {
                    "title": "Manager N+2"
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

function getFichesDataFromJson(arrJson) {
    let finalArr = [];
    arrJson.map((e, i) => {
        console.log(i);
        let arr = [];

        arr.push(e.ficheEvaluationId);
        arr.push(e.collaborateur.matricule);
        arr.push(e.collaborateur.firstName + " " + e.collaborateur.lastName);
        arr.push(e.collaborateur.affectationCode);
        arr.push(e.evaluateurOne.matricule);
        arr.push(e.evaluateurOne.firstName + " " + e.evaluateurOne.lastName);
        arr.push(e.evaluateurTwo.matricule);
        arr.push(e.evaluateurTwo.firstName + " " + e.evaluateurTwo.lastName);
        arr.push(e.emploi.intitule);
        arr.push(e.emploi.level);
        arr.push(e.score);

        // ADD % DES SECTIONS
        arr.push(e.sectionRes);
        arr.push(e.sectionExi);
        arr.push(e.sectionMarq);
        arr.push(e.sectionCompDc);
        arr.push(e.sectionCompSe);
        arr.push(e.sectionCompSf);


        // Status attribute has special style

        // console.log("HERE STATUS", authorized);
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




        // ACTION COL
        arr.push(`
            <div id="view-btn" class="g-1">
                <a class="btn text-primary btn-sm view-btn" data-bs-toggle="tooltip"
                    data-bs-original-title="Voir le résultat"><span
                        class="fe fe-eye fs-14"></span></a>
            </div>
            `)



        finalArr.push(arr);
    })

    return finalArr;
}

function getFicheInfoFromArr(ficheId) {

    for (var i = 0; i < fichesArrJson.length; i++) {
        let ficheEva = fichesArrJson[i];

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

function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
}

// ADD EVENT LISTENERS TO ACTION BTN
$("#btn-assessment-sus").click(function (e) {

    // ADD LOADER TO BTN
    // addLoaderToBtn("#btn-assessment-sus");

    if (assessmentJson.status === "SUSPENDED") {


        showModal("confirm", "Confirmer l'action", `
        Vous êtes sur le point de reprendre cette assessment. Après la confimation, tous les managers ont pu terminer leurs évaluations non terminées.
        `, "", {
            "text": "Reprise de l'assessment",
            "color": "warning",
            "id": "dqz1",
            "hasFermerBtn": true
        }, function () {
            // alert("Assessment terminer");

            // CHANGE THE STATUS TO LANCHED
            assessmentJson.status = "LANCHED";

            // SAVE THE RESULT TO DB
            updateAssessment(assessmentJson).then((success) => {

                // REDIRECT TO THE ASSESSMENT PAGE 
                if (success.hasOwnProperty("message")) {

                    // SHOW ERROR MODAL
                    showModal("error", "Erreur", success.message, "", {
                        "text": "Revenir à l'acceuil",
                        "color": "danger",
                        "id": "dqz1"
                    }, function () {

                        //  REDIRECT TO THE ASSESSMENT PAGE
                        redirectTo("./assesment-result.html", 1000);
                    });

                } else {

                    // SHOW SUCCESS MDOAL
                    showModal("success", "Succès", "La campagne d'assessment est maintenant repris. Tous les managers peuvent compléter leurs évaluations", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "success",
                        "id": "dqz1"
                    }, function () {


                        //  REDIRECT TO THE ASSESSMENT PAGE
                        redirectTo("./assesment-result.html", 1000);
                    });
                }
                // })


            }, {
                "padding": "p-5",
                "textAligenement": "text-start"
            })
        });

    } else {
        // SHOW CONFIRM SUSPEND MODAL
        showModal("confirm", "Confirmer l'action", `
    Vous êtes sur le point de mettre fin à cette évaluation ! Avant de confirmer cette action, veuillez vous assurer de ce qui suit :
    <ul class="list-style-1">
        <li>Tous les managers ont complété leurs fiches d'évaluations.</li>
        <li> LES MANAGERS NE SONT PAS EN TRAIN D'ESSAYER DE VALIDER LES FICHES D'ÉVALUATIONS.</li>
    </ul> <br>
    Lorsque vous confirmez cette action : 
    <ul class="list-style-1">
        <li>Les managers ne pourront plus évaluer les fiches d'évaluations laissées</li>
        <li>Si un manager est en train de valider un dossier, son résultat ne comptera pas.</li>
    </ul>
     
    `, "", {
            "text": "Suspendre l'assessment",
            "color": "warning",
            "id": "dqz1",
            "hasFermerBtn": true
        }, function () {
            // alert("Assessment terminer");

            // CHANGE THE STATUS TO SUSPEND
            assessmentJson.status = "SUSPENDED";

            // SAVE THE RESULT TO DB
            updateAssessment(assessmentJson).then((success) => {

                // REMOVE LOADER FROM BTN
                deleteLoaderToBtn("#btn-assessment-sus");

                // REDIRECT TO THE ASSESSMENT PAGE 
                if (success.hasOwnProperty("message")) {

                    // SHOW ERROR MODAL
                    showModal("error", "Erreur", success.message, "", {
                        "text": "Revenir à l'acceuil",
                        "color": "error",
                        "id": "dqz1"
                    }, function () {

                        //  REDIRECT TO THE ASSESSMENT PAGE
                        redirectTo("./assesment-result.html", 1000);
                    });

                } else {

                    // SHOW SUCCESS MDOAL
                    showModal("success", "Succès", "La campagne d'assessment est maintenant suspendu. Tous les résultats sont enregistrés avec succès", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "success",
                        "id": "dqz1"
                    }, function () {


                        //  REDIRECT TO THE ASSESSMENT PAGE
                        redirectTo("./assesment-result.html", 1000);
                    });
                }
                // })


            }, {
                "padding": "p-5",
                "textAligenement": "text-start"
            })
        });
    }


});


$("#btn-assessment-terminate").click(function (e) {

    // ADD LOADER TO BTN
    // addLoaderToBtn("#btn-assessment-terminate");

    // SHOW CONFIRM TERMINATE MODAL
    showModal("confirm", "Confirmer l'action", `
    Vous êtes sur le point de mettre fin à cette évaluation ! Avant de confirmer cette action, veuillez vous assurer de ce qui suit :
    <ul class="list-style-1">
        <li>Tous les managers ont complété leurs fiches d'évaluations.</li>
        <li> LES MANAGERS NE SONT PAS EN TRAIN D'ESSAYER DE VALIDER LES FICHES D'ÉVALUATIONS.</li>
    </ul> <br>
    Lorsque vous confirmez cette action : 
    <ul class="list-style-1">
        <li>Les managers ne pourront plus évaluer les fiches d'évaluations laissées</li>
        <li>Si un manager est en train de valider un dossier, son résultat ne comptera pas.</li>
    </ul>
     
    `, "", {
        "text": "Terminer l'assessment",
        "color": "danger",
        "id": "dqz1",
        "hasFermerBtn": true
    }, function () {
        // alert("Assessment terminer");

        // CHANGE THE STATUS TO SUSPEND
        assessmentJson.status = "ENDED";

        // SAVE THE RESULT TO DB
        updateAssessment(assessmentJson).then((success) => {

            // REMOVE LOADER FROM BTN
            deleteLoaderToBtn("#btn-assessment-terminate");

            // REDIRECT TO THE ASSESSMENT PAGE 
            if (success.hasOwnProperty("message")) {

                // SHOW ERROR MODAL
                showModal("error", "Erreur", success.message, "", {
                    "text": "Revenir à l'acceuil",
                    "color": "error",
                    "id": "dqz1"
                }, function () {

                    //  REDIRECT TO THE ASSESSMENT PAGE
                    redirectTo("./assesment-result.html", 1000);
                });

            } else {

                // SHOW SUCCESS MDOAL
                showModal("success", "Succès", "La campagne d'assessment est maintenant terminé avec succès. Les résultats des fiches d'évaluations sont disponibles en bas.", "", {
                    "text": "Revenir à l'acceuil",
                    "color": "success",
                    "id": "dqz1"
                }, function () {


                    //  REDIRECT TO THE ASSESSMENT PAGE
                    redirectTo("./assesment-result.html", 1000);
                });
            }
        })


    }, {
        "padding": "p-5",
        "textAligenement": "text-start"
    })
});

$("#btn-assessment-inform").click(function (e) {
    console.log("here");
    showModal("info", "Information", "Cette fonctionnalité est en cours de test. Elle sera disponible dans la prochaine version de la plateforme. Merci de votre compréhension", "");
})

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
        $(modalHeaderId).parent().append(`<button aria-label="Close" class="btn btn-primary mx-4 btn-${color} pd-x-25"
        data-bs-dismiss="modal">Fermer</button>`);
    }


    var myModal = new bootstrap.Modal(document.getElementById(modalId));
    $(modalId).modal(
        {
            backdrop: 'static',
            keyboard: false
        }
    )

    // SET HEADER
    $(modalHeaderId).text(header);

    // SET CONTENT
    $(modalContentId).html(content)

    myModal.show();

}

async function updateAssessment(json) {
    let url = "http://localhost:8080/preassessment/api/v1/assessment/status/" + json.id;

    return fetch(url, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json)
    }).then(
        result => result.json
    )
        .then(
            success => success
        )
        .catch(
            error => console.log(error)
        )
}


function redirectTo(url, timeInMilliseconds) {
    setTimeout(function () {
        let currentUrl = window.location.href;

        window.location.href = url;
    },
        timeInMilliseconds);

}

function addLoaderToBtn(btnId) {

    // ADD LOADER HTML ELEMENT
    $(btnId).prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
}

function deleteLoaderToBtn(btnId) {

    // REMOVE LOADER HTML ELEMENT
    $(btnId).find("span").remove();
}


// THIS FUNCTION CHECKS ONLY THE PREFIX , NOT YET THE SUFFIX
function filterCollorateursByBpr(list, prefix, suffix) {

    let finalArr = [];
    console.log(prefix, suffix);

    finalArr = list.filter((fiche, index) => {

        let affectationCode = fiche.collaborateur.affectationCode + "";
        console.log(affectationCode);

        // console.log("Matricule : " + mat);

        if (prefix.length != 0) {

            for (var i = 0; i < prefix.length; i++) {
                let code = prefix[i] + "";

                console.log("Code : " + code);

                // ITERATE OVER CODE
                let counter = 0;
                for (var j = 0; j < code.length; j++) {

                    console.log(affectationCode[j], code[j], affectationCode[j] == code[j])

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

    console.log(finalArr);

    return finalArr;

}

function removeElements(arrIds) {
    if (arrIds.length != 0) {
        arrIds.map((id, index) => {
            $(id).remove();
        });
    }

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