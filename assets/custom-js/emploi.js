// MAIN ARRAYS
let emploiJSON = {};
let niveauxArray = [];


// MIDLLE ARRAYS
let responsabilitesArray = [];
let exigencesArray = [];
let marqueursArray = [];
let competencesArray = [];
// let competenceNameArray = [];

// USED TO PASS DATA TO SELECT2
let selectionData = [];

let fetchCompetencesArray = [];



let lastEditedInputs = {
    "exigence": -1,
    "marqueur": -1,
    "competence": -1,
    "glossaire": -1,
    "responsabilites": [-1, -1],
    "targetedRow": null
}
var currentNiveauIndex = 0;

const inputEmploiName = document.querySelector("#input-name-emploi");
const inputEmploiFiliere = document.querySelector("#input-filiere-emploi");
const inputEmploiSousFiliere = document.querySelector("#input-sousFiliere-emploi");
const inputEmploiDateMaj = document.querySelector("#input-date-emploi");
const inputEmploiVocation = document.querySelector("#input-vocation-emploi");



const btnAddResponsabilite = document.querySelector("#btn-add-res");
const btnAddExigence = document.querySelector("#btn-add-exigence");
const btnAddMarqueur = document.querySelector("#btn-add-marqueur");
const btnAddCompetence = document.querySelector("#btn-add-competence");

const btnDeleteNiveau = document.querySelector("#btn-delete-niveau");
const btnAddNiveau = document.querySelector("#btn-add-niveau");

const btnConfirmDeleteNiveau = document.querySelector("#confirm-delete-niveau");



let niveauCounter = 1;

let focusedNiveauContainer = document.querySelector(".niveau-container");

// MAIN INITIALIZATION CODE

// STEP 1 : CHECK URL IN ORDER TO REMOVE ANY EMPLOI FROM LOCALSTORAGE
if (!weEditEmploi(window.location.href)) {
    console.log("adding");
    localStorage.removeItem("emploi");
}

// STEP 2 : GET THE LIST OF COMPETENCES
getListCompetences().then((success) => {

    fetchCompetencesArray = success;
    // competenceNameArray = getNameCompetence(competencesArray);
    console.log(fetchCompetencesArray);

    addListenersToNewNiveau(focusedNiveauContainer);

    selectionData = getCompetencesDataSource(fetchCompetencesArray);


    $("#input-nom-competence").select2({
        data: selectionData
    })

}).then(() => {

    // LANCH EDIT SCRIPT IF IT EXIST

    if (localStorage.getItem("emploi") != null) {
        lanchEditScript();
    }
});

// END OF INITIALIZATION




btnAddResponsabilite.addEventListener('click', (e) => {
    let inputCatRes = document.querySelector("#input-categorie-responsabilites");
    let inputResValeur = document.querySelector("#input-valeur-responsabilites");

    // CHECK FOR MULTIPLE VALUES
    let values = inputResValeur.value.replace(/(\s|•)+/g, ' ').trim().split(";");
    let resJson;

    // REMOVE EDIT-EFFECT;
    removeEditEffect();

    if (values.length == 1) {
        resJson = {
            "categorie": inputCatRes.options[inputCatRes.selectedIndex].value,
            "valeur": inputResValeur.value
        }
    } else {
        resJson = values.map((e, i) => {
            return {
                "categorie": inputCatRes.options[inputCatRes.selectedIndex].value,
                "valeur": e
            }
        });

    }


    if (lastEditedInputs.responsabilites[0] !== -1 && lastEditedInputs.responsabilites[1] !== -1) {
        let catIndex = lastEditedInputs.responsabilites[0];
        let resIndex = lastEditedInputs.responsabilites[1];

        responsabilitesArray[catIndex]["valeur"][resIndex] = inputResValeur.value;

        parseResToTable(responsabilitesArray);

        // ADD EFFECT
        addEditEffectToSectionRow(null, "responsabilite", responsabilitesArray[catIndex]["valeur"][resIndex]);

        //INITIALIZE THE INDEX
        lastEditedInputs.responsabilites = [-1, -1];

    } else {

        if (values.length == 1) {
            responsabilitesArray = categorizeArray(responsabilitesArray, resJson);
        } else {

            resJson.map((e, i) => {
                responsabilitesArray = categorizeArray(responsabilitesArray, e);
            })
        }

        parseResToTable(responsabilitesArray);

    }
    // responsabilitesArray = categorizeArray(responsabilitesArray, resJson);

    // Initilize the inputs
    inputCatRes.removeAttribute("disable");
    inputResValeur.value = "";



})

// btnConfirmDeleteNiveau.addEventListener("click", (e) => {

//     // console.log("HERE WE GO");
//     // console.log(currentNiveauIndex);;

//     if (currentNiveauIndex === 0) {

//     } else {

//         // DELETE THE NIVEAU ENTRIE FROM NIVEAUX-ARRAY
//         // console.log(Array.from(document.querySelectorAll(".niveau-container")).indexOf(container));
//         niveauxArray.splice(currentNiveauIndex, 1);



//         // DELETE THE NIVEAU CONTAINER
//         let currentNiveauContainerArray = Array.from(document.querySelectorAll(".niveau-container"));
//         let currentNiveauContainer = currentNiveauContainerArray[currentNiveauIndex];
//         currentNiveauContainer.remove();

//         niveauCounter--;

//         // UPDATE VARIABLES ON THE CURRENT NIVEAU CONTAINER
//         focusedNiveauContainer = lastNiveauContainer();
//         currentNiveauIndex = niveauCounter - 1;

//         // REMOVE DISABLE EFFECT ON THE LAST NIVEAU CONTAINER
//         clearDisableFromInputsFor(focusedNiveauContainer);


//     }

// })

$(".base-emploi-info").change(function (index) {

    this.classList.remove("is-invalid");

    switch (this.id) {
        case "input-name-emploi":
            emploiJSON["intitulé"] = this.value.toLowerCase();
            break;
        case "input-filiere-emploi":
            emploiJSON["filière"] = this.value;
            break;
        case "input-sousFiliere-emploi":
            emploiJSON["sous-filière"] = this.value;
            break;
        case "input-date-emploi":
            emploiJSON["date Maj"] = this.value;
            break;
        case "input-vocation-emploi":
            emploiJSON["vocation"] = this.value;
            break;
    }
    //console.log(emploiJSON);
})

$("#btn-emploi-save").click(function () {

    // WHEN THE USER CLICK DIRECTLY ON SAVE WHILE WE ARE IN THE LAST NIVEAU CONTAINER
    if (niveauxArray.length !== $(".niveau-container").length) {

        let niveauJson = {
            "level": niveauCounter,
            "exigences": exigencesArray,
            "marqueurs": marqueursArray,
            "competences": competencesArray
        };

        niveauxArray.push(niveauJson);
    }

    console.log(niveauxArray.length, $(".niveau-container").length);
    console.log(niveauxArray);

    if (checkInputsConstraints()) {
        emploiJSON["responsabilités"] = responsabilitesArray;
        emploiJSON["niveaux"] = niveauxArray;


        // console.log(generateEmploiJson(emploiJSON));


        // ADD LOADER TO SAVE BTN
        addLoaderToBtn("#btn-emploi-save");

        // REMOVE EVENT HANDLER;
        $("#btn-emploi-save").off();

        // 2 SCEANARIOS : SAVE NEW EMPLOI || EDIT A SAVED EMPLOI
        if (localStorage.getItem("emploi") != null) {

            // console.log(generateEmploiJson(emploiJSON));

            // REMOVE LOADER TO SAVE BTN
            deleteLoaderToBtn("#btn-emploi-save");


            // EDIT AN EMPLOI
            updateEmploi(generateEmploiJson(emploiJSON)).then((success) => {

                if (success.hasOwnProperty("message")) {
                    showModal("error", "Erreur", success.message + "", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "danger",
                        "id": "sdq1"
                    }, function () {
                        // REDIRECT TO THE LIST OF ASSESSMENTS
                        setTimeout(function () {
                            let currentUrl = window.location.href;

                            window.location.href = extractDomain(currentUrl) + "emploi/list";
                        }, 1000);
                    });
                } else {

                    // REMOVE EMPLOI FROM LOCALSTORAGE
                    localStorage.removeItem("emploi");

                    console.log(success);
                    showModal("success", "Succès", "la fiche d'emploi avec ces niveaux de sénioritées a été enregistrée avec succès. ", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "success",
                        "id": "sdq1"
                    }, function () {
                        // REDIRECT TO THE LIST OF ASSESSMENTS
                        setTimeout(function () {
                            let currentUrl = window.location.href;

                            window.location.href = extractDomain(currentUrl) + "emploi/list";
                        }, 1000);
                    });
                }


            });

        } else {

            // REMOVE LOADER TO SAVE BTN
            deleteLoaderToBtn("#btn-emploi-save");

            // SAVE A NEW EPLOI
            postEmploi(generateEmploiJson(emploiJSON)).then((success) => {

                if (success.hasOwnProperty("message")) {
                    showModal("error", "Erreur", success.message + " Veuillez remplir une nouvelle fiche d'emploi avec un nom différent", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "danger",
                        "id": "sdq1"
                    }, function () {
                        // REDIRECT TO THE LIST OF ASSESSMENTS
                        setTimeout(function () {
                            let currentUrl = window.location.href;

                            window.location.href = extractDomain(currentUrl) + "emploi/list";
                        }, 1000);
                    });
                } else {
                    showModal("success", "Succès", "La fiche d'emploi avec ces niveaux de sénioritées a été enregistrée avec succès. ", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "success",
                        "id": "sdq1"
                    }, function () {
                        // REDIRECT TO THE LIST OF ASSESSMENTS
                        setTimeout(function () {
                            let currentUrl = window.location.href;

                            window.location.href = extractDomain(currentUrl) + "emploi/list";
                        }, 1000);
                    });
                }


            });
        }




    }


})

function weEditEmploi(url) {
    let lastPart = url.split("/").slice(-1);
    if (lastPart[0] === "edit") {
        return true;
    } else {
        return false;
    }
}

function parseResToTable(responsabilitesArray) {

    let tableBody = document.querySelector("#responsabilites-table-body");

    // Initilize the table body

    tableBody.innerHTML = ``;
    // console.log(responsabilitesArray);
    for (var i = 0; i < responsabilitesArray.length; i++) {

        let valuesLength = responsabilitesArray[i]["valeur"].length;
        // console.log(responsabilitesArray);

        for (var j = 0; j < valuesLength; j++) {
            let tr = tableBody.insertRow(-1);

            if (j === 0) {
                let categorieCell = tr.insertCell(-1);
                categorieCell.setAttribute("rowspan", valuesLength);
                categorieCell.innerHTML = responsabilitesArray[i].categorie;

                let valueCell = tr.insertCell(-1);
                valueCell.innerHTML = responsabilitesArray[i]["valeur"][j];
                // console.log(responsabilitesArray[i]["valeur"][j]);

                let actionCell = tr.insertCell(-1);
                actionCell.innerHTML = `
                    <div class="g-2">
                        <a id="res-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
                            data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
                        <a id="res-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
                            data-bs-original-title="Delete"><span
                                class="fe fe-trash-2 fs-14"></span></a>
                    </div> 
                `;

            } else {
                let valueCell = tr.insertCell(-1);
                valueCell.innerHTML = responsabilitesArray[i]["valeur"][j];

                let actionCell = tr.insertCell(-1);
                actionCell.innerHTML = `
                    <div class="g-2">
                        <a id="res-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
                            data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
                        <a id="res-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
                            data-bs-original-title="Delete"><span
                                class="fe fe-trash-2 fs-14"></span></a>
                    </div> 
                `;
            }

        }


    }


    let allDeleteCatBtns = tableBody.querySelectorAll("#res-table-btn-delete");
    let allEditCatBtns = tableBody.querySelectorAll("#res-table-btn-edit");


    Array.from(allDeleteCatBtns).forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", (e) => {

            // WHEN THE SPAN ELEMENT IS FIRED

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            // SHOW A DELETE MODAL
            showModal("error", "Supprimer ce champ ?", "Êtes-vous sûr de vouloir supprimer ce champ de responsabilité ?", "", {
                "text": "Supprimer la responsabilité",
                "color": "danger",
                "id": "dfe1",
                "hasFermerBtn": true
            }, function () {


                let categoriesLength = [];
                console.log(categoriesLength);

                responsabilitesArray.forEach((categorie, index) => {
                    categoriesLength.push(categorie["valeur"].length);
                })

                let btnIndex = [...allDeleteCatBtns].indexOf(aElement);

                // DETERMINE CATEGORIE INDEX BASED ON THE NUMBER OF VALUES ON EACH CATEGORY
                let cateIndex;
                let resIndex;
                if (btnIndex < categoriesLength[0]) {
                    cateIndex = 0;
                    resIndex = btnIndex;
                } else if (btnIndex < categoriesLength[0] + categoriesLength[1]) {
                    cateIndex = 1;
                    resIndex = btnIndex - (categoriesLength[0]);

                } else if (btnIndex < categoriesLength[0] + categoriesLength[1] + categoriesLength[2]) {
                    cateIndex = 2;
                    resIndex = btnIndex - (categoriesLength[0] + categoriesLength[1]);

                } else {
                    cateIndex = 3;
                    resIndex = btnIndex - (categoriesLength[0] + categoriesLength[1] + categoriesLength[2]);
                }

                // console.log(btnIndex, cateIndex, resIndex);

                // console.log(competenceIndex);
                responsabilitesArray[cateIndex]["valeur"].splice(resIndex, 1);

                parseResToTable(responsabilitesArray);


                // SHOW SUCCESS NOTIFICATION
                showNotification("<b>succès :</b> Responsabilité supprimée", "success", "center");

            })


        })
    })


    Array.from(allEditCatBtns).forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {

            // WHEN THE SPAN ELEMENT IS FIRED

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let categoriesLength = [];
            //console.log(categoriesLength);

            responsabilitesArray.forEach((categorie, index) => {
                categoriesLength.push(categorie["valeur"].length);
            })

            let btnIndex = [...allEditCatBtns].indexOf(aElement);

            // DETERMINE CATEGORIE INDEX BASED ON THE NUMBER OF VALUES ON EACH CATEGORY
            let cateIndex;
            let resIndex;
            if (btnIndex < categoriesLength[0]) {
                cateIndex = 0;
                resIndex = btnIndex;
            } else if (btnIndex < categoriesLength[0] + categoriesLength[1]) {
                cateIndex = 1;
                resIndex = btnIndex - (categoriesLength[0]);

            } else if (btnIndex < categoriesLength[0] + categoriesLength[1] + categoriesLength[2]) {
                cateIndex = 2;
                resIndex = btnIndex - (categoriesLength[0] + categoriesLength[1]);

            } else {
                cateIndex = 3;
                resIndex = btnIndex - (categoriesLength[0] + categoriesLength[1] + categoriesLength[2]);
            }


            let inputCatRes = document.querySelector("#input-categorie-responsabilites");
            let inputResValeur = document.querySelector("#input-valeur-responsabilites");


            inputResValeur.value = responsabilitesArray[cateIndex]["valeur"][resIndex];
            inputCatRes.value = responsabilitesArray[cateIndex].categorie;

            // DISABLE CATEGORIE INPUT
            inputCatRes.setAttribute("disable", "");

            lastEditedInputs.responsabilites = [cateIndex, resIndex];



            console.log(btnIndex, cateIndex, resIndex);

            // console.log(competenceIndex);
            // responsabilitesArray[cateIndex]["valeur"].splice(resIndex, 1);

            // parseResToTable(responsabilitesArray);

        })
    })






}

function parseExigenceToTable(exigences, niveauContainer) {
    let tableBody = niveauContainer.querySelector("#exigence-table-body");

    // Initilize the table body

    tableBody.innerHTML = ``;

    for (var i = 0; i < exigences.length; i++) {

        let tr = tableBody.insertRow(-1);

        let valueCell = tr.insertCell(-1);
        valueCell.innerHTML = exigences[i].valeur;

        let actionCell = tr.insertCell(-1);
        actionCell.innerHTML = `
        <div class="g-2">
                <a id="exi-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
                <a id="exi-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Delete"><span
                        class="fe fe-trash-2 fs-14"></span></a>
            </div> 
    `;
    }

    // Click event listeners 
    let allDeleteCatBtns = tableBody.querySelectorAll("#exi-table-btn-delete");
    let allEditCatBtns = tableBody.querySelectorAll("#exi-table-btn-edit");


    Array.from(allDeleteCatBtns).forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", (e) => {

            // WHEN THE SPAN ELEMENT IS FIRED

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }


            // SHOW A DELETE MODAL
            showModal("error", "Supprimer l'éxigence ?", "Êtes-vous sûr de vouloir supprimer cette exigence ?", "", {
                "text": "Supprimer l'éxigence",
                "color": "danger",
                "id": "dfe1",
                "hasFermerBtn": true
            }, function () {


                let exigenceIndex = [...allDeleteCatBtns].indexOf(aElement);

                console.log(exigenceIndex, exigencesArray);
                exigencesArray.splice(exigenceIndex, 1);

                console.log(exigencesArray);

                parseExigenceToTable(exigencesArray, niveauContainer);

                // SHOW SUCCESS NOTIFICATION
                showNotification("<b>succès :</b> Exigence supprimée", "success", "center");

            })

        })
    })

    Array.from(allEditCatBtns).forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let exigenceIndex = [...allEditCatBtns].indexOf(aElement);
            console.log(exigenceIndex);

            let exigenceInput = niveauContainer.querySelector("#input-exigence-emploi");

            exigenceInput.value = exigencesArray[exigenceIndex].valeur;

            // // DELETE THE VALUE FROM THE ARRAY
            // exigencesArray.splice(exigenceIndex, 1);

            // ADD INDEX TO LASTEDITED VAR
            lastEditedInputs.exigence = exigenceIndex;


        })
    })



}

function parseMarqueurToTable(marqueurs, niveauContainer) {
    let tableBody = niveauContainer.querySelector("#marqueur-table-body");



    // Initilize the table body

    tableBody.innerHTML = ``;

    for (var i = 0; i < marqueurs.length; i++) {

        let tr = tableBody.insertRow(-1);

        let valueCell = tr.insertCell(-1);
        valueCell.innerHTML = marqueurs[i].valeur;

        let actionCell = tr.insertCell(-1);
        actionCell.innerHTML = `
        <div class="g-2">
                <a id="marq-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
                <a id="marq-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Delete"><span
                        class="fe fe-trash-2 fs-14"></span></a>
            </div> 
    `;
    }

    // Click event listeners 
    let allDeleteCatBtns = tableBody.querySelectorAll("#marq-table-btn-delete");
    let allEditCatBtns = tableBody.querySelectorAll("#marq-table-btn-edit");


    Array.from(allDeleteCatBtns).forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", (e) => {

            // WHEN THE SPAN ELEMENT IS FIRED

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }


            // SHOW A DELETE MODAL
            showModal("error", "Supprimer ce marqueur de séniorité ?", "Êtes-vous sûr de vouloir supprimer ce marqueur de séniorité ?", "", {
                "text": "Supprimer ce marqueur de séniorité",
                "color": "danger",
                "id": "dfe1",
                "hasFermerBtn": true
            }, function () {

                let marqueurIndex = [...allDeleteCatBtns].indexOf(aElement);

                console.log(marqueurIndex);
                marqueursArray.splice(marqueurIndex, 1);

                parseMarqueurToTable(marqueursArray, niveauContainer);

                // SHOW SUCCESS NOTIFICATION
                showNotification("<b>succès :</b> Marqueur de séniorité supprimée", "success", "center");

            })



        })
    })

    Array.from(allEditCatBtns).forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {

            // WHEN THE SPAN ELEMENT IS FIRED

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let marqueurIndex = [...allEditCatBtns].indexOf(aElement);
            console.log(marqueurIndex);

            let marqueurInput = niveauContainer.querySelector("#input-marqueur-emploi");

            marqueurInput.value = marqueursArray[marqueurIndex].valeur;

            // // DELETE THE VALUE FROM THE ARRAY
            // marqueursArray.splice(marqueurIndex, 1);

            // ADD INDEX TO LASTEDITED VAR
            lastEditedInputs.marqueur = marqueurIndex;




        })
    })


}

function parseCompetenceToTable(competences, niveauContainer) {
    let tableBody = niveauContainer.querySelector("#competence-table-body");

    // console.log(niveauContainer);

    // Initilize the table body

    tableBody.innerHTML = ``;

    for (var i = 0; i < competences.length; i++) {

        let tr = tableBody.insertRow(-1);

        let nameCell = tr.insertCell(-1);
        nameCell.innerHTML = competences[i].name;

        let categoryCell = tr.insertCell(-1);
        categoryCell.innerHTML = competences[i].type;

        let niveauCell = tr.insertCell(-1);
        niveauCell.innerHTML = competences[i].niveauRequis;

        let actionCell = tr.insertCell(-1);
        actionCell.innerHTML = `
        <div class="g-2">
                <a id="comp-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
                <a id="comp-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Delete"><span
                        class="fe fe-trash-2 fs-14"></span></a>
            </div> 
    `;
    }

    // Click event listeners 
    let allDeleteCatBtns = tableBody.querySelectorAll("#comp-table-btn-delete");
    let allEditCatBtns = tableBody.querySelectorAll("#comp-table-btn-edit");


    Array.from(allDeleteCatBtns).forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", (e) => {

            // GET THE TARGET NICEAU CONTAINER
            let targetIndex = [...document.querySelectorAll(".niveau-container")].indexOf(niveauContainer);

            // WHEN THE SPAN ELEMENT IS FIRED

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            // SHOW A DELETE MODAL
            showModal("error", "Supprimer la compétence ?", "Êtes-vous sûr de vouloir supprimer cette compétence ?", "", {
                "text": "Supprimer la compétence",
                "color": "danger",
                "id": "dfe1",
                "hasFermerBtn": true
            }, function () {


                let competenceIndex = [...allDeleteCatBtns].indexOf(aElement);

                console.log(competenceIndex);

                if (targetIndex !== niveauCounter) {

                } else {
                    competencesArray.splice(competenceIndex, 1);
                }
                competencesArray.splice(competenceIndex, 1);

                parseCompetenceToTable(competencesArray, niveauContainer);

                // SHOW SUCCESS NOTIFICATION
                showNotification("<b>succès :</b> compétence supprimée", "success", "center");

            })



        })
    })

    Array.from(allEditCatBtns).forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {

            let aElement;
            if (e.target.tagName === "SPAN") {
                aElement = e.target.parentElement;
            } else {
                aElement = e.target;
            }

            let editWrapperElement = $(niveauContainer).find("#edit-competence-wrapper").get(0);

            // SCROLL DOWN TO EDIT COMPETENCE AREA
            $('html, body').animate({
                scrollTop: $(editWrapperElement).offset().top - 400
            }, 300);

            let competenceIndex = [...allEditCatBtns].indexOf(aElement);
            console.log(competenceIndex, competencesArray[competenceIndex]);

            let nameInput = niveauContainer.querySelector("#input-nom-competence");


            console.log(competencesArray[competenceIndex]);

            $(nameInput).val(getIdOfSelectedOption(selectionData, competencesArray[competenceIndex].name));
            $(nameInput).trigger('change');
            // $(categoryInput).val(competencesArray[competenceIndex].category);
            // $(niveauInput).val(competencesArray[competenceIndex].niveau);
            $(niveauContainer).find('#input-categorie-competence option[value="' + competencesArray[competenceIndex].type + '"]').prop('selected', true);

            $(niveauContainer).find('#input-niveau-competence option[value="' + competencesArray[competenceIndex].niveauRequis + '"]').prop('selected', true);





            // nameInput.value = competencesArray[competenceIndex].name;
            // categoryInput.value = competencesArray[competenceIndex].category;
            // niveauInput.value = competencesArray[competenceIndex].niveau;

            // // DELETE THE VALUE FROM THE ARRAY
            // competencesArray.splice(competenceIndex, 1);

            // ADD INDEX TO LAST EDITED-VARIABLE
            lastEditedInputs.competence = competenceIndex;
            lastEditedInputs.targetedRow = $(aElement).closest("tr");




        })
    })



}



function lastNiveauContainer() {
    let niveaux = Array.from(document.querySelectorAll(".niveau-container"));

    return niveaux.at(-1);
}

function addListenersToNewNiveau(container) {

    const btnAddExigence = container.querySelector("#btn-add-exigence");
    const btnAddMarqueur = container.querySelector("#btn-add-marqueur");
    const btnAddCompetence = container.querySelector("#btn-add-competence");

    const btnDeleteNiveau = container.querySelector("#btn-delete-niveau");

    const btnEditNiveau = container.querySelector("#btn-edit-niveau");
    const btnAddNiveau = container.querySelector("#btn-add-niveau");



    // ADD DATA-INDEX TO SELECT ELEMENT => 
    // console.log($("#input-nom-competence").last());
    $(".nom-competence").last().attr("data-index", currentNiveauIndex.toString());

    if (currentNiveauIndex !== 0) {
        console.log(currentNiveauIndex + "---" + "select2 done")
        $(".niveau-container").last().find("#input-nom-competence").select2({
            data: selectionData
        });

    }


    btnEditNiveau.addEventListener("click", (e) => {

        // WHEN THE SPAN ELEMENT IS FIRED

        let btnElement;
        if (e.target.tagName === "I") {
            btnElement = e.target.parentElement;
        } else {
            btnElement = e.target;
        }
        //console.log(container);


        // INITIALIZE ALL THE EDIT INDEX OF MARQUEURS - EXIGENCES - COMPETENCES
        lastEditedInputs.exigence = -1;
        lastEditedInputs.competence = -1;
        lastEditedInputs.marqueur = -1;
        lastEditedInputs.glossaire = -1;


        // CASE OF EXISTENCE OF 1 NIVEAU
        if (niveauCounter > 1) {

            // GET NIVEAU INDEX
            let clickedNiveauIndex = Array.from(document.querySelectorAll(".niveau-container")).indexOf(container);

            console.log(currentNiveauIndex, clickedNiveauIndex);

            let clickedNiveau;


            // SAVE ARRAYS TO NIVEAUX-ARRAY
            if (typeof (niveauxArray[currentNiveauIndex]) === 'undefined') { // SAVE THIS AS NEW ENTRY TO NIVEAUX ARRAY



                let niveauJson = {
                    "level": niveauCounter,
                    "exigences": exigencesArray,
                    "marqueurs": marqueursArray,
                    "competences": competencesArray
                };

                niveauxArray.push(niveauJson);

            } else {

                // console.log(getNiveauByIndex(currentNiveauIndex + 1, niveauxArray));
                clickedNiveau = getNiveauByIndex(currentNiveauIndex + 1, niveauxArray);

                clickedNiveau.exigences = exigencesArray;
                clickedNiveau.marqueurs = marqueursArray;
                clickedNiveau["competences"] = competencesArray;
            }

            // GET THE VALUES OF THE CLICKED NIVEAU FROM NIVEAUXARRAY

            clickedNiveau = getNiveauByIndex(clickedNiveauIndex + 1, niveauxArray);
            exigencesArray = clickedNiveau.exigences;
            marqueursArray = clickedNiveau.marqueurs;
            competencesArray = clickedNiveau["competences"];

            console.log(exigencesArray, marqueursArray, competencesArray);


            // CLEAR DISABLED-READONLY FROM INPUTS-BUTTONS-ANCHORS
            clearDisableFromInputsFor(container);
            clearDisableFromButtonsFor(container);

            // DISABLE INPUTS-SELECTS-BUTTONS-ANCHORS FOR THE PREVIOUS NIVEAU CONTAINER
            let previousNiveau = Array.from(document.querySelectorAll(".niveau-container"))[currentNiveauIndex];
            disableInputsFor(previousNiveau);
            disableButtonsFor(previousNiveau);


            // CHANGE CURRENT TO CLICKED
            currentNiveauIndex = clickedNiveauIndex;

        } else {
            // GET THE VALUES OF THE CLICKED NIVEAU FROM NIVEAUXARRAY
            exigencesArray = niveauxArray[0].exigences;
            marqueursArray = niveauxArray[0].marqueurs;
            competencesArray = niveauxArray[0]["competences"];
        }

        // CLEAR DISABLE FROM INPUT





    }

        , true)

    btnDeleteNiveau.addEventListener("click", (e) => {

        // WHEN THE SPAN ELEMENT IS FIRED
        let btnElement;
        if (e.target.tagName === "I") {
            btnElement = e.target.parentElement;
        } else {
            btnElement = e.target;
        }

        // GET NIVEAU INDEX
        let clickedNiveauIndex = Array.from(document.querySelectorAll(".niveau-container")).indexOf(container);

        currentNiveauIndex = clickedNiveauIndex;

        // A WINDOW IS SHOWN TO CONFIRM THE DELETE
        // var myModal = new bootstrap.Modal(document.getElementById('modaldemo5'));
        // myModal.show();

        showModal("error", "Supprimer le niveau de séniorité !", 'Vous essayez de supprimer ce niveau de séniorité. Après votre confirmation, vous ne pourrez pas restaurer les informations supprimées. Cliquez sur "Supprimer le niveau" pour confirmer', "", {
            "text": "Supprimer le niveau",
            "color": "danger",
            "id": "dfe1",
            "hasFermerBtn": true
        }, function () {


            // console.log("HERE WE GO");
            // console.log(currentNiveauIndex);;

            if (currentNiveauIndex === 0) {

            } else {

                // DELETE THE NIVEAU ENTRIE FROM NIVEAUX-ARRAY
                // console.log(Array.from(document.querySelectorAll(".niveau-container")).indexOf(container));
                niveauxArray.splice(currentNiveauIndex, 1);



                // DELETE THE NIVEAU CONTAINER
                let currentNiveauContainerArray = Array.from(document.querySelectorAll(".niveau-container"));
                let currentNiveauContainer = currentNiveauContainerArray[currentNiveauIndex];
                currentNiveauContainer.remove();

                niveauCounter--;

                // UPDATE VARIABLES ON THE CURRENT NIVEAU CONTAINER
                focusedNiveauContainer = lastNiveauContainer();
                currentNiveauIndex = niveauCounter - 1;


                // UPDATE MIDDLE VARIABLES
                exigencesArray = niveauxArray[currentNiveauIndex].exigences;
                marqueursArray = niveauxArray[currentNiveauIndex].marqueurs;
                competencesArray = niveauxArray[currentNiveauIndex].competences;


                // REMOVE DISABLE EFFECT ON THE LAST NIVEAU CONTAINER
                clearDisableFromInputsFor(focusedNiveauContainer);
                clearDisableFromButtonsFor(focusedNiveauContainer);


            }
        })

    })



    btnAddExigence.addEventListener('click', (e) => {


        let exigenceInput = container.querySelector("#input-exigence-emploi");

        // REMOVE EDIT-EFFECT;
        removeEditEffect();

        // CHECK FOR MULTIPLE VALUES
        let values = exigenceInput.value.split(".");

        let exigenceJson

        if (values.length == 1) {
            exigenceJson = {
                "valeur": exigenceInput.value
            }
        } else {
            exigenceJson = values.map((e, i) => {
                return {
                    "valeur": e
                }
            })
        }


        // CHECK IF THE VALUE ALREADY EXISTS
        if (lastEditedInputs.exigence !== -1) {
            let index = lastEditedInputs.exigence;
            exigencesArray[index] = exigenceJson;

            parseExigenceToTable(exigencesArray, container);

            // ADD EDIT EFFECT
            addEditEffectToSectionRow(container, "exigence", exigencesArray[index].valeur);




            //INITIALIZE THE INDEX
            lastEditedInputs.exigence = -1;



        } else {
            if (values.length == 1) {
                exigencesArray.push(exigenceJson);
            } else {
                exigencesArray.push(...exigenceJson);
            }

            parseExigenceToTable(exigencesArray, container);

        }


        exigenceInput.value = "";




    })

    btnAddMarqueur.addEventListener("click", (e) => {
        let marqueurInput = container.querySelector("#input-marqueur-emploi");


        // REMOVE EDIT-EFFECT;
        removeEditEffect();

        // CHECK FOR MULTIPLE VALUES
        let values = marqueurInput.value.split(".");

        let marqueurJson;
        if (values.length == 1) {
            marqueurJson = {
                "valeur": marqueurInput.value
            }
        } else {
            marqueurJson = values.map((e, i) => {
                return {
                    "valeur": e
                }
            });
        }




        // CHECK IF THE VALUE ALREADY EXISTS
        if (lastEditedInputs.marqueur !== -1) {
            let index = lastEditedInputs.marqueur;


            marqueursArray[index] = marqueurJson;

            parseMarqueurToTable(marqueursArray, container);


            // ADD EDIT EFFECT
            addEditEffectToSectionRow(container, "marqueur", marqueursArray[index].valeur);

            //INITIALIZE THE INDEX
            lastEditedInputs.marqueur = -1;




        } else {

            if (values.length == 1) {
                marqueursArray.push(marqueurJson);
            } else {
                marqueursArray.push(...marqueurJson);
            }

            parseMarqueurToTable(marqueursArray, container);

        }


        marqueurInput.value = "";



    })

    btnAddCompetence.addEventListener("click", (e) => {
        // let nameInput = container.querySelector("#input-nom-competence");
        let categoryInput = container.querySelector("#input-categorie-competence");
        let niveauInput = container.querySelector("#input-niveau-competence");

        // REMOVE EDIT-EFFECT;
        removeEditEffect();



        let competenceJson = {
            "name": $("select[data-index=" + currentNiveauIndex + "]").select2('data')[0].text,
            "type": categoryInput.options[categoryInput.selectedIndex].value,
            "niveauRequis": niveauInput.options[niveauInput.selectedIndex].value
        }

        if (lastEditedInputs.competence !== -1) {
            let index = lastEditedInputs.competence;

            competencesArray[index] = competenceJson;



            $(container).find('#input-categorie-competence option[value="' + competencesArray[index].type + '"]').prop('selected', false);
            $(container).find('#input-niveau-competence option[value="' + competencesArray[index].niveauRequis + '"]').prop('selected', false);

            $(container).find('#input-categorie-competence option[value="0"]').prop('selected', true);
            $(container).find('#input-niveau-competence option[value="0"]').prop('selected', true);

            parseCompetenceToTable(competencesArray, container);

            // ADD EDIT EFFECT
            addEditEffectToSectionRow(container, "competence", competencesArray[index].name);

            // SHOW SUCCESS NOTIFICATION
            showNotification("<b>succès :</b> compétence modifiée", "success", "right");

            //INITIALIZE THE INDEX + SELECTIONS
            lastEditedInputs.competence = -1;
            lastEditedInputs.targetedRow = null;


        } else {

            // CHECK FOR THE EXISTENCE OF THE COMPETENCE ON THE LIST
            if (!competenceDoesExist(competenceJson.name, competencesArray)) {

                competencesArray.push(competenceJson);

                parseCompetenceToTable(competencesArray, container);

                // SHOW SUCCESS NOTIFICATION

                showNotification("<b>succès :</b> compétence ajoutée", "success", "center");
            }

        }


        // Initilize the inputs
        // nameInput.value = "";

        //console.log(competenceJson);



        // parseCompetenceToTable(competencesArray, container);

        // // SHOW SUCCESS NOTIFICATION
        // showNotification("<b>succès :</b> compétence ajoutée", "success", "center");

    })



    btnAddNiveau.addEventListener("click", (e) => {

        // CHECK IF THE DATA OF CURRENT NIVEAU IS ALREADY EXISTED
        if (niveauxArray[currentNiveauIndex] == null) {
            let niveauJson = {
                "level": niveauCounter,
                "exigences": exigencesArray,
                "marqueurs": marqueursArray,
                "competences": competencesArray
            };

            niveauxArray.push(niveauJson);
        } else {

            // UPDATES THE VALUES
            niveauxArray[currentNiveauIndex].exigences = exigencesArray;
            niveauxArray[currentNiveauIndex].marqueurs = marqueursArray;
            niveauxArray[currentNiveauIndex]["competences"] = competencesArray;

        }


        // console.log(niveauxArray);

        // GET DATA OF THE PREVIOUS NIVEAU --- DIPRECATED
        exigencesArray = [...niveauxArray[niveauCounter - 1].exigences];
        marqueursArray = [...niveauxArray[niveauCounter - 1].marqueurs];
        competencesArray = [...niveauxArray[niveauCounter - 1].competences];

        // DISABLE INPUTS-BUTTONS-ANCHORS FOR THE PREVIOUS NIVEAU
        disableInputsFor(container);
        disableButtonsFor(container);

        // DELETE ADD NIVEAU BTN

        // CREATE A  NEW CONTAINER 
        let niveauContainer = document.querySelector(".niveau-container");
        let parent = niveauContainer.parentElement;

        let newNiveau = document.createElement("div");
        parent.appendChild(newNiveau);
        niveauCounter++;
        newNiveau.outerHTML = addNewNiveauHTML(niveauCounter);


        let lastNiveau = lastNiveauContainer();
        focusedNiveauContainer = lastNiveauContainer();


        currentNiveauIndex = niveauCounter - 1;
        addListenersToNewNiveau(lastNiveau);

        // PARSE DATA (EXIGENCES, MARQUEURS, COMPETENCES) TO THE NEW NIVEAU-CONTAINER
        parseExigenceToTable(exigencesArray, lastNiveau);
        parseMarqueurToTable(marqueursArray, lastNiveau);
        parseCompetenceToTable(competencesArray, lastNiveau);

    })




}

function addNewNiveauHTML(niveauCounter) {
    return `
    <div class="col-md-12 col-xl-12 niveau-container">
                <div class="card">
                    <div class="card-header ">
                        <h4 class="card-title col-sm-6" id="niveau-header">Niveaux de séniorité : ` + niveauCounter + `</h4>
                        <div class="btn-list col-sm-6 d-flex flex-row-reverse ">

                            <button type="button" class="btn btn-sm btn-icon btn-danger mx-2" id="btn-delete-niveau"><i
                                    class="fe fe-trash"></i></button>
                            <button type="button" class="btn btn-sm btn-icon btn-primary mx-2" id="btn-edit-niveau"><i
                                    class="fe fe-edit-3"></i></button>
                        </div>
                    </div>
                    <div class="card-body">
                        <form id="emploi-form">

                            <div class="form-group">
                                <label for="input-exigence-emploi" class="form-label">Exigences spécifiques de
                                    l’emploi</label>
                                <table class="table border  table-bordered my-3 ">
                                    <thead id="exigence-table-header">
                                        <tr>
                                            <th class="w-auto">Valeur</th>
                                            <th class="w-15">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="exigence-table-body"></tbody>
                                </table>
                                <label for="" class="form-label"></label>
                                <input type="text" id="input-exigence-emploi" class="form-control">
                                <div class="invalid-feedback">
                                    Ce champ ne doit pas être vide.
                                </div>
                                <div class="mt-3 text-center">

                                    <button id="btn-add-exigence" type="button"
                                        class="btn btn-icon me-2 bradius btn-success-light"> <i
                                            class="fe fe-plus"></i></button>

                                </div>
                            </div>

                            <div class="form-group">
                                <label for="input-marqueur-emploi" class="form-label">Marqueurs de séniorité</label>
                                <div class="table-responsive mt-2">
                                    <table class="table border  table-bordered my-3 ">
                                        <thead id="marqueur-table-header">
                                            <tr>
                                                <th class="w-auto">Valeur</th>
                                                <th class="w-15">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="marqueur-table-body"></tbody>
                                    </table>
                                </div>

                                <label for="" class="form-label"></label>
                                <input type="text" id="input-marqueur-emploi" class="form-control">
                                <div class="invalid-feedback">
                                    Ce champ ne doit pas être vide.
                                </div>
                                <div class="mt-3 text-center">

                                    <button id="btn-add-marqueur" type="button"
                                        class="btn btn-icon me-2 bradius btn-success-light"> <i
                                            class="fe fe-plus"></i></button>

                                </div>
                            </div>

                            <div class="form-group">
                                <label for="input-marqueur-emploi" class="form-label">Compétences requises</label>
                                <div class="table-responsive mt-2">
                                    <table class="table border  table-bordered my-3 ">
                                        <thead id="competence-table-header">
                                            <tr>
                                                <th class="w-auto">Nom</th>
                                                <th class="w-auto">catégorie</th>
                                                <th class="w-auto">Niveau requis</th>
                                                <th class="w-auto">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="competence-table-body"></tbody>
                                    </table>
                                </div>

                                <div id="edit-competence-wrapper" class="form-group form-row">
                                    <div class="col-sm-5">
                                        <label for="" class="form-label"></label>
                                        <select name="competence" id="input-nom-competence" class="form-control form-select nom-competence"></select>
                                            <div class="invalid-feedback">
                                                Ce champ ne doit pas être vide.
                                            </div>
                                    </div>
                                    <div class="col-sm-4">
                                        <label for="" class="form-label"></label>
                                        <select name="categorie-competence" id="input-categorie-competence"
                                            class="form-select form-control">
                                            <option value="0">CHOISIR UNE CATÉGORIE </option>
                                            <option value="Domaines de connaissance">Domaines de connaissance </option>
                                            <option value="Savoir-faire">Savoir-faire </option>
                                            <option value="Savoir-être">Savoir-être </option>
                                        </select>
                                        <div class="invalid-feedback">
                                            Ce champ ne doit pas être vide.
                                        </div>
                                    </div>
                                    <div class="col-sm-3">
                                        <label for="" class="form-label"></label>
                                        <select name="niveau-competence" id="input-niveau-competence"
                                            class="form-select form-control">
                                            <option value="0">CHOISIR UN NIVEAU </option>
                                            <option value="E">E </option>
                                            <option value="M">M </option>
                                            <option value="A">A </option>
                                            <option value="X">X </option>
                                        </select>
                                        <div class="invalid-feedback">
                                            Ce champ ne doit pas être vide.
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3 text-center">

                                    <button id="btn-add-competence" type="button"
                                        class="btn btn-icon me-2 bradius btn-success-light"> <i
                                            class="fe fe-plus"></i></button>

                                </div>
                            </div>

                            <button class="btn btn-primary mt-4 mb-0 " id="btn-add-niveau" role="button"
                                aria-pressed="true"><i class="fe fe-plus me-2"></i> Ajouter un autre niveau</button>

                        </form>
                    </div>
                </div>
            </div>
    
    `;
}

function categorizeArray(targetArray, element) {


    if (targetArray.length === 0) {
        targetArray.push({
            "categorie": element.categorie,
            "valeur": [
                element.valeur
            ]
        })
    } else {

        //CHECK IF THE CATEGORY IS ALREADY ON CLEANARRAY OR CREATE A NEW CATEGORY ON CLEANARRAY
        // console.log(hasSamePropertyValue(targetArray, element.categorie)[1]);
        if (hasSamePropertyValue(targetArray, element.categorie)[1]) {
            let categorieIndex = hasSamePropertyValue(targetArray, element.categorie)[0];

            targetArray[categorieIndex].valeur.push(element.valeur);
        } else {
            targetArray.push({
                "categorie": element.categorie,
                "valeur": [
                    element.valeur
                ]
            })
        }
    }


    return targetArray;
}

function hasSamePropertyValue(array, property) {
    let hasIt = false;
    let indexOfObject;
    array.every((object, index) => {
        hasIt = (object.categorie === property);

        if (hasIt) {
            indexOfObject = index;
        }

        return !hasIt;
    })

    return [indexOfObject, hasIt]
}

function saveToArray(array, element) {

}

function disableInputsFor(niveauContainer) {
    let inputs = niveauContainer.querySelectorAll("input");
    let selects = niveauContainer.querySelectorAll("select");

    Array.from(inputs).forEach((input) => {
        input.setAttribute("readonly", "");
    })

    Array.from(selects).forEach((select) => {
        select.setAttribute("disabled", "");
    })
}
function disableButtonsFor(niveauContainer) {

    console.log("diable for btns");

    // FOR BUTTONS
    // $(niveauContainer).find("button").attr("disabled","disabled");
    $(niveauContainer).find("button").each(function(index, element) {

        if (element.id === "btn-delete-niveau" || element.id === "btn-edit-niveau") {

        } else {
            $(element).attr("disabled","disabled");
        }
    });


    // FOR ANCHOR ELEMENT
    $(niveauContainer).find("a").attr("disabled","disabled");
}

function clearDisableFromInputsFor(niveauContainer) {
    let inputs = niveauContainer.querySelectorAll("input");
    let selects = niveauContainer.querySelectorAll("select");

    Array.from(inputs).forEach((input) => {
        input.removeAttribute("readonly");
    })

    Array.from(selects).forEach((select) => {
        select.removeAttribute("disabled");
    })
}

function clearDisableFromButtonsFor(niveauContainer) {
    
    // FOR BUTTONS
    $(niveauContainer).find("button").prop("disabled", false);

    // FOR ANCHORS
    $(niveauContainer).find("a").prop("disabled", false);
}



function checkInputsConstraints() {

    // CHECK INFORMATIONS DE BASE
    let baseInputs = checkBaseInformation();

    // console.log(checkBaseInformation());

    // CHECK THE LAST NIVEAU IF IT IS FILLED (MAYBE A NIVEAU DOES NOT HAVE ONE THE DESCRIBED FIELDS)
    let lastNiveauInputs = checkLastNiveauInputs();

    return baseInputs && lastNiveauInputs;




}

function checkBaseInformation() {

    let invalidFields = $(".base-emploi-info").filter(function () {
        if (this.value === '') {
            return true;
        }

    });
    console.log(invalidFields.length);
    if (invalidFields.length === 0) {
        return true;
    } else {
        invalidFields.addClass("is-invalid");
        return false;
    }
}

function checkLastNiveauInputs() {

    let allTableBodies = $(".niveau-container").last().find("tbody");


    let emptyTableBodies = $(".niveau-container").last().find("tbody").filter(function () {
        if (this.innerHTML === "") {
            return true;
        }
    });

    console.log(Array.from(allTableBodies).length, Array.from(emptyTableBodies).length);

    if (Array.from(allTableBodies).length === Array.from(emptyTableBodies).length) {

        // ADD IS-INVALID TO INPUTS FIELDS
        $(".niveau-container").last().find("input").addClass("is-invalid");
        $(".niveau-container").last().find("select").addClass("is-invalid");

        console.log($(".niveau-container").last().find("input"))

        return false;

    } else {
        return true;
    }




    return emptyTableBodies;

}


async function getListCompetences() {
    let url = "http://localhost:8080/preassessment/api/v1/competence/"

    return fetch(url, { // Your POST endpoint
        method: 'GET',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something

        }
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => success // Handle the success response object
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

async function postEmploi(emploiArr) {
    let url = "http://localhost:8080/preassessment/api/v1/emploi/add";

    return fetch(url, { // Your POST endpoint
        method: 'POST',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something            
            "Content-Type": "application/json"
        },
        body: JSON.stringify(emploiArr) // This is your file object
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => {

            // SHOW SUCCESS MODEL
            // var myModal = new bootstrap.Modal(document.getElementById('success'));
            // myModal.show();

            return success;


        } // Handle the success response object
    ).catch(
        error => {

            var myModal = new bootstrap.Modal(document.getElementById('modaldemo5'));
            $("#modal-error-header").text("Erreur : le serveur refuse d'enregistrer les données");
            $("#modal-error-content").text(error);
            myModal.show();

            console.log(error)
        } // Handle the error response object
    );
}

function getCompetencesDataSource(arr) {
    let index = 1;
    let data = [];

    arr.map((element) => {
        data.push({
            "id": index,
            "text": element.name
        });
        index++;
    });

    return data;
}


function generateEmploiJson(json) {

    let niveauArr = []
    json["niveaux"].map((niveau, index) => {
        niveauArr.push({
            "intitule": emploiJSON["intitulé"],
            "filiere": emploiJSON["filière"],
            "sousFiliere": emploiJSON["sous-filière"],
            "dateMaj": emploiJSON["date Maj"],
            "vocation": emploiJSON["vocation"],
            "responsabilites": emploiJSON["responsabilités"],
            "level": niveau["level"],
            "exigences": getArrFromJsonArr(niveau["exigences"]),
            "marqueurs": getArrFromJsonArr(niveau["marqueurs"]),
            "competencesRequis": niveau["competences"]
        })


    })
    console.log(
        {
            "id": emploiJSON.id === null ? null : emploiJSON.id,
            "intitule": niveauArr[0].intitule,
            "niveaux": niveauArr
        }
    );
    return {
        "id": emploiJSON.id === null ? null : emploiJSON.id,
        "intitule": niveauArr[0].intitule,
        "niveaux": niveauArr
    };
}

function getArrFromJsonArr(jsonArr) {
    let arr = [];

    jsonArr.map((e) => {
        arr.push(e.valeur);
    })

    return arr
}


function showModal(type, header, content, action, btnJson, eventHandler) {

    let modalId, modalHeaderId, modalContentId, color;

    // HIDE LOADER IF IT EXIST





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


    // var myModal = new bootstrap.Modal(document.getElementById(modalId));

    if (modalId != "loading") {
        // SET HEADER
        $(modalHeaderId).text(header);

        // SET CONTENT
        $(modalContentId).html(content);
    }


    // myModal.show();
    $("#" + modalId).modal('show');

}

function addLoaderToBtn(btnId) {

    // ADD LOADER HTML ELEMENT
    $(btnId).prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
}

function deleteLoaderToBtn(btnId) {

    // REMOVE LOADER HTML ELEMENT
    $(btnId).find("span").remove();
}


function getIdOfSelectedOption(arrOfSelection, selection) {

    for (var i = 0; i < arrOfSelection.length; i++) {
        let s = arrOfSelection[i];

        if (s.text === selection) {
            let f = s.id;
            console.log(f);
            return f.toString();
        }
    }

    return -1;
}

function showNotification(msg, type, position) {

    notif({
        "msg": msg,
        "type": type,
        "position": position
    });
}

function not1() {
    notif({
        msg: "<b>Success:</b> Well done Details Submitted Successfully",
        type: "success"
    });
}

function not2() {
    notif({
        msg: "<b>Oops!</b> An Error Occurred",
        type: "error",
        position: "center"
    });
}

function not3() {
    notif({
        type: "warning",
        msg: "<b>Warning:</b> Something Went Wrong",
        position: "left"
    });
}

function not4() {
    notif({
        type: "info",
        msg: "<b>Info: </b>Some info here.",
        width: "all",
        height: 100,
        position: "center"
    });
}

function not5() {
    notif({
        type: "error",
        msg: "<b>Error: </b>This error will stay here until you click it.",
        position: "center",
        width: 500,
        height: 60,
        autohide: false
    });
}

function not6() {
    notif({
        type: "warning",
        msg: "Opacity is cool!",
        position: "center",
        opacity: 0.8
    });
}

function removeEditEffect() {
    $(".edit-effect").removeClass("edit-effect");
}

function addEditEffectToSectionRow(containerWrapper, section, editedValue) {

    // GET THE ASSOCIATED ID FOR A SECTION
    let targetId = "";
    let targetedRowValue = editedValue;
    switch (section) {
        case "competence":
            targetId = "#competence-table-body";
            break;

        case "marqueur":
            targetId = "#marqueur-table-body";
            break;

        case "exigence":
            targetId = "#exigence-table-body"
            break;

        case "responsabilite":
            targetId = "#responsabilites-table-body";
            break;
    }

    let rows = null;

    if (containerWrapper === null) {
        rows = $(targetId).find("tr");
    } else {
        rows = $(containerWrapper).find(targetId).find("tr");
    }


    for (var i = 0; i < rows.length; i++) {
        let row = rows[i];

        console.log(section === "responsabilite");
        let rowValue = (section === "responsabilite") ? ($(row).find("td:not([rowspan])").first().text()) : ($(row).find("td").first().text());
        let selectedTd = (section === "responsabilite") ? ($(row).find("td:not([rowspan])")) : ($(row).find("td"));

        // console.log(i, rowValue, targetedRowValue, rowValue === targetedRowValue);

        if (rowValue === targetedRowValue) {
            console.log(row);
            console.log(i, rowValue, targetedRowValue, rowValue === targetedRowValue);
            selectedTd.addClass("edit-effect");
            console.log("effect added");

            // REMOVE EDIT EFFECT FROM TE FIRST TD

            break;

        } else {
            continue;
        }

    }
}

function competenceDoesExist(competenceName, arr) {
    /* IT RESTRICTS ADDING A COMPETENCE THAT IS ALREADY ADDED TO THE LIST */

    console.log(arr);
    for (var i = 0; i < arr.length; i++) {

        let competenceJson = arr[i];
        console.log(competenceJson.name);
        if (competenceJson.name === competenceName) {
            console.log("competence exist");
            // SHOW ERROR NOTIFICATION
            showNotification("<b>Erreur :</b> Le nom de la compétence est déjà ajouté à la liste", "error", "right");

            return true;
        }
    }


    console.log("competence does not exist");
    return false;

}

function getNiveauByIndex(index, arr) {
    console.log("heere :", index);

    for (var i = 0; i < arr.length; i++) {
        let niveau = arr[i];

        console.log(i, niveau);
        console.log(niveau.level == index);
        if (niveau.level === index) {
            return niveau;
        }
    }

    return null;
}

