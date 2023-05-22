import {
    get,
    set,
    getMany,
    setMany,
    update,
    del,
    clear,
    keys,
    values,
    entries,
    createStore,
} from '../plugins/idb-keyval/dist/index.js';
//methods return Promises
//default DB name is 'keyval-store' (like a document DB)
//default store name is 'keyval'    (like a Collection in the DB)


let assessment_ID = "";
const idb_config = "assessments_config";
console.log(assessment_ID);
const idb_result = "assessments_results";

(function init() {
    //app is running now
    //console.log(get);
    // let st = createStore('myDB', 'myStore');

    // set('user_id', Date.now())
    //   .then(() => {
    //     console.log('saved the user_id');
    //     //overwrites old values for the same key
    //   })
    //   .catch(console.warn);


    // MAIN VARIABLES
    let filesJsonArr = [];

    // INITIALIZE FILE UPLOADER
    $('#fine-uploader').fineUploader({
        template: 'qq-template-gallery',
        autoUpload: false,
        thumbnails: {
            placeholders: {
                waitingPath: './assets/plugins/fine-uploader/placeholders/waiting-generic.png',
                notAvailablePath: './assets/plugins/fine-uploader/placeholders/not_available-generic.png'
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


                            addToStoreWithId(idb_config, "files", fileJson, fileId);

                            replaceAsseementToContainer("info-container", fileJson.content);
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
                //deleteFileFromArr(name);
                deleteFromStoreById(idb_config, "files", id)
                    .then((dbName, storeName, id) => {
                        console.log(`Value with ID ${id} deleted from ${storeName} store in ${dbName} database`);
                    })
                    .catch((dbName, storeName, id, error) => {
                        console.error(`Error deleting value with ID ${id} from ${storeName} store in ${dbName} database: ${error}`);
                    });;
            }
        }
    });


    let db_config = null;
    let db_result = null;

    let objectStore = null;

    let DBOpenReq = indexedDB.open('assessments_config', 2);

    DBOpenReq.addEventListener('error', (err) => {
        //Error occurred while trying to open DB
        console.warn(err);
    });

    DBOpenReq.addEventListener('success', (ev) => {
        //DB has been opened... after upgradeneeded
        db_config = ev.target.result;
        console.log('success', db_config);
    });

    DBOpenReq.addEventListener('upgradeneeded', (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains("files")) {
            db.createObjectStore("files", { keyPath: 'id' });
        }
    })

    let DBOpenResult = indexedDB.open('assessments_results', 2);

    DBOpenResult.addEventListener('error', (err) => {
        //Error occurred while trying to open DB
        console.warn(err);
    });

    DBOpenResult.addEventListener('success', (ev) => {
        //DB has been opened... after upgradeneeded
        db_result = ev.target.result;
        console.log('success', db_result);
    });

    DBOpenResult.addEventListener('upgradeneeded', (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains("assessments")) {
            db.createObjectStore("assessments", { keyPath: 'id' });
        }
    });


    // CLICK EVENTLISTENER
    $("#config-btn").one("click", function (e) {

        // ADD LOADER TO BTN
        addLoaderToBtn("#config-btn");

        // GET ALL THE VALUES OF ASSESSMENTS-CONFIG
        getAllDataFromDB(idb_config)
            .then((result) => {
                console.log(result);

                var mergedFilesData = mergeFiles(result.files);

                clearAndReplaceStoreData(idb_config, "files", [mergedFilesData]).then(() => {

                    // HEAD TO THE LOGIN PAGE
                    window.location.href = './html/login.html';
                }).catch((e) => {

                })
            })

    })

    // PAGE REFRESH EVENT-LISTENER
    // Check if the section is empty on page refresh
    window.addEventListener('DOMContentLoaded', handlePageRefresh);

})();


function deleteFileFromArr(targetedFile) {
    return filesJsonArr.filter((element, index) => {
        if (element.fileName !== targetedFile) {
            return true;
        }
    })
}

function deleteFromStoreById(dbName, storeName, id) {
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

// THIS FUNCTION MERGES ALL THE FILES ' S JSON INTO ONE COMBONED JSON OBJECT
function mergeFiles(arr) {
    // GET THE LIST OF COLLABORATEURS OF THAT ASSESSMENT 

    //
    let mergedList = arr[0].content;

    arr.map((file, index) => {
        // console.log(file);
        console.log("FILE N : " + index);
        var fichesEvaluations = file.content.fichesEvaluations;
        fichesEvaluations.map((fiche, i) => {
            if (index == 0) {

                // SKIP THE FICHE REPERE
            } else {

                // GET THE CORRESPONDING FICHE IN MERGE
                // console.log(mergedList.fichesEvaluations);
                let corspFiche = getFicheById(mergedList.fichesEvaluations, fiche.ficheEvaluationId);
                if (corspFiche == -1) {
                    console.warn("MAKAYNACH")
                }

                // 2 CASES : SOIT LES DEUX ONT LE MEME STATUS ----> TAKE THE RECENT EVALUATION
                //          OR TAKE BASED ON STATUS
                if (fiche.status === corspFiche.status) {

                    // GET THE DATES
                    var dateFiche = new Date(fiche.evaluatedAt);
                    var corspFicheDate = new Date(corspFiche.evaluatedAt);

                    if (dateFiche < corspFicheDate) {
                        updateFiche(mergedList, corspFiche, fiche);
                    } else {

                    }


                } else {

                    switch (corspFiche.status) {
                        case "NE0":
                            if (fiche.status === "NE1" || fiche.status === "E0" || fiche.status === "E1") {

                                updateFiche(mergedList, corspFiche, fiche);
                            }
                            break;
                        case "E0":
                            if (fiche.status === "NE1" || fiche.status === "E1") {
                                updateFiche(mergedList, corspFiche, fiche);
                            }
                            break;
                        case "NE1":
                            if (fiche.status === "E1") {
                                updateFiche(mergedList, corspFiche, fiche);
                            }
                            break;
                        case "E1":

                            break;

                    }

                }

            }
        })
    });

    return mergedList;
}

function updateFiche(arr, oldOne, newOne) {
    return arr.map((e, i) => {
        if (e.assessmentId == oldOne.assessmentId) {
            return newOne;
        }
    })
}

function getFicheById(arr, id) {

    console.log("I M LOOKING FOR : " + id + " INSIDE :" + arr);

    for (let i = 0; i < arr.length; i++) {
        let fiche = arr[i];

        if (fiche.ficheEvaluationId === id) {
            return fiche;
        }
    }
    return -1;
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

async function deleteFromStore(dbName, storeName, nameValue) {
    try {
        const keys = await getAllKeys(storeName);

        for (const key of keys) {
            const value = await get(key, storeName);

            if (value && value.name === nameValue) {
                await del(key, storeName);
                console.log(`Deleted ${key} from ${storeName} store in ${dbName} database`);
            }
        }

        console.log(`Deletion complete`);
    } catch (err) {
        console.error(`Error while deleting from ${storeName} store in ${dbName} database: ${err}`);
    }
}


function getAllDataFromDB(dbName) {
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

function checkFileName(json, name) {
    try {
        const parsedJSON = JSON.parse(json);
        const { name: jsonName } = parsedJSON;

        if (jsonName === name) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return false;
    }
}

async function checkAndCreateStore(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            console.log("ON-UPGRADE");

            const db = event.target.result;


        };

        request.onsuccess = (event) => {
            console.log("ON-SUCCESS");

            // Database opened successfully
            const db = event.target.result;
            db.close();
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function replaceAsseementToContainer(containerId, json) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Campagne d'assessment :</h4>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <label class="col-md-3 form-label">Campagne ID :</label>
          <div class="form-label col-md-9">
            ${json.assessmentId}
          </div>
        </div>

        <div class="row mb-4">
          <label class="col-md-3 form-label">BPRs :</label>
          <div class="form-label col-md-9">
            ${convertToBoxes(json.targetedDirection, "primary")}
          </div>
        </div>

        <div class="row mb-4">
          <label class="col-md-3 form-label">Emplois concernées :</label>
          <div class="form-label col-md-9">
            ${convertToBoxes(json.targetEmplois, "primary")}
          </div>
        </div>

        <div class="row mb-4">
          <label class="col-md-3 form-label">Date de lancement :</label>
          <div class="form-label col-md-9">
            ${json.startedAt}
          </div>
        </div>

        <div class="row mb-4">
          <label class="col-md-3 form-label">Date de fin :</label>
          <div class="form-label col-md-9">
            ${json.finishesAt}
          </div>
        </div>
      </div>
    </div>
  `;
}

function convertToBoxes(arr, color) {
    const formattedElements = arr.map((element) => {
        if (typeof element === 'object') {
            return `<span class="badge bg-${color} badge-sm me-1 mb-1 mt-1">${element.intitule}_${element.level}</span>`
        } else {
            return `<span class="badge bg-${color} badge-sm me-1 mb-1 mt-1">${element}</span>`
        }

    });
    return formattedElements.join('');
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

function showModal(type, header, content, action, btnJson, eventHandler) {

    let modalId, modalHeaderId, modalContentId, color;

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

    if (modalId != "loading") {
        // SET HEADER
        $(modalHeaderId).text(header);

        // SET CONTENT
        $(modalContentId).html(content);
    }


    myModal.show();

}

async function clearAndReplaceStoreData(dbName, storeName, newData) {
    handlePageRefresh().then(() => {
        addToStoreWithId(dbName,storeName,newData[0],0);
    })
}