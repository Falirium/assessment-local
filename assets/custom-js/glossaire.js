

let fileExcel = document.querySelector("#input-file");
let fileExcel2 = document.querySelector("#input-file2");

let competenceArray = [];
let matriceCompetenceJson = {
    "name": "",
    "createdAt": null,
    "updatesAt": null,
    "competences": []

};


// THESE VARIABLES ARE MIDDLEWARES FOR PARSING DATA FROM EXCEL TO COMPETENCEARR
let competenceNameArray = [];
let competenceDefArray = [];
let competenceLevelsDefArray = [];

let fileHasBeenProcessed = false;


let competenceEditIndex = -1;
let competenceDeleteIndex = -1;

let counter = 1;

let competenceTable;

// INITIALIZE THE DATATABLE
parseCompetencesToTable(competenceArray);


const btnAddGlossaire = document.querySelector("#btn-add-competence");
// const btnConfirmDeleteNiveau = document.querySelector("#confirm-delete-niveau");
const btnAddFile = document.querySelector("#btn-add-file");
const btnAddFile2 = document.querySelector("#btn-re-add-file");
const btnSaveMatrice = document.querySelector("#btn-competence-save");


btnAddFile.addEventListener("click", (e) => {


    // BEHANVIOUR : ADD A LIST OF COMPETENCE FROM AN EXCEL FILE TO THE LIST ON THE TABLE

    // CHECK IF THE DATA-TABLE IS ALREADY INITILIZED

    // if (fileExcel.files.length != 0 && fileHasBeenProcessed) {

    //     // SHOW A WARNING MODAL
    //     showModal("warning", "Attention !", 'Vous ne pouvez pas ajouter une nouvelle liste de compétences sans sauvegarder la liste sur la table. Cliquez sur le bouton "Enregistrer" pour sauvegarder la liste.')
    // } else {

    //     // STEP 1 : SHOW INPUT FILE MODAL
    //     // STEP 2 : GET DATA  FROM THE FILE AND PUSH IT TO COMPETENCE-ARRAY
    //     // STEP 3 : RE-INITILIZE THE DATATABLE WITH NEW DATA
    //     showFileInputModal();
    // }

    showFileInputModal(1);

})

btnAddFile2.addEventListener("click", (e) => {
    showFileInputModal(2);
})


function showFileInputModal(type) {
    var myModal = null;
    if (type === 1) {
        myModal = new bootstrap.Modal(document.getElementById('input-modal'));
    } else if (type === 2) {
        myModal = new bootstrap.Modal(document.getElementById('input-modal2'));

    }

    myModal.show();
}


// EVENT LISTNER ON NAME INPUT
$("#input-name-matrice").change(function (e) {
    matriceCompetenceJson.name = e.target.value;
    console.log(matriceCompetenceJson.name);
})

// EVENT LISTNER ON CREATED DATE INPUT
$("#input-create-date").change(function (e) {
    matriceCompetenceJson.createdAt = e.target.value;
    console.log(matriceCompetenceJson.createdAt);
})

// SAVE THE LIST INTO THE DATABASE
$(btnSaveMatrice).click(function (e) {



    // STEP 1 : VERIFY IF ALL THE FIELD ARE FILLED
    if (!checkMatriceBasics()) {
        showModal("error", "Erreur", "Certains informations concernant la matrice ne sont pas remplis. Essayer de les remplir", "");
    } else if (!checkForCompetenceArray()) {

        showModal("error", "Erreur", "La liste des compétences est vide. Essayer d'ajouter des compétences.", "");

    } else if (!checkCompetencesLevelsSection()) {
        showModal("error", "Erreur", "Les définitions de chaque niveau ne doivent pas être vide. Essayer de les remplir.", "");

    } else {  // STEP 2 : SAVE NEW LISTS OF COMPETENCES


        // ADD LOADER TO SAVE BTN
        addLoaderToBtn("#btn-competence-save");


        // DISABLE THE EVENTHANDLER
        $(this).off(e);

        // UPDATE MATRICE-COMPETENCE JSON
        let timeNow = new Date();
        matriceCompetenceJson.updatesAt = timeNow.toISOString().split('T')[0];
        matriceCompetenceJson.competences = competenceArray;

        // console.log(matriceCompetenceJson);

        // 2 SCENARIOS : SAVE NEW ENTITY OR UPDATE AN EXISTANT ENTITY
        if (localStorage.getItem("matriceCompetence") != null) {

            updateMatriceCompetence(matriceCompetenceJson).then((success) => {

                console.log(success);
                // SHOW SUCCESS MODEL        
                showModal("success", "Succès", "Les modifications sur la liste des compétences ont été sauvegardée avec succès, vous pouvez trouver les compétences lors de la création d'un emploi", "", {
                    "text": "Revenir à l'acceuil",
                    "color": "success",
                    "id": "ld1"
                }, function () {
                    //
                    localStorage.removeItem("matriceCompetence");
                    // REDIRECT TO THE LIST OF ASSESSMENTS
                    setTimeout(function () {
                        let currentUrl = window.location.href;

                        window.location.href = extractDomain(currentUrl) + "emploi/competence/list";
                    }, 1000);
                });


            });

            // REMOVE THE MATRICE FROM LOCAL STORAGE
            localStorage.removeItem("matriceCompetence");


        } else {

            postMatriceCompetences(matriceCompetenceJson).then((success) => {

                // DELETE LOADER FROM BTN
                deleteLoaderToBtn("#btn-competence-save");

                // SHOW SUCCESS MODEL        
                showModal("success", "Succès", "La nouvelle liste de compétences a été sauvegardée avec succès, vous pouvez trouver les compétences lors de la création d'un emploi", "", {
                    "text": "Revenir à l'acceuil",
                    "color": "success",
                    "id": "lds1"
                }, function () {
                    // REDIRECT TO THE LIST OF ASSESSMENTS
                    setTimeout(function () {
                        let currentUrl = window.location.href;

                        window.location.href = extractDomain(currentUrl) + "emploi/competence/list";
                    }, 1000);
                });


            });

        }
    }




})


btnAddGlossaire.addEventListener("click", (e) => {

    // CHECK FIRSTABLE THE VALUES OF INPUTS
    if (!checkCompetencesLevelsSection()) {

        // SHOW ERROR
        showModal("error", "Erreur", "Les définitions de chaque niveau ne doivent pas être vide. Essayer de les remplir.", "");

    } else {

        let nomCompGlossaire = document.querySelector("#input-nom-competence-glossaire");
        let niveauCompGlassaire = Array.from(document.querySelectorAll("#input-niveau-competence-glossaire"));
        let defCompGlaossaire = Array.from(document.querySelectorAll(".input-level-def"));

        if (competenceEditIndex !== -1) {

            competenceArray[competenceEditIndex] = {
                "name": nomCompGlossaire.value,
                "definition": competenceArray[competenceEditIndex]["definition"],
                "niveaux": []
            }

            defCompGlaossaire.forEach((def, index) => {
                // console.log(niveauCompGlassaire[index].value, def.value, index)
                competenceArray[competenceEditIndex]["niveaux"].push({
                    "level": niveauCompGlassaire[index].value,
                    "definition": def.value
                })
            })

            console.log(competenceEditIndex, competenceArray);

            // INITIALIZE THE INDEX
            competenceEditIndex = -1;

            // SHOW ALERT NOTIFICATION
            showNotification("<b>succès :</b> compétence editée", "success", "right");

        } else {

            let competenceGlassaireJson = {
                "name": nomCompGlossaire.value,
                "definition": null,
                "niveaux": []
            }



            for (var i = 0; i < niveauCompGlassaire.length; i++) {
                let nivaeuJson = {
                    "level": niveauCompGlassaire[i].value,
                    "definition": defCompGlaossaire[i].value
                }

                competenceGlassaireJson["niveaux"].push(nivaeuJson);
            }

            competenceArray.push(competenceGlassaireJson);

            // SHOW ALERT NOTIFICATION
            showNotification("<b>succès :</b> compétence ajoutée", "success", "center");

        }


        // INITIALIZE THE INPUTS
        nomCompGlossaire.value = "";
        defCompGlaossaire.forEach((definition) => {
            definition.value = "";
        })


        // PARSE THE DATA TO THE TABLE
        parseCompetencesToTable(competenceArray);



        // ELIMINATE DISBALE PROPERTY
        $("#input-nom-competence-glossaire").prop('disabled', false);
    }


})
// ADD EVENT LISTENER TO DOWNLOAD BTN 
$("#confirm-delete-btn").click(function (e) {

    //SHOW MODAL
    showModal("info", "Cette fonctionnalité n'est pas disponible", "Nous travaillons sur cette fonctionnalité.");

})
// CLICK EVENT LISTENER ON DELETE BTN FOR ERROR MODAL
$("#confirm-delete-btn").click(function (e) {

    let action = $("#confirm-delete-btn").attr("data-action");

    if (action === "competence") {

        // CHECK IF THE INDEX 
        if (competenceDeleteIndex != -1) {

            competenceArray.splice(competenceDeleteIndex, 1);


            // INITIALIZE THE INDEX
            competenceDeleteIndex = -1;

            // PARSE THE UPDATED DATA TO THE TABLE
            parseCompetencesToTable(competenceArray);
        } else {


        }
    }

})




fileExcel.addEventListener("change", (e) => {

    // HIDE MODAL
    // var myModal = new bootstrap.Modal(document.getElementById('input-modal'));
    // myModal.hide();
    //console.log("lkdqj");
    $("#input-modal").modal('hide');

    // ADD LOADER ON THE PAGE
    $("#btn-add-file").addClass("btn-loading");

    // POPULATE GLOSSAIRE ARRAY

    parseExcelFile2(fileExcel, false);



})

fileExcel2.addEventListener("change", (e) => {

    $("#input-modal2").modal('hide');

    // ADD LOADER ON THE PAGE
    $("#btn-re-add-file").addClass("btn-loading");

    // POPULATE GLOSSAIRE ARRAY

    parseExcelFile2(fileExcel2, true);
})

// function parseGlossaireToTable(glossaire) {
//     let tableBody = document.querySelector("#glossaire-table-body");


//     // Initilize the table body

//     tableBody.innerHTML = ``;
//     for (var j = 0; j < glossaire.length; j++) {

//         // console.log(j,glossaire[j]["niveaux"]);

//         for (var i = 0; i < glossaire[j]["niveaux"].length; i++) {

//             if (typeof (glossaire[j]["niveaux"][i]) !== 'undefined') {

//                 // console.log(glossaire[j]["niveaux"][i]);

//                 let tr = tableBody.insertRow(-1);

//                 // if (i === 0) {
//                 //     let nameCell = tr.insertCell(-1);
//                 //     nameCell.setAttribute("rowspan", "4");
//                 //     nameCell.innerHTML = glossaire[j].name;

//                 //     let niveauCell = tr.insertCell(-1);
//                 //     niveauCell.innerHTML = glossaire[j]["niveaux"][i].level;

//                 //     let defCell = tr.insertCell(-1);
//                 //     defCell.innerHTML = glossaire[j]["niveaux"][i].definition;
//                 //     let actionCell = tr.insertCell(-1);
//                 //     actionCell.setAttribute("rowspan", "4");
//                 //     actionCell.innerHTML = `
//                 //         <div class="g-2">
//                 //             <a id="glo-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
//                 //                 data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
//                 //             <a id="glo-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
//                 //                 data-bs-original-title="Delete"><span
//                 //                     class="fe fe-trash-2 fs-14"></span></a>
//                 //         </div> 
//                 //     `;

//                 // } else {
//                 //     let niveauCell = tr.insertCell(-1);
//                 //     niveauCell.innerHTML = glossaire[j]["niveaux"][i].level;

//                 //     let defCell = tr.insertCell(-1);
//                 //     defCell.innerHTML = glossaire[j]["niveaux"][i].definition;
//                 // }
//                 let nameCell = tr.insertCell(-1);
//                 nameCell.innerHTML = glossaire[j].name;

//                 let niveauCell = tr.insertCell(-1);
//                 niveauCell.innerHTML = glossaire[j]["niveaux"][i].level;

//                 let defCell = tr.insertCell(-1);
//                 defCell.innerHTML = glossaire[j]["niveaux"][i]["definition"];
//                 let actionCell = tr.insertCell(-1);
//                 actionCell.innerHTML = `
//                             <div class="g-2">
//                                 <a id="glo-table-btn-edit" class="btn text-primary btn-sm" data-bs-toggle="tooltip"
//                                     data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
//                                 <a id="glo-table-btn-delete" class="btn text-danger btn-sm" data-bs-toggle="tooltip"
//                                     data-bs-original-title="Delete"><span
//                                         class="fe fe-trash-2 fs-14"></span></a>
//                             </div> 
//                         `;
//             }
//         }
//     }

//     // Click event listeners 
//     let allDeleteCatBtns = tableBody.querySelectorAll("#glo-table-btn-delete");
//     let allEditCatBtns = tableBody.querySelectorAll("#glo-table-btn-edit");

//     Array.from(allDeleteCatBtns).forEach((deleteBtn) => {
//         deleteBtn.addEventListener("click", (e) => {

//             // WHEN THE SPAN ELEMENT IS FIRED

//             let aElement;
//             if (e.target.tagName === "SPAN") {
//                 aElement = e.target.parentElement;
//             } else {
//                 aElement = e.target;
//             }

//             let glossaireIndex = [...allDeleteCatBtns].indexOf(aElement);



//             let competenceIndex = Math.floor(glossaireIndex / 4);
//             let levelIndex = glossaireIndex % 4;
//             competenceArray.splice(glossaireIndex, 1);

//             //console.log(competenceArray[competenceIndex].name, competenceArray[competenceIndex]["niveaux"][levelIndex])



//             showModal("error", "Vous voulez supprimer cette compétence ?", 'Confirmez votre décision de supprimer cette compétence, en cliquant sur le bouton "Oui".', "competence", {
//                 "text": "Oui",
//                 "color": "danger",
//                 "id": "dsl1"
//             }, function (e) {

//                 let action = $("#confirm-delete-btn").attr("data-action");

//                 if (action === "competence") {

//                     // CHECK IF THE INDEX 
//                     if (competenceDeleteIndex != -1) {

//                         competenceArray.splice(competenceDeleteIndex, 1);


//                         // INITIALIZE THE INDEX
//                         competenceDeleteIndex = -1;

//                         // PARSE THE UPDATED DATA TO THE TABLE
//                         parseCompetencesToTable(competenceArray);
//                     } else {


//                     }
//                 }

//             })




//         })
//     });

//     Array.from(allEditCatBtns).forEach((editBtn) => {
//         editBtn.addEventListener("click", (e) => {

//             // WHEN THE SPAN ELEMENT IS FIRED

//             let aElement;
//             if (e.target.tagName === "SPAN") {
//                 aElement = e.target.parentElement;
//             } else {
//                 aElement = e.target;
//             }

//             let glossaireIndex = [...allEditCatBtns].indexOf(aElement);



//             let competenceIndex = Math.floor(glossaireIndex / 4);
//             let levelIndex = glossaireIndex % 4;
//             // console.log(competenceArray[competenceIndex]["niveaux"][0]["definition"]);

//             $("#input-nom-competence-glossaire").val(competenceArray[competenceIndex].name);

//             $("#input-def-competence-e").val(competenceArray[competenceIndex]["niveaux"][0]["definition"]);
//             $("#input-def-competence-m").val(competenceArray[competenceIndex]["niveaux"][1]["definition"]);
//             $("#input-def-competence-a").val(competenceArray[competenceIndex]["niveaux"][2]["definition"]);
//             $("#input-def-competence-x").val(competenceArray[competenceIndex]["niveaux"][3]["definition"]);


//             competenceEditIndex = competenceIndex;



//             // parseGlossaireToTable(competenceArray, niveau);

//         })
//     })



// }

// THIS FUNCTION GETS DATA FROM EXCEL FILE AND RETURNS A PROMISE THAT PREPARE FINAL ARRAY HOLDING ALL THE COMPETENCES
async function parseExcelFile2(inputElement, addToTheList = false) {
    var files = inputElement.files || [];
    if (!files.length) return;
    var file = files[0];

    // console.time();
    var reader = new FileReader();

    reader.onloadend = function (event) {
        var arrayBuffer = reader.result;
        // var buffer = Buffer.from(arrayBuffer)
        // debugger

        var workbook = new ExcelJS.Workbook();
        // workbook.xlsx.read(buffer)
        workbook.xlsx.load(arrayBuffer).then(function (workbook) {
            console.timeEnd();
            // var result = ''

            // INITIALIZE SOME ARRAYS
            competenceNameArray = [];
            competenceDefArray = [];
            competenceLevelsDefArray = [];

            const sheet = workbook.getWorksheet('Matrice');
            const c1 = sheet.getColumn('D');
            // console.log(c1);
            // console.log(typeof (c1));



            c1.eachCell((c, row) => {
                if (c.value !== null && row !== 1) {
                    let valeur = c.value;
                    valeur = valeur.replace(/(\r\n|\n|\r)/gm, "");
                    competenceNameArray.push(valeur);
                    // console.log(valeur, row);
                }

            });

            const c2 = sheet.getColumn('E');

            c2.eachCell((c, row) => {
                if (c.value !== null && row !== 1) {
                    let valeur = c.value;
                    if (typeof (valeur) !== 'string') {
                        valeur = valeur["richText"][0].text;
                    }
                    // console.log(valeur, row);
                    valeur = valeur.replace(/(\r\n|\n|\r)/gm, "").trim();
                    competenceDefArray.push(valeur);
                }
            });

            const c3 = sheet.getColumn('F');

            c3.eachCell((c, row) => {
                if (c.value !== null && row !== 1) {
                    let valeur = c.value;
                    //console.log(valeur, row);
                    let level;
                    let levelDef;

                    if (typeof (valeur) === 'string') {
                        let arr = valeur.split(":");
                        level = arr[0].replace(/(\r\n|\n|\r|:)/gm, "").trim();
                        levelDef = arr[1].replace(/(\r\n|\n|\r|:)/gm, "").trim();

                    } else {
                        level = valeur["richText"][0].text;
                        let arr = level.split(":");
                        level = arr[0].replace(/(\r\n|\n|\r|:)/gm, "").trim();

                        levelDef = valeur["richText"][1].text;
                        levelDef = arr[1].replace(/(\r\n|\n|\r|:)/gm, "").trim() + levelDef.replace(/(\r\n|\n|\r|:)/gm, "").trim();
                    }



                    competenceLevelsDefArray.push({
                        "level": level,
                        "definition": levelDef
                    });
                }
            });


            competenceNameArray = [...new Set(competenceNameArray)];
            competenceDefArray = [...new Set(competenceDefArray)];
            competenceLevelsDefArray = [...new Set(competenceLevelsDefArray)];


            getGlossaireOfCompentence(competenceNameArray, competenceDefArray, competenceLevelsDefArray, addToTheList);

        })
            .then(function () {

                // //HIDE LOADER
                $("#btn-add-file").removeClass("btn-loading");
                $("#btn-re-add-file").removeClass("btn-loading");

                // PARSE COMPETENCE DATA TO THE DATATABLE
                parseCompetencesToTable(competenceArray);

                // UPDATE A VARIABLE
                fileHasBeenProcessed = true;
            })
            .catch(error => {
                // SHOW MODAL ERROR
                console.error(error);
                showModal("error", "Erreur de syntaxe", "Vérifiez que vous avez téléchargé le bon fichier de compétence et assurez-vous qu'il respecte le format de fichier standard. Si le problème persiste, veuillez contacter votre consultant DRH.", "", {
                    "text": "Revenir à l'acceuil",
                    "color": "danger",
                    "id": "sdq1"
                }, function () {
                    // REDIRECT TO THE LIST OF ASSESSMENTS
                    setTimeout(function () {
                        let currentUrl = window.location.href;

                        window.location.href = extractDomain(currentUrl) + "emploi/competence/list";
                    }, 1000);
                })

                // //HIDE LOADER
                $("#btn-add-file").removeClass("btn-loading");
            });
    };
    reader.readAsArrayBuffer(file);
}

// THIS FUNCTION GETS THE FINAL FORMAT OF THE ARRAY HOLDING ALL THE COMPETENCES ----> USED TO POST ARRAYS
function getGlossaireOfCompentence(names, defs, levels, mergeIt = false) {

    // INITIALIZE THE COMPETENCE ARRAY
    console.log(mergeIt);
    if (!mergeIt) {
        competenceArray = [];
    }

    console.log(competenceArray.length);

    names.map((e, index) => {
        let competenceJson = {
            "name": e,
            "definition": defs[index],
            "niveaux": []
        }
        for (var i = 0; i < 4; i++) {
            competenceJson["niveaux"].push(levels[0]);
            levels.shift();
        }

        competenceArray.push(competenceJson);
    })
}

// THIS FUNCTION IS TO CHECK IF ALL FIELDS ARE NOT EMPTY 
function fieldsAreChecked() {

    if ($("#input-name-matrice").val().trim() === "" || $("#input-create-date").val() === "" || competenceArray.length === 0) {

        showModal("error", "Erreur", "Certains champs ne sont pas remplis et sont nécessaires pour compléter l'enregistrement de la matrice.");

        // HIGHLIGHT THE EMPTY FIELDS
        if ($("#input-name-matrice").val().trim() === "") {

            $("#input-name-matrice").addClass("is-invalid");

        }

        if ($("#input-create-date").val() === "") {

            $("#input-create-date").addClass("is-invalid");

        }

        return false;
    }

    return true;
}

// THIS FUNCTION PARSES DATA OF COMPETENCEARRAY TO THE DATATABLE + IT ADDS EVENT LISTENERS TO ACTION BTNS
function parseCompetencesToTable(dataArr) {

    // DESTROY THE PREVIOUS TABLE
    if (competenceTable != null) {
        competenceTable.destroy();
    }



    // PROCESS THE DATA
    let dataSet = processCompetenceData4DataTable(dataArr);

    // INITIALIZE THE DATA TABALE
    // return new Promise((resolve, reject) => {

    let fileTitle = matriceCompetenceJson.name + "_At_" + new Date().toISOString().split("T")[0];

    // });
    competenceTable = $("#tbs6").DataTable({
        data: dataSet,
        pageLength: 4,
        lengthMenu: [4, 8, 16, 20, 24, 'All']
    });


    competenceTable.on('draw.dt', function () {


        console.log("finished drawing");
        // ADD EVENT LISTENERS TO ACTIONS BTNS OF DATATABLE

        let allDeleteCatBtns = $(".glo-table-btn-delete").get();

        // console.log($(".glo-table-btn-delete"));

        $(".glo-table-btn-delete").each(function (index, deleteBtn) {
            // console.log(index, deleteBtn);

            // REMOVE PREVIOUS EVENTHANDLER
            $(deleteBtn).off('click');

            // SET NEW CLICK EVENT LISTENER
            $(deleteBtn).click(function (e) {

                // WHEN THE SPAN ELEMENT IS FIRED

                let aElement;
                if (e.target.tagName === "SPAN") {
                    aElement = e.target.parentElement;
                } else {
                    aElement = e.target;
                }

                let competenceName = $(aElement).parents("td").siblings().slice(0, 1).text();

                let compFromArr = getCompetenceInfoFromArr(competenceName);

                competenceDeleteIndex = compFromArr.index;
                // console.log(compFromArr.competence, competenceArray[compFromArr.index]);

                // let glossaireIndex = [...allDeleteCatBtns].indexOf(aElement);



                // let competenceIndex = Math.floor(glossaireIndex / 4);
                // let levelIndex = glossaireIndex % 4;
                // competenceArray.splice(glossaireIndex, 1);

                // console.log(competenceIndex);

                // console.log(competenceArray[competenceIndex].name, competenceArray[competenceIndex]["niveaux"][levelIndex])



                showModal("error", "Confirmation", 'Confirmez la suppression de cette compétence, en cliquant sur le bouton "Supprimer la compétence".', "competence", {
                    "text": "Supprimer la compétence",
                    "color": "danger",
                    "id": "dsl1",
                    "hasFermerBtn": true
                    
                }, function (e) {

                    console.log(competenceDeleteIndex);

                    // CHECK IF THE INDEX 
                    if (competenceDeleteIndex != -1) {

                        competenceArray.splice(competenceDeleteIndex, 1);


                        // INITIALIZE THE INDEX
                        competenceDeleteIndex = -1;

                        // PARSE THE UPDATED DATA TO THE TABLE
                        parseCompetencesToTable(competenceArray);

                        // SHOW ALERT NOTIFICATION
                        showNotification("<b>succès :</b> compétence supprimée", "success", "right");
                    } else {


                    }


                })
            })

        })

        let allEditCatBtns = $(".glo-table-btn-edit").get();


        $(".glo-table-btn-edit").each(function (index, editBtn) {
            // console.log(index, editBtn);

            // REMOVE PREVIOUS EVENTHANDLER
            $(editBtn).off('click');

            // SET NEW CLICK EVENT LISTENER
            $(editBtn).click(function (e) {

                // WHEN THE SPAN ELEMENT IS FIRED

                let aElement;
                if (e.target.tagName === "SPAN") {
                    aElement = e.target.parentElement;
                } else {
                    aElement = e.target;
                }

                let competenceName = $(aElement).parents("td").siblings().slice(0, 1).text();

                let compFromArr = getCompetenceInfoFromArr(competenceName);
                console.log(competenceName, compFromArr);


                // PARSE VALUES OF CLICKED COMPETENCE ON THE INPUTS
                $("#input-nom-competence-glossaire").val(compFromArr.competence.name);
                $("#input-nom-competence-glossaire").prop('disabled', true);


                $("#input-def-competence-e").val(compFromArr.competence.niveaux[0]["definition"]);
                $("#input-def-competence-m").val(compFromArr.competence.niveaux[1]["definition"]);
                $("#input-def-competence-a").val(compFromArr.competence.niveaux[2]["definition"]);
                $("#input-def-competence-x").val(compFromArr.competence.niveaux[3]["definition"]);

                // SCROLL DOWN TO EDIT COMPETENCE AREA
                $('html, body').animate({
                    scrollTop: $("#input-nom-competence-glossaire").offset().top - 150
                }, 300);


                competenceEditIndex = compFromArr.index;

            })
        });

        // Array.from(allDeleteCatBtns).forEach((deleteBtn) => {
        //     deleteBtn.addEventListener("click", (e) => {

        //         // WHEN THE SPAN ELEMENT IS FIRED

        //         let aElement;
        //         if (e.target.tagName === "SPAN") {
        //             aElement = e.target.parentElement;
        //         } else {
        //             aElement = e.target;
        //         }

        //         let glossaireIndex = [...allDeleteCatBtns].indexOf(aElement);



        //         let competenceIndex = Math.floor(glossaireIndex / 4);
        //         let levelIndex = glossaireIndex % 4;
        //         competenceArray.splice(glossaireIndex, 1);

        //         console.log(competenceArray[competenceIndex].name, competenceArray[competenceIndex]["niveaux"][levelIndex])



        //         // showModal("error", "Vous voulez supprimer cette compétence ?", 'Confirmez votre décision de supprimer cette compétence, en cliquant sur le bouton "Oui".', "competence");




        //     })
        // });

        // Array.from(allEditCatBtns).forEach((editBtn) => {
        //     editBtn.addEventListener("click", (e) => {

        //         // WHEN THE SPAN ELEMENT IS FIRED

        //         let aElement;
        //         if (e.target.tagName === "SPAN") {
        //             aElement = e.target.parentElement;
        //         } else {
        //             aElement = e.target;
        //         }

        //         let glossaireIndex = [...allEditCatBtns].indexOf(aElement);



        //         let competenceIndex = Math.floor(glossaireIndex / 4);
        //         let levelIndex = glossaireIndex % 4;
        //         console.log(competenceArray[competenceIndex].name, competenceArray[competenceIndex]["niveaux"]);

        //         $("#input-nom-competence-glossaire").val(competenceArray[competenceIndex].name);

        //         $("#input-def-competence-e").val(competenceArray[competenceIndex]["niveaux"][0]["definition"]);
        //         $("#input-def-competence-m").val(competenceArray[competenceIndex]["niveaux"][1]["definition"]);
        //         $("#input-def-competence-a").val(competenceArray[competenceIndex]["niveaux"][2]["definition"]);
        //         $("#input-def-competence-x").val(competenceArray[competenceIndex]["niveaux"][3]["definition"]);


        //         competenceEditIndex = competenceIndex;



        //         // parseGlossaireToTable(competenceArray, niveau);

        //     })
        // })
    })




}

function getCompetenceInfoFromArr(compName) {


    // MAP OVVER COMPETENCE JSON ARR
    for (var i = 0; i < competenceArray.length; i++) {
        let competence = competenceArray[i];
        if (competence.name === compName) {
            return {
                "index": i,
                "competence": competence
            }
        }

    }
    return {
        "index": -1,
        "competence": null
    }
}

// THIS FUNCTION RETURNS THE PROPER FORMAT OF ARRAY THAT WILL BE DISPLAYED ON THE DATATABLE
function processCompetenceData4DataTable(arr) {

    let finallArr = [];

    if (arr.length === 0) {
        return [];
    }

    arr.map((e, i) => {

        // ITERATE OVER EACH NIVEAUX
        e.niveaux.map((niveau, index) => {

            let mid = [];

            // PUSH DATA FOLLOWING THIS ORDER : ID --> NAME --> LEVEL --> DEFINITION --> ACTION
            // mid.push(e.id);
            mid.push(e.name);
            mid.push(niveau.level);
            mid.push(niveau.definition);
            mid.push(`
            <div class="g-2">
                <a id="" class=" glo-table-btn-edit btn text-primary btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Edit"><span class="fe fe-edit fs-14"></span></a>
                <a id="" class="glo-table-btn-delete btn text-danger btn-sm" data-bs-toggle="tooltip"
                    data-bs-original-title="Delete"><span
                        class="fe fe-trash-2 fs-14"></span></a>
            </div> 
        
        `);

            finallArr.push(mid);

        })




    })

    return finallArr;

}

function loadJS(FILE_URL, async) {
    let scriptEle = document.createElement("script");

    scriptEle.setAttribute("src", FILE_URL);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", async);


    document.body.appendChild(scriptEle);

    // success event 
    scriptEle.addEventListener("load", () => {
        //console.log("File loaded")
    });
    // error event
    scriptEle.addEventListener("error", (ev) => {
        console.log("Error on loading file", ev);
    });
}

async function postMatriceCompetences(json) {
    // let url = "http://localhost:8080/preassessment/api/v1/competence/competences"
    let url = "http://localhost:8080/preassessment/api/v1/competence/matrice"


    return fetch(url, { // Your POST endpoint
        method: 'POST',
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
        error => {
            console.log(error);

            showModal("error", "Erreur", "L'enregistrement de cette matrice de compétences a été échouée. Essayer de refaire vos modifications.", "", {
                "text": "Revenir à l'acceuil",
                "color": "danger",
                "id": "dsds1"
            }, function () {
                // REDIRECT TO THE LIST OF ASSESSMENTS
                setTimeout(function () {
                    let currentUrl = window.location.href;

                    window.location.href = extractDomain(currentUrl) + "emploi/competence/list";
                }, 1000);
            })

        } // Handle the error response object
    );
}

async function updateMatriceCompetence(json) {

    let url = "http://localhost:8080/preassessment/api/v1/competence/matrice"


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
        error => {
            console.log(error);
            showModal("error", "Erreur", "Les modifications sur cette matrice de compétences ne sont pas enregistrées. Essayer de refaire vos modifications.", "", {
                "text": "Revenir à l'acceuil",
                "color": "danger",
                "id": "dsds1"
            }, function () {
                // REDIRECT TO THE LIST OF ASSESSMENTS
                setTimeout(function () {
                    let currentUrl = window.location.href;

                    window.location.href = extractDomain(currentUrl) + "emploi/competence/list";
                }, 1000);
            })

        } // Handle the error response object
    );
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

function checkCompetencesLevelsSection() {

    let isNotNull = true;

    $(".input-level-def").removeClass("is-invalid");

    // ENABLE THIS WHEN COMPETENCE IS SET TO BE EDITED BUT NOT COMPELETED
    if ($("#input-nom-competence-glossaire").val().trim() === '') {
        return true;
    }

    $(".input-level-def").each(function (index, element) {
        if ($(element).val() === '') {
            $(element).addClass("is-invalid");
            isNotNull = false;
        }


    })

    return isNotNull;
}

function checkMatriceBasics() {
    let isNotNull = true;

    $(".matrice-info").removeClass("is-invalid");

    $(".matrice-info").each(function (index, element) {
        if ($(element).val().trim() == '') {
            $(element).addClass("is-invalid");
            isNotNull = false;
        }
    })

    console.log(isNotNull);
    return isNotNull;
}

function checkForCompetenceArray() {

    if (competenceArray.length == 0) {
        return false;
    }

    return true;
}

function addLoaderToBtn(btnId) {

    // ADD LOADER HTML ELEMENT
    $(btnId).prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
}

function deleteLoaderToBtn(btnId) {

    // REMOVE LOADER HTML ELEMENT
    $(btnId).find("span").remove();
}

function showNotification(msg, type, position) {

    notif({
        "msg": msg,
        "type": type,
        "position": position
    });
}

