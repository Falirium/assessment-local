// GET PARAMS FROM URL
const url = window.location.href;
let idParam = url.split("/").at(-1);

console.log(idParam);

// THIS VARIABLE DEFINED THE SHOWN COLUMN ON THE TABLE

let authorizedCol = ["id", "collaborateur", "code affectation", "evaluateurOne", "evaluateurTwo", "emploi", "niveau", "Score", "% Res", "% Exi", "% Marq", "% D.C", "% S.E", "% S.F", "status"];


let assessmentJson;

// INITIALIZATION


// END INITIALIZATION

// GET THE ASSESSMENT JSON
getFicheEvaluationsByAssessment(idParam).then((fiches) => {

    if (fiches.hasOwnProperty("status")) {
        if (fiches.status === 500) {
            showModal("error", "Échec", fiches.error, "", {
                "text": "Revenir à l'acceuil",
                "color": "danger",
                "id": "dqz1"
            }, function () {

                //  REDIRECT TO THE ASSESSMENT PAGE
                redirectTo("assessment/list", 1000);
            });
        }
    }
    fichesArrJson = fiches;

    // FILTER LIST OF FICHE EVALUATION BASED ON THE CONNECTED DRH
    let user = (localStorage.getItem("user") != "admin") ? JSON.parse(localStorage.getItem("user")) : ("admin");


    // UPDATE BREADCRUMB
    updateBreadcrumb(user);

    if (user.type === "drh") {

        // REMOVE SUSPEND AND TERMINATE BTNS
        removeElements(["#btn-assessment-terminate", "#btn-assessment-sus"]);

        fichesArrJson = filterCollorateursByBpr(fiches, user.data.codePrefix, user.data.codeSuffix);

    }

    // GET ASSESSMENTJSON FROM FICHE EVALUATION
    assessmentJson = fiches[0].associatedAssessment;

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
            { "className": "default-light-cell ", "targets": [11, 12, 13, 14, 15,16] }

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
        let url = buildURL("evaluation/evaluate", urlParams);



        window.open(extractDomain(window.location.href) + url);
        // console.log(extractDomain(currentUrl) + url);


    })


})

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
        if (fiche.status === "CREATED") {
            numberOfBlank++;
        } else if (fiche.status.includes("ÉVALUÉ") || fiche.status.includes("TERMINÉ-0")) {
            numberOfInProgress++;
        } else if (fiche.status.includes("TERMINÉ-1")) {
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
                    value = "emploi ciblé"
                    break;
                case "evaluateurOne":
                    value = "evaluateurOne"
                    break;
                case "evaluateurTwo":
                    value = "evaluateurTwo"
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

        arr.push(e.id);
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
        if (e.status === "CREATED") {
            arr.push(`
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-danger">Non évalué</span>
            </div>
                `)
        } else if (e.status.includes("ÉVALUÉ-0")) {
            arr.push(`
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-warning">Évalué</span>
            </div>
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-warning">En cours</span>
            </div>
                `)
        } else if (e.status.includes("ÉVALUÉ-1")) {
            arr.push(`
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-success">Évalué par N+1</span>
            </div>
                `)
        } else if (e.status.includes("TERMINÉ-0")) {
            arr.push(`
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-warning">Validé</span>
             </div>
             <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-warning">En cours</span>
             </div>
            `)
        } else if (e.status.includes("TERMINÉ-1")) {
            arr.push(`
            <div class="mt-sm-1 d-block">
                <span class="tag tag-radius tag-round tag-outline-success">Évalué par N+2</span>
             </div>
            `)
        }


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

        if (ficheId == ficheEva.id) {
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
                        redirectTo("assessment/list", 1000);
                    });

                } else {

                    // SHOW SUCCESS MDOAL
                    showModal("success", "Succès", "La campagne d'assessment est maintenant repris. Tous les managers peuvent compléter leurs évaluations", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "success",
                        "id": "dqz1"
                    }, function () {


                        //  REDIRECT TO THE ASSESSMENT PAGE
                        redirectTo("assessment/list", 1000);
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
                        redirectTo("assessment/list", 1000);
                    });

                } else {

                    // SHOW SUCCESS MDOAL
                    showModal("success", "Succès", "La campagne d'assessment est maintenant suspendu. Tous les résultats sont enregistrés avec succès", "", {
                        "text": "Revenir à l'acceuil",
                        "color": "success",
                        "id": "dqz1"
                    }, function () {


                        //  REDIRECT TO THE ASSESSMENT PAGE
                        redirectTo("assessment/list", 1000);
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
                    redirectTo("assessment/list", 1000);
                });

            } else {

                // SHOW SUCCESS MDOAL
                showModal("success", "Succès", "La campagne d'assessment est maintenant terminé avec succès. Les résultats des fiches d'évaluations sont disponibles en bas.", "", {
                    "text": "Revenir à l'acceuil",
                    "color": "success",
                    "id": "dqz1"
                }, function () {


                    //  REDIRECT TO THE ASSESSMENT PAGE
                    redirectTo("assessment/list", 1000);
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

        window.location.href = extractDomain(currentUrl) + url;
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
    // console.log(prefix, suffix);

    finalArr = list.filter((fiche, index) => {

        let affectationCode = fiche.collaborateur.affectationCode;

        // console.log("Matricule : " + mat);

        if (prefix.length != 0) {

            for (var i = 0; i < prefix.length; i++) {
                let code = prefix[i] + "";

                console.log("Code : " + code );

                // ITERATE OVER CODE
                let counter = 0;
                for (var j = 0; j < code.length; j++) {

                    console.log(affectationCode[j],code[j], affectationCode[j] == code[j])

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