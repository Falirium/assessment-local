// CHECK IF FICHE EVALUATION IS AVAILABLE
let ficheEvaluation;
let fichePreviewJson; // HOLDS THE VALUE THAT IS FETCHED FROM THE SERVER
let manager;

// CHECK IF FICHEEVALUATION IS AVAILABLE
if (localStorage.getItem("ficheEvaluation") === null) {

    // TODO:REDIRECT TO PAGE LIST PAGE
    window.location.href(currentUrl(window.location.href) + "evaluation/list")


} else {

    // GET FICHE & MANAGER
    ficheEvaluation = JSON.parse(localStorage.getItem("ficheEvaluation"));

    // GET  FICHE-EVALUATION OBJECT FROM DATABASE
    (async () => {
        ficheEvaluation = await getFicheEvaluation(ficheEvaluation.id);
    })();

    if (localStorage.getItem("user") === "admin") {
        manager = localStorage.getItem("user");
    } else {
        manager = JSON.parse(localStorage.getItem("user"));
    }

    // SET FICHE EVALUATION INFOS
    $("#emploi-cible-text").text(ficheEvaluation.emploi.intitule);
    $("#date-eva-text").text(ficheEvaluation.emploi.dateEvaluation);
    if (manager === "admin") {
        $("#mat-eva-text").text(ficheEvaluation.evaluateurOne.matricule);
    } else if (manager.type === "1") {
        $("#mat-eva-text").text(ficheEvaluation.evaluateurOne.matricule);
    } else if (manager.type === "2") {
        $("#mat-eva-text").text(ficheEvaluation.evaluateurTwo.matricule);
    }
    $("#mat-collaborateur-text").text(ficheEvaluation.collaborateur.matricule);
    $("#date-eva-text").text(ficheEvaluation.dateEvaluation.split("T")[0]);
}


// SCORE VARIABLES
let totalPoints = 0;
let score = 0;
let sur_points = 0;
let sous_points = 0;
let percentagePerSection = {
    "section_res": 0,
    "section_exi": 0,
    "section_marq": 0,
    "section_dc": 0,
    "section_sf": 0,
    "section_se": 0
}

let elementsNumbers = 0;

let lastClickedIndexYes = -1;
let lastClickedIndexNo = -1;

// GET PARAMS FROM URL
const params = new URLSearchParams(window.location.search);
let urlParams = "?";
for (const param of params) {
    urlParams = urlParams + param[0] + "=" + param[1] + "&";
    // console.log(param);
}
console.log(urlParams);

// CHECK FOR AVAILABLE SECTIONS
let radioBtnCompteur = 0;
let compBtnCompteur = 0;
let compSfBtnCompteur = 0;
let compSeBtnCompteur = 0;

// CHECK IF FICHE IS ALREADY FILLED
if (ficheEvaluation.re_manager1 != null || ficheEvaluation.re_manager2 != null) {

    // THIS VARIABLE HOLDS THE LAST VERSION OF ANSWERS : FOR BOTH MANAGER 1 AND MANAGER2
    let ficheAnswers;


    if (manager === "admin" || manager.type === 'drh') {
        if (ficheEvaluation.re_manager1 != null && ficheEvaluation.re_manager2 != null) {

            ficheAnswers = JSON.parse(ficheEvaluation.re_manager2);

            // SET THE NAME OF MANAGER 2 AS EVALUATEUR
            $("#mat-eva-text").text(ficheEvaluation.evaluateurTwo.matricule);

        } else if (ficheEvaluation.re_manager1 != null) {

            ficheAnswers = JSON.parse(ficheEvaluation.re_manager1);

            // SET THE NAME OF MANAGER 1 AS EVALUATEUR
            $("#mat-eva-text").text(ficheEvaluation.evaluateurOne.matricule);


        } else if (ficheEvaluation.re_manager2 != null) {

            ficheAnswers = JSON.parse(ficheEvaluation.re_manager2);

            // SET THE NAME OF MANAGER 2 AS EVALUATEUR
            $("#mat-eva-text").text(ficheEvaluation.evaluateurTwo.matricule);

        }

    } else {

        if (ficheEvaluation.re_manager1 != null && manager.type === "1" && ficheEvaluation.re_manager2 == null) {

            ficheAnswers = JSON.parse(ficheEvaluation.re_manager1);

        } else if (ficheEvaluation.re_manager1 != null && manager.type === "2" && ficheEvaluation.re_manager2 == null) {

            ficheAnswers = JSON.parse(ficheEvaluation.re_manager1);

        } else if (ficheEvaluation.re_manager1 != null && manager.type === "2" && ficheEvaluation.re_manager2 != null) {

            ficheAnswers = JSON.parse(ficheEvaluation.re_manager2);
        }
    }




    // PARSE THE THE FICHE 
    getFicheEmploiPreview(urlParams).then((json) => {
        populateResTable(json);
        fichePreviewJson = json;

        // FILL IT WITH RESPONSE OF MANAGER 1
        parseManagerResult(ficheAnswers);


        // UPDATE THE SCORES & DISPLAY THEM
        score = ficheEvaluation.score;
        sur_points = ficheEvaluation.surPoints;
        sous_points = ficheEvaluation.sousPoints;
        totalPoints = (score / 100) * elementsNumbers;

        $("#score").text(score.toString() + "%");
        displaySousPoints();
        displaySurPoints();

        // CASE OF ADMIN DISABLE MODIFICATION
        if (manager === 'admin' || manager.type == 'drh') {
            disableModificationForAdminAndDrh();
        }
    });







} else {

    // POPULATE FIHCE EVALUATION
    getFicheEmploiPreview(urlParams).then((json) => {
        populateResTable(json);
        fichePreviewJson = json;

        // CASE OF ADMIN DISABLE MODIFICATION
        if (manager === 'admin' || manager.type == 'drh') {
            disableModificationForAdminAndDrh();
        }
    });

}







// VALIDATE BTN 
$("#btn-fiche-validate").click({
    finalValidation: false
}, saveFicheEvaluationHandler)

// SEND THE RESULT OF THIS
$("#btn-fiche-send").click({
    finalValidation: true
}, saveFicheEvaluationHandler)


function disableModificationForAdminAndDrh() {

    // DISABLE ACTIONS BTN || DELETE THEM 
    // $(".action-btn").prop('disabled', true);
    $(".action-btn").remove();

    // DISABLE ALL TOGGLE BTN
    $("input[type=radio]").attr('disabled', true);

}

function saveFicheEvaluationHandler(e) {
    // WE HAVE TWO SCENARIOS : MANAGER1 VALIDAES , MANAGER2 VALIDATES

    // ADD LOADER TO BTN
    addLoaderToBtn("#" + e.target.id);

    // NEW FEATURE : WHEN CLICKING ON SAVE ---> DONT CHECK FOR TOGGLES RESULTS
    if (!e.data.finalValidation) {

        processSavingFicheEvaluation(e);

    } else if (allFieldSelected(e)) {    // VERIFY IF ALL THE FIELS ARE SELECTED

        processSavingFicheEvaluation(e);

    }



}

function allFieldSelected(e) {
    let radioNames = ["custom-switch-radio-", "comp-switch-radio-", "comp-se-switch-radio-", "comp-sf-switch-radio-"];

    // DELETE LOADER FROM BTN
    deleteLoaderToBtn("#" + e.target.id);

    // REMOVE DANGER BACKGROUNDS FRON TD ELEMENTS
    $("td").removeClass("btn-danger-light");

    let isChecked = true;
    let firstUncheckedRow = null;

    for (var j = 0; j < radioNames.length; j++) {
        let radioName = radioNames[j];
        console.log(radioName);



        switch (radioName) {
            case "custom-switch-radio-":
                for (var i = 0; i < radioBtnCompteur; i++) {

                    if (!$("input[name=" + radioName + i + "]").is(":checked")) {
                        console.log(i);



                        // GET THE PROBLEM RADIO + ADD ERROR MESSAGE
                        let notSelectedRadioContainer = $($("input[name=" + radioName + i + "]")[0]).parents("td").first();
                        // let notSelectedRadioContainer = $("input[name=" + radioName + i + "]");

                        notSelectedRadioContainer.addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().addClass("btn-danger-light");
                        // console.log(notSelectedRadioContainer);

                        // SAVE THE FIRT UNCHECKED ROW
                        if (firstUncheckedRow === null) {
                            firstUncheckedRow = notSelectedRadioContainer;
                        }



                        isChecked = false;
                    }
                }
                break;
            case "comp-switch-radio-":
                for (var i = 0; i < compBtnCompteur; i++) {
                    if (!$("input[name=" + radioName + i + "]").is(":checked")) {


                        // GET THE PROBLEM RADIO + ADD ERROR MESSAGE
                        let notSelectedRadioContainer = $($("input[name=" + radioName + i + "]")[0]).parents("td").first();
                        // let notSelectedRadioContainer = $("input[name=" + radioName + i + "]");

                        notSelectedRadioContainer.addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().prev().addClass("btn-danger-light");


                        notSelectedRadioContainer.next().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().next().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().next().next().addClass("btn-danger-light");


                        // SAVE THE FIRT UNCHECKED ROW
                        if (firstUncheckedRow === null) {
                            firstUncheckedRow = notSelectedRadioContainer;
                        }



                        isChecked = false;
                    }
                }
                break;
            case "comp-sf-switch-radio-":
                for (var i = 0; i < compSfBtnCompteur; i++) {
                    if (!$("input[name=" + radioName + i + "]").is(":checked")) {


                        // GET THE PROBLEM RADIO + ADD ERROR MESSAGE
                        let notSelectedRadioContainer = $($("input[name=" + radioName + i + "]")[0]).parents("td").first();
                        // let notSelectedRadioContainer = $("input[name=" + radioName + i + "]");

                        notSelectedRadioContainer.addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().prev().addClass("btn-danger-light");


                        notSelectedRadioContainer.next().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().next().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().next().next().addClass("btn-danger-light");


                        // SAVE THE FIRT UNCHECKED ROW
                        if (firstUncheckedRow === null) {
                            firstUncheckedRow = notSelectedRadioContainer;
                        }

                        // console.log(notSelectedRadioContainer);


                        isChecked = false;
                    }
                }
                break;
            case "comp-se-switch-radio-":
                for (var i = 0; i < compSeBtnCompteur; i++) {
                    if (!$("input[name=" + radioName + i + "]").is(":checked")) {


                        // GET THE PROBLEM RADIO + ADD ERROR MESSAGE
                        let notSelectedRadioContainer = $($("input[name=" + radioName + i + "]")[0]).parents("td").first();
                        // let notSelectedRadioContainer = $("input[name=" + radioName + i + "]");

                        notSelectedRadioContainer.addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().addClass("btn-danger-light");
                        notSelectedRadioContainer.prev().prev().addClass("btn-danger-light");


                        notSelectedRadioContainer.next().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().next().addClass("btn-danger-light");
                        notSelectedRadioContainer.next().next().next().addClass("btn-danger-light");

                        // SAVE THE FIRT UNCHECKED ROW
                        if (firstUncheckedRow === null) {
                            firstUncheckedRow = notSelectedRadioContainer;
                        }

                        // console.log(notSelectedRadioContainer);


                        isChecked = false;
                    }
                }
                break;
        }


    }

    // SCROLL TO THE FORST UNCKECKED ROW
    if (firstUncheckedRow != null) {
        $('html, body').animate({
            scrollTop: firstUncheckedRow.offset().top - 100
        }, 500);
    }

    console.log(isChecked);



    return isChecked;






}

function processSavingFicheEvaluation(e) {

    // UPDATE THE SCORES
    ficheEvaluation.score = score;
    ficheEvaluation.sousPoints = sous_points;
    ficheEvaluation.surPoints = sur_points;

    calculateCompletionOfAllSections();

    ficheEvaluation.sectionRes = percentagePerSection.section_res;
    ficheEvaluation.sectionExi = percentagePerSection.section_exi;
    ficheEvaluation.sectionMarq = percentagePerSection.section_marq;
    ficheEvaluation.sectionCompDc = percentagePerSection.section_dc;
    ficheEvaluation.sectionCompSf = percentagePerSection.section_sf;
    ficheEvaluation.sectionCompSe = percentagePerSection.section_se;

    console.log(percentagePerSection);
    console.log(ficheEvaluation);


    // CHECK WHICH MANAGER IS CONNECTED
    if (manager.type === "1") {

        if (e.data.finalValidation) {
            ficheEvaluation.status = "ÉVALUÉ-1";
        } else {
            ficheEvaluation.status = "ÉVALUÉ-0";
        }



        // TAKE A COPY OF THIS FICHE + set the save the result of manager 1
        let re = takeCopy(ficheEvaluation);
        // console.log(re);
        // console.log(JSON.stringify(re));
        ficheEvaluation.re_manager1 = JSON.stringify(re);


    } else if (manager.type === "2") {

        if (e.data.finalValidation) {
            ficheEvaluation.status = "TERMINÉ-1";

        } else {
            ficheEvaluation.status = "TERMINÉ-0";

        }



        // TAKE A COPY OF THIS FICHE + set the save the result of manager 1
        let re = takeCopy(ficheEvaluation);
        ficheEvaluation.re_manager2 = JSON.stringify(re);

    }

    // CHECK FOR ASSESSMENT STATUS
    if (ficheEvaluation.associatedAssessment.status == "SUSPENDED") {

        // DELETE LOADER FROM BTN
        deleteLoaderToBtn("#" + e.target.id);

        // SHOW ERROR MESSAGE
        showModal("error", "Erreur", "Malheureusement, vous ne pouvez pas sauvegarder le résultat de cette fiche d'évaluation. Parce que les administrateurs ont suspendu cette évaluation. Veuillez les contacter directement pour résoudre ce problème.", "", {
            "text": "Revenir à l'accueil",
            "color": "danger",
            "id": "dje1"
        }, function () {
            // REDIRECT TO EVALUATION LIST PAGE
            setTimeout(function () {
                currentUrl = window.location.href;
                window.location.href = extractDomain(currentUrl) + "evaluation/list";
            }, 1000);
        });

    } else if (ficheEvaluation.associatedAssessment.status == "ENDED") {

        // DELETE LOADER FROM BTN
        deleteLoaderToBtn("#" + e.target.id);

        // SHOW ERROR MESSAGE
        showModal("error", "Erreur", "Malheureusement, vous ne pouvez pas sauvegarder le résultat de cette assessment, car cette évaluation a été terminée. ", "", {
            "text": "Revenir à l'accueil",
            "color": "danger",
            "id": "dje1"
        }, function () {
            // REDIRECT TO EVALUATION LIST PAGE
            setTimeout(function () {
                currentUrl = window.location.href;
                window.location.href = extractDomain(currentUrl) + "evaluation/list";
            }, 1000)
        })
    } else {
        // SAVE THE RESULT TO THE DB
        updateFicheEvaluation(ficheEvaluation.id, ficheEvaluation).then((result) => {
            console.log(result);

            // DELETE LOADER FROM BTN
            deleteLoaderToBtn("#" + e.target.id);

            // UNBIDE THIS HANDLER WITH THE ELEMENT ----> IMMITATION OF ONE CLICK EVENT LISTENER
            $(this).off(e);

            // SHOW SUCCESS MODAL
            let modalHeader;
            let modalBody;
            if (ficheEvaluation.status.includes("1")) {
                modalHeader = "Succès";
                modalBody = "La fiche a été envoyée avec succès. Cliquer sur le boutton pour se rediriger automatiquement vers les autres fiches pour continuer l'évaluation.";
            } else {

                modalHeader = "Succès";
                modalBody = "La fiche a été enregistré avec succès. Cliquer sur le boutton pour se rediriger automatiquement vers les autres fiches pour continuer l'évaluation.";
            }
            showModal("success", modalHeader, modalBody, "", {
                "text": "Revenir à l'accueil",
                "color": "success",
                "id": "dje1"
            }, function () {
                // REDIRECT TO EVALUATION LIST PAGE
                setTimeout(function () {
                    currentUrl = window.location.href;
                    window.location.href = extractDomain(currentUrl) + "evaluation/list";
                }, 1000)
            })





        })
    }
}

function parseManagerResult(json) {

    console.log(json);

    // MARQUEURS
    if (json.marqueurs.length != 0) {

        json.marqueurs.map((marq, index) => {

            $(".marqueurs").each((index, element) => {
                let marqueurRow = $(element);




                if (marqueurRow.find("#marqueur-value").html() === marq.value) {

                    let res = marq.response;


                    let btns = marqueurRow.find("input[type='radio']")


                    let noRadioBtn = $(btns[0]);
                    let yesRadioBtn = $(btns[1]);



                    // TOGGLE THE MATCHED BTN ( 0 --> NO, 1 --> YES )
                    if (res == 0) {
                        noRadioBtn.attr("checked", "checked");

                        // ADD THE ATTRIBUTE DATA-CHECKED
                        noRadioBtn.attr("data-checked", "true");

                    } else if (res == 1) {
                        yesRadioBtn.attr("checked", "checked");

                        // ADD THE ATTRIBUTE DATA-CHECKED
                        yesRadioBtn.attr("data-checked", "true");
                    }

                }
            })
        })


    }

    // EXIGENCES
    if (json.exigences.length != 0) {

        json.exigences.map((exi, index) => {

            $(".exigences").each((index, element) => {
                let exigenceRow = $(element);

                if (exigenceRow.find("#exi-value").html() === exi.value) {

                    let res = exi.response;

                    let btns = exigenceRow.find("input[type='radio']")

                    let noRadioBtn = $(btns[0]);
                    let yesRadioBtn = $(btns[1]);

                    // TOGGLE THE MATCHED BTN ( 0 --> NO, 1 --> YES )
                    if (res == 0) {
                        noRadioBtn.attr("checked", "checked");

                        // ADD THE ATTRIBUTE DATA-CHECKED
                        noRadioBtn.attr("data-checked", "true");

                    } else if (res == 1) {
                        yesRadioBtn.attr("checked", "checked");

                        // ADD THE ATTRIBUTE DATA-CHECKED
                        yesRadioBtn.attr("data-checked", "true");
                    }

                }
            })
        })


    }

    // RESPONSABILITES
    if (json.responsabilites.length != 0) {

        json.responsabilites.map((res, index) => {

            $(".responsabilites").each((index, element) => {
                let responsabiliteRow = $(element);

                if (responsabiliteRow.find("#res-value").html() === res.value) {

                    let response = res.response;
                    let btns = responsabiliteRow.find("input[type='radio']")

                    let noRadioBtn = $(btns[0]);
                    let yesRadioBtn = $(btns[1]);

                    // TOGGLE THE MATCHED BTN ( 0 --> NO, 1 --> YES )
                    if (response == 0) {
                        noRadioBtn.attr("checked", "checked");

                        // ADD THE ATTRIBUTE DATA-CHECKED
                        noRadioBtn.attr("data-checked", "true");

                    } else if (response == 1) {
                        yesRadioBtn.attr("checked", "checked");

                        // ADD THE ATTRIBUTE DATA-CHECKED
                        yesRadioBtn.attr("data-checked", "true");
                    }

                }
            })
        })


    }

    // COMPETENCES_DC
    console.log("comp - dc");
    if (json.competences.competences_dc.length != 0) {

        json.competences.competences_dc.map((comp, index) => {

            console.log(comp);
            $(".comp-dc").each((index, element) => {
                let compDcRow = $(element);

                if (compDcRow.find("#compDc-value").html() === comp.value) {

                    let res = comp.response;
                    let btns = compDcRow.find("input[type='radio']");

                    let eRadioBtn = $(btns[0]);
                    let mRadioBtn = $(btns[1]);
                    let aRadioBtn = $(btns[2]);
                    let xRadioBtn = $(btns[3]);


                    // TOGGLE THE MATCHED BTN ( 0 --> NO, 1 --> YES )
                    if (res === 'E') {
                        eRadioBtn.attr("checked", "checked");

                        // ADD THE FOLLOWING ATTRIBUTE SO WE CAN KNOW WICH SELECTION IS SELECTED
                        eRadioBtn.attr("data-checked", "true");

                    } else if (res === 'M') {
                        mRadioBtn.attr("checked", "checked");

                        mRadioBtn.attr("data-checked", "true");

                    } else if (res === 'A') {
                        aRadioBtn.attr("checked", "checked");

                        aRadioBtn.attr("data-checked", "true");

                    } else if (res === 'X') {
                        xRadioBtn.attr("checked", "checked");

                        xRadioBtn.attr("data-checked", "true");
                    }

                }
            })
        })


    }

    // COMPETENCES_SE
    if (json.competences.competences_se.length != 0) {

        json.competences.competences_se.map((comp, index) => {

            $(".comp-se").each((index, element) => {
                let compSeRow = $(element);

                if (compSeRow.find("#compSe-value").html() === comp.value) {

                    let res = comp.response;
                    let btns = compSeRow.find("input[type='radio']");

                    let eRadioBtn = $(btns[0]);
                    let mRadioBtn = $(btns[1]);
                    let aRadioBtn = $(btns[2]);
                    let xRadioBtn = $(btns[3]);


                    // TOGGLE THE MATCHED BTN ( 0 --> NO, 1 --> YES )
                    if (res === 'E') {
                        eRadioBtn.attr("checked", "checked");

                        // ADD THE FOLLOWINW ATTRIBUTE SO WE CAN KNOW WICH SELECTION IS SELECTED
                        eRadioBtn.attr("data-checked", "true");

                    } else if (res === 'M') {
                        mRadioBtn.attr("checked", "checked");

                        mRadioBtn.attr("data-checked", "true");

                    } else if (res === 'A') {
                        aRadioBtn.attr("checked", "checked");

                        aRadioBtn.attr("data-checked", "true");

                    } else if (res === 'X') {
                        xRadioBtn.attr("checked", "checked");

                        xRadioBtn.attr("data-checked", "true");
                    }

                }
            })
        })


    }

    // COMPETENCES_SF
    if (json.competences.competences_sf.length != 0) {

        json.competences.competences_sf.map((comp, index) => {

            $(".comp-sf").each((index, element) => {
                let compSfRow = $(element);

                if (compSfRow.find("#compSf-value").html() === comp.value) {

                    let res = comp.response;
                    let btns = compSfRow.find("input[type='radio']");

                    let eRadioBtn = $(btns[0]);
                    let mRadioBtn = $(btns[1]);
                    let aRadioBtn = $(btns[2]);
                    let xRadioBtn = $(btns[3]);


                    // TOGGLE THE MATCHED BTN ( 0 --> NO, 1 --> YES )
                    if (res === 'E') {
                        eRadioBtn.attr("checked", "checked");

                        // ADD THE FOLLOWINW ATTRIBUTE SO WE CAN KNOW WICH SELECTION IS SELECTED
                        eRadioBtn.attr("data-checked", "true");

                    } else if (res === 'M') {
                        mRadioBtn.attr("checked", "checked");

                        mRadioBtn.attr("data-checked", "true");

                    } else if (res === 'A') {
                        aRadioBtn.attr("checked", "checked");

                        aRadioBtn.attr("data-checked", "true");

                    } else if (res === 'X') {
                        xRadioBtn.attr("checked", "checked");

                        xRadioBtn.attr("data-checked", "true");
                    }

                }
            })
        })


    }
}

function takeCopy(json) {
    let result = {
        "id": null,
        "score": null,
        "sousPoints": null,
        "surPoints": null,
        "marqueurs": [],
        "exigences": [],
        "responsabilites": [],
        "competences": {
            "competences_dc": [],
            "competences_se": [],
            "competences_sf": []
        }
    };

    // BASIC INFO
    result.id = json.id;
    result.score = json.score;
    result.sousPoints = json.sousPoints;
    result.surPoints = json.surPoints;

    //MARQUEURS
    if (json.ficheContent.includes("marqueurs")) {


        // TAKE ALL MARQUERS CONTAINERS FROM DOM
        $(".marqueurs").each(function (index, element) {
            let marqueur = {
                "value": null,
                "response": null
            }
            let marqRow = $(element);
            // console.log(marqRow.find("input[type='radio']:checked"));

            marqueur.value = marqRow.find("#marqueur-value").html();
            marqueur.response = marqRow.find("input[type='radio']:checked").val();

            // console.log(marqueur);


            result.marqueurs.push(marqueur);

        })

    }


    // RESPONSABILITIES
    if (json.ficheContent.includes("responsabilites")) {

        // TAKE ALL RES CONTAINERS FROM DOM
        $(".responsabilites").each(function (index, element) {
            let res = {
                "value": null,
                "response": null
            }
            let resRow = $(element);
            // console.log(resRow.find("input[type='radio']:checked"));

            res.value = resRow.find("#res-value").html();
            res.response = resRow.find("input[type='radio']:checked").val();

            // console.log(res);


            result.responsabilites.push(res);

        })
    }

    // EXIGENCES
    if (json.ficheContent.includes("exigences")) {

        // TAKE ALL EXIGENCES CONTAINERS FROM DOM
        $(".exigences").each(function (index, element) {
            let exigence = {
                "value": null,
                "response": null
            }
            let exiRow = $(element);
            // console.log(exiRow.find("input[type='radio']:checked"));

            exigence.value = exiRow.find("#exi-value").html();
            exigence.response = exiRow.find("input[type='radio']:checked").val();

            // console.log(exigence);


            result.exigences.push(exigence);

        })
    }

    // COMPETENCES - DC
    if (json.ficheContent.includes("competences-dc")) {

        console.log()


        // TAKE ALL COMPETENCES_DC CONTAINERS FROM DOM
        $(".comp-dc").each(function (index, element) {
            let comp_dc = {
                "value": null,
                "requis": null,
                "response": null
            }
            let compDcRow = $(element);
            // console.log(compDcRow.find("input[type='radio']:checked"));

            comp_dc.value = compDcRow.find("#compDc-value").html();
            comp_dc.requis = compDcRow.find("#compDc-requis-value").html();
            comp_dc.response = compDcRow.find("input[type='radio']:checked").val();

            // console.log(comp_dc);


            result.competences["competences_dc"].push(comp_dc);

        })


    }

    // COMPETENCES - SE
    if (json.ficheContent.includes("competences-se")) {




        // TAKE ALL COMPETENCES_SE CONTAINERS FROM DOM
        $(".comp-se").each(function (index, element) {
            let competence_se = {
                "value": null,
                "requis": null,
                "response": null
            }
            let compSeRow = $(element);
            // console.log(compSeRow.find("input[type='radio']:checked"));

            competence_se.value = compSeRow.find("#compSe-value").html();
            competence_se.requis = compSeRow.find("#compSe-requis-value").html();
            competence_se.response = compSeRow.find("input[type='radio']:checked").val();

            // console.log(competence_se);


            result.competences.competences_se.push(competence_se);

        })
    }

    // COMPETENCES - SF
    if (json.ficheContent.includes("competences-sf")) {



        // TAKE ALL COMPETENCES_SF CONTAINERS FROM DOM
        $(".comp-sf").each(function (index, element) {
            let competence_sf = {
                "value": null,
                "requis": null,
                "response": null
            }
            let compSfRow = $(element);
            // console.log(compSfRow.find("input[type='radio']:checked"));

            competence_sf.value = compSfRow.find("#compSf-value").html();
            competence_sf.requis = compSfRow.find("#compSf-requis-value").html();
            competence_sf.response = compSfRow.find("input[type='radio']:checked").val();

            // console.log(competence_sf);


            result.competences.competences_sf.push(competence_sf);

        })
    }


    // console.log(result)
    return result;

}

async function updateFicheEvaluation(id, jsonFiche) {
    let url = "http://localhost:8080/preassessment/api/v1/ficheEvaluation/update/" + id;

    return fetch(url, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonFiche)

    }).then(
        response => response.json()
    ).then(
        success => success
    ).catch(
        error => console.log(error)
    )
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


    $(modalHeaderId).text(header);
    $(modalContentId).html(content);



    myModal.show();

}

function populateResTable(json) {
    console.log(json);
    // GET TABLE BODY 
    for (var key of Object.keys(json)) {
        // console.log(key);
        switch (key) {
            case "responsabilites":
                //console.log("responsa");
                let resCategories = json[key];

                if (resCategories === null) {
                    continue;
                }

                // IETRATE OVER VALUES OF CATEGORY
                resCategories.forEach(function (categorie, index) {

                    for (var j = 0; j < categorie.valeur.length; j++) {

                        //ADD A ROW
                        $("#res-table-body").append('<tr class="responsabilites"></tr>');
                        if (j === 0) {
                            $("#res-table-body").find("tr").last().append(`<td rowspan=` + categorie.valeur.length + `>` + categorie["categorie"] + `</td>`);
                            $("#res-table-body").find("tr").last().append(`<td id="res-value">` + categorie["valeur"][j] + `</td>`);
                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" value="0" class="custom-switch-input no-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);

                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" value="1" class="custom-switch-input yes-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);

                        } else {


                            $("#res-table-body").find("tr").last().append(`<td id="res-value">` + categorie["valeur"][j] + `</td>`);
                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="res-result">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}"  value="0" class="custom-switch-input no-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);

                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="res-result">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}"   value="1" class="custom-switch-input yes-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);
                        }


                        radioBtnCompteur++;



                    }
                })

                break;

            case "exigences":
                //console.log("exigences");
                let exiValues = json[key];
                //console.log(exiValues);

                if (exiValues === null) {
                    continue;
                }

                // ITERATE OVER THE ARRAY
                for (var j = 0; j < exiValues.length; j++) {
                    //APPEND A ROW
                    console.log("hdsqhdkq");
                    $("#exi-table-body").append('<tr class="exigences" ></tr>');


                    $("#exi-table-body").find("tr").last().append(`<td id="exi-value">${exiValues[j]}</td>`);

                    $("#exi-table-body").find("tr").last().append(`
                            <td>
                                <div class="">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" value="0" class="custom-switch-input no-radio-btn">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description"></span>
                                    </label>
                                </div>
                            </td>
                        `);
                    $("#exi-table-body").find("tr").last().append(`
                            <td>
                                <div class="">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" value="1" class="custom-switch-input yes-radio-btn">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description"></span>
                                    </label>
                                </div>
                            </td>
                        `);

                    radioBtnCompteur++;

                    // ADD EVENT TO BOTH OF RADIO BTNS


                }
                break;

            case "marqueurs":
                let marqValues = json[key];

                if (marqValues === null) {
                    continue;
                }

                // ITERATE OVER THE ARRAY
                for (var j = 0; j < marqValues.length; j++) {
                    //APPEND A ROW
                    $("#marq-table-body").append('<tr class="marqueurs"></tr>');


                    $("#marq-table-body").find("tr").last().append(`<td id="marqueur-value">${marqValues[j]}</td>`);

                    $("#marq-table-body").find("tr").last().append(`
                            <td>
                                <div class="marqueur-result">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" value="0" class="custom-switch-input no-radio-btn">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description"></span>
                                    </label>
                                </div>
                            </td>
                        `);
                    $("#marq-table-body").find("tr").last().append(`
                            <td>
                                <div class="marqueur-result">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" value="1"  class="custom-switch-input yes-radio-btn">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description"></span>
                                    </label>
                                </div>
                            </td>
                        `);

                    radioBtnCompteur++;


                }

                // ADD CLICK EVENT LISTENERS TO RADIO BTNS

                break;

            case "competences_dc":

                let niveauArr = ["E", "M", "A", "X"];

                let competences = json[key];

                if (competences === null) {
                    continue;
                }

                competences.forEach((competence, index) => {

                    // GET COMPETENCE NIVEAU
                    let eDescription = competence.niveaux[0].level + " : " + competence.niveaux[0].definition;
                    let mDescription = competence.niveaux[1].level + " : " + competence.niveaux[1].definition;
                    let aDescription = competence.niveaux[2].level + " : " + competence.niveaux[2].definition;
                    let xDescription = competence.niveaux[3].level + " : " + competence.niveaux[3].definition;

                    // APPEND A ROW
                    $("#comp-table-body").append('<tr class="comp-dc"></tr>');

                    if (index === 0) {
                        $("#comp-table-body").find("tr").last().append(`<td rowspan="${competences.length}"> Domaines de connaissances </td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compDc-value"> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compDc-requis-value" class="niveau-requis"> ${competence.requiredNiveau}</td>`);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${eDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioE-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="E" class="custom-switch-input e-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${mDescription}">
                            <div class="">
                                <label class="custom-switch form-switch  ">
                                    <input type="radio" id="radioM-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="M" class="custom-switch-input m-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${aDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioA-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="A" class="custom-switch-input a-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${xDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioX-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="X" class="custom-switch-input x-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);


                    } else {

                        $("#comp-table-body").find("tr").last().append(`<td id="compDc-value"> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compDc-requis-value" class="niveau-requis"> ${competence.requiredNiveau}</td>`);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${eDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioE-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="E" class="custom-switch-input e-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${mDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioM-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="M" class="custom-switch-input m-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${aDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioA-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="A" class="custom-switch-input a-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${xDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" id="radioX-${compBtnCompteur}" name="comp-switch-radio-${compBtnCompteur}" value="X" class="custom-switch-input x-dc-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        
                        
                        `);

                    }


                    compBtnCompteur++;
                })

                // ADD EVENT LISTENERS
                $(".e-dc-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    console.log(index);
                    console.log(reqNiveau);
                    console.log($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]'));
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");



                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            console.log("HEEREE");
                            totalPoints++;
                            calculateScore();
                            break;

                        case "M":
                            sous_points = sous_points + 1;
                            displaySousPoints();
                            break;

                        case "A":
                            sous_points = sous_points + 2;
                            displaySousPoints();
                            break;

                        case "X":
                            sous_points = sur_points + 3;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".m-dc-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }




                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":

                            totalPoints++;
                            calculateScore();

                            sur_points++;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();
                            break;

                        case "A":
                            sous_points++;
                            displaySousPoints();
                            break;

                        case "X":
                            sous_points += 2;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".a-dc-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 2;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 1;
                            displaySurPoints();
                            break;

                        case "A":
                            totalPoints++;
                            calculateScore();
                            break;

                        case "X":
                            sous_points = sous_points + 1;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".x-dc-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;
                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 3;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 2;
                            displaySurPoints();
                            break;

                        case "A":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 1;
                            displaySurPoints();
                            break;

                        case "X":
                            totalPoints++;
                            calculateScore();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");


                })



                break;

            case "competences_sf":


                let competences_sf = json[key];

                if (competences_sf === null) {
                    continue;
                }

                competences_sf.forEach((competence, index) => {

                    // GET COMPETENCE NIVEAU
                    let eDescription = competence.niveaux[0].level + " : " + competence.niveaux[0].definition;
                    let mDescription = competence.niveaux[1].level + " : " + competence.niveaux[1].definition;
                    let aDescription = competence.niveaux[2].level + " : " + competence.niveaux[2].definition;
                    let xDescription = competence.niveaux[3].level + " : " + competence.niveaux[3].definition;

                    // APPEND A ROW
                    $("#comp-table-body").append('<tr class="comp-sf"></tr>');

                    if (index === 0) {
                        $("#comp-table-body").find("tr").last().append(`<td rowspan="${competences_sf.length}"> Savoir-faire </td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compSf-value"> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compSf-requis-value"> ${competence.requiredNiveau}</td>`);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${eDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="E" id="radioE-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input e-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${mDescription}">
                            <div class="">
                                <label class="custom-switch form-switch  ">
                                    <input type="radio" value="M" id="radioM-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input m-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${aDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="A" id="radioA-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input a-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${xDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="X" id="radioX-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input x-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);


                    } else {

                        $("#comp-table-body").find("tr").last().append(`<td id="compSf-value"> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compSf-requis-value"> ${competence.requiredNiveau}</td>`);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${eDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="E" id="radioE-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input e-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${mDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="M" id="radioM-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input m-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${aDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="A" id="radioA-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input a-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${xDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="X" id="radioX-${compSfBtnCompteur}" name="comp-sf-switch-radio-${compSfBtnCompteur}" class="custom-switch-input x-sf-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                    }


                    compSfBtnCompteur++;
                })


                // ADD EVENT LISTENERS
                $(".e-sf-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_sf[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    console.log(index);
                    console.log(reqNiveau);
                    console.log($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val());
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");



                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            console.log("HEEREE");
                            totalPoints++;
                            calculateScore();
                            break;

                        case "M":
                            sous_points = sous_points + 1;
                            displaySousPoints();
                            break;

                        case "A":
                            sous_points = sous_points + 2;
                            displaySousPoints();
                            break;

                        case "X":
                            sous_points = sur_points + 3;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".m-sf-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_sf[index].requiredNiveau;


                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    console.log(index);
                    console.log(reqNiveau);
                    console.log($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val());

                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }




                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":

                            totalPoints++;
                            calculateScore();

                            sur_points++;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();
                            break;

                        case "A":
                            sous_points++;
                            displaySousPoints();
                            break;

                        case "X":
                            sous_points += 2;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".a-sf-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_sf[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    console.log(index);
                    console.log(reqNiveau);
                    console.log($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val());
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 2;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 1;
                            displaySurPoints();
                            break;

                        case "A":
                            totalPoints++;
                            calculateScore();
                            break;

                        case "X":
                            sous_points = sous_points + 1;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".x-sf-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_sf[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    console.log(index);
                    console.log(reqNiveau);
                    console.log($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val());
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;
                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-sf-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 3;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 2;
                            displaySurPoints();
                            break;

                        case "A":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 1;
                            displaySurPoints();
                            break;

                        case "X":
                            totalPoints++;
                            calculateScore();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");


                })

                break;

            case "competences_se":
                let competences_se = json[key];


                if (competences_se === null) {
                    continue;
                }


                competences_se.forEach((competence, index) => {

                    // GET COMPETENCE NIVEAU
                    let eDescription = competence.niveaux[0].level + " : " + competence.niveaux[0].definition;
                    let mDescription = competence.niveaux[1].level + " : " + competence.niveaux[1].definition;
                    let aDescription = competence.niveaux[2].level + " : " + competence.niveaux[2].definition;
                    let xDescription = competence.niveaux[3].level + " : " + competence.niveaux[3].definition;

                    // APPEND A ROW
                    $("#comp-table-body").append('<tr class="comp-se"></tr>');

                    if (index === 0) {
                        $("#comp-table-body").find("tr").last().append(`<td rowspan="${competences_se.length}"> Savoir-être </td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compSe-value"> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compSe-requis-value"> ${competence.requiredNiveau}</td>`);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${eDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="E" id="radioE-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input e-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${mDescription}">
                            <div class="">
                                <label class="custom-switch form-switch  ">
                                    <input type="radio" value="M" id="radioM-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input m-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${aDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="A" id="radioA-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input a-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${xDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="X" id="radioX-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input x-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);


                    } else {

                        $("#comp-table-body").find("tr").last().append(`<td id="compSe-value"> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td id="compSe-requis-value"> ${competence.requiredNiveau}</td>`);

                        $("#comp-table-body").find("tr").last().append(`
                        <td  data-bs-placement="bottom" data-bs-toggle="tooltip" title="${eDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="E" id="radioE-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input e-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${mDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="M" id="radioM-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input m-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${aDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="A" id="radioA-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input a-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                        $("#comp-table-body").find("tr").last().append(`
                        <td data-bs-placement="bottom" data-bs-toggle="tooltip" title="${xDescription}">
                            <div class="">
                                <label class="custom-switch form-switch ">
                                    <input type="radio" value="X" id="radioX-${compSeBtnCompteur}" name="comp-se-switch-radio-${compSeBtnCompteur}" class="custom-switch-input x-se-radio-btn">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description"></span>
                                </label>
                            </div>
                        </td>                        

                        `);

                    }


                    compSeBtnCompteur++;
                })


                // ADD EVENT LISTENERS
                $(".e-se-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_se[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    console.log(index);
                    console.log(reqNiveau);
                    console.log($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]'));
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");



                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            console.log("HEEREE");
                            totalPoints++;
                            calculateScore();
                            break;

                        case "M":
                            sous_points = sous_points + 1;
                            displaySousPoints();
                            break;

                        case "A":
                            sous_points = sous_points + 2;
                            displaySousPoints();
                            break;

                        case "X":
                            sous_points = sur_points + 3;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".m-se-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_se[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }




                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":

                            totalPoints++;
                            calculateScore();

                            sur_points++;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();
                            break;

                        case "A":
                            sous_points++;
                            displaySousPoints();
                            break;

                        case "X":
                            sous_points += 2;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".a-se-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_se[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 3;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;
                            case "X":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 2;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 1;
                            displaySurPoints();
                            break;

                        case "A":
                            totalPoints++;
                            calculateScore();
                            break;

                        case "X":
                            sous_points = sous_points + 1;
                            displaySousPoints();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");
                })

                $(".x-se-radio-btn").click(function (e) {

                    // GET THE INDEX OF COMPETENCE
                    let index = parseInt(e.target.id.split("-")[1]);

                    let reqNiveau = competences_se[index].requiredNiveau;

                    // REMOVE THE EFFECT OF THE PREVIOUS SELECTED NIVEAU
                    if (reqNiveau === "E") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                totalPoints--;
                                calculateScore();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 2;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    } else if (reqNiveau === "M") {

                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;

                            case "M":
                                totalPoints--;
                                calculateScore();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();

                                sur_points = sur_points - 1;
                                displaySurPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");


                    } else if (reqNiveau === "A") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                            case "A":
                                totalPoints--;
                                calculateScore();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");

                    } else if (reqNiveau === "X") {
                        switch ($('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').val()) {
                            case "E":
                                sous_points = sous_points - 3;
                                displaySousPoints();
                                break;

                            case "M":
                                sous_points = sous_points - 2;
                                displaySousPoints();
                                break;
                            case "A":
                                sous_points = sous_points - 1;
                                displaySousPoints();
                                break;
                        }

                        // CHANGE DATA-CHECKED OF PREVIOUS BTN TO FALSE
                        $('input[name="comp-se-switch-radio-' + index + '"][data-checked="true"]').attr("data-checked", "false");
                    }


                    // ADJUST SCORE FOLLOWING THE CHECKED NIVEAU
                    switch (reqNiveau) {
                        case "E":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 3;
                            displaySurPoints();
                            break;

                        case "M":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 2;
                            displaySurPoints();
                            break;

                        case "A":
                            totalPoints++;
                            calculateScore();

                            sur_points = sur_points + 1;
                            displaySurPoints();
                            break;

                        case "X":
                            totalPoints++;
                            calculateScore();
                            break;

                    }


                    // ADD DATA-CHECKED TO TRUE
                    e.target.setAttribute("data-checked", "true");


                })


                break;

        }



    }



    // ADD EVENT LISTENERS
    $(".yes-radio-btn").on("click", function (e) {

        // GET THE ID OF CLICKED TOGGLE
        let index = parseInt(e.target.id.split("-")[1]);
        if (lastClickedIndexYes !== index) {


            totalPoints++;
            calculateScore()

            // ADD DATA ATTRIBUTE
            $("#" + e.target.id).attr("data-checked", "true");

            // CHANGE INDEX OF LAST_CLICKED_INDEX_NO
            lastClickedIndexNo = -1;

        }

        // UPDATE LASTCLICKEDBTN
        lastClickedIndexYes = index

        console.log(lastClickedIndexNo, lastClickedIndexYes);

    })

    $(".no-radio-btn").on("click", function (e) {
        // GET THE ID OF CLICKED TOGGLE
        let index = parseInt(e.target.id.split("-")[1]);
        if (lastClickedIndexNo !== index) {

            // DOES THE YES BTN IS CHECKED
            if ($("#radioYes-" + index).attr("data-checked") === "true") {
                totalPoints--;

                // MODIFY THE ATTR OF YES BTN
                $("#radioYes-" + index).attr("data-checked", "false");
            }
            // if (totalPoints != 0) {
            //     //totalPoints--;
            // } else {
            //     totalPoints = 0;
            //     sous_points++;
            //     displaySousPoints();
            // }
            calculateScore();

            // CHANGE INDEX OF LAST_CLICKED_INDEX_YES
            lastClickedIndexYes = -1;
        }



        // UPDATE LASTCLICKEDBTN
        lastClickedIndexNo = index


        console.log(lastClickedIndexNo, lastClickedIndexYes);

    })



}

// CALCULATE SCORE AND DISPLAY IT ON THE ELEMENT
function calculateScore() {
    score = Number((((totalPoints / elementsNumbers)) * 100).toFixed(1));

    $("#score").text(score.toString() + "%");
}

function displaySousPoints() {
    $("#sous-pts").text("" + sous_points);
}

function displaySurPoints() {
    $("#sur-pts").text("" + sur_points);
}

async function getFicheEmploiPreview(params) {
    let url = "http://localhost:8080/preassessment/api/v1/ficheEvaluation/preview" + params;

    return fetch(url, {
        method: 'GET'
    }).then((response) => {
        return response.json();
    }).then((success) => {
        //console.log(success);

        //GET NUMBER OF INPUTS TO CALCULATE SCORE
        elementsNumbers = countsInputs(success);
        return success;
    }).catch(error => console.log(error))
}

function addClickEventListener(className) {
    if (className.includes("yes-radio-btn")) {

        console.log("OUii");
        $("." + className).each(function (index, element) {
            element.click(function () {
                totalPoints++;
            })
        })

    } else if (className.includes("no-radio-btn")) {

        console.log("NOOON");
        $("." + className).each(function (index, element) {
            element.click(function () {
                totalPoints--;
            })
        })
    }

    $("#score").html(((totalPoints / elementsNumbers) * 100).toString() + "%");
}

function countsInputs(json) {
    let compteur = 0;

    for (var key of Object.keys(json)) {
        if (json[key] === null) {
            continue;
        }
        switch (key) {
            case "responsabilites":
                let categories = json[key];
                categories.forEach((categorie) => {
                    compteur += categorie.valeur.length;
                })
                break;
            case "marqueurs":
                compteur += json[key].length;
                break;
            case "exigences":
                compteur += json[key].length;
                break;
            case "competences_dc":
                compteur += json[key].length;
                break;
            case "competences_sf":
                compteur += json[key].length;
                break;
            case "competences_se":
                compteur += json[key].length;
                break;
        }
    }

    return compteur;
}


async function getFicheEvaluation(id) {
    let url = "http://localhost:8080/preassessment/api/v1/ficheEvaluation/" + id;

    return fetch(url, {
        method: 'GET'
    }).then(response => response.json())
        .then(success => {
            console.log(success);
            return success;
        })
        .catch(error => console.log(error))
}


function addLoaderToBtn(btnId) {

    // ADD LOADER HTML ELEMENT
    $(btnId).prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
}

function deleteLoaderToBtn(btnId) {

    // REMOVE LOADER HTML ELEMENT
    $(btnId).find("span").remove();
}


function calculateCompletionOfAllSections() {

    // SECTION : RESPONSABILITES
    let resSize = $(".responsabilites").length;
    let resCounter = 0;
    $(".responsabilites").find("input[type='radio']:checked").each(function (index, element) {
        console.log($(element).val());
        if ($(element).val() == 1) {
            resCounter++;
        }
    })
    percentagePerSection.section_res = Number((resCounter / resSize) * 100).toFixed(1);

    // SECTION : EXIGENCES
    let exiSize = $(".exigences").length;
    let exiCounter = 0;
    $(".exigences").find("input[type='radio']:checked").each(function (index, element) {
        console.log($(element).val());
        if ($(element).val() == 1) {
            exiCounter++;
        }
    })
    percentagePerSection.section_exi = Number((exiCounter / exiSize) * 100).toFixed(1);

    // SECTION : MARQUEURES
    let marqSize = $(".marqueurs").length;
    let marqCounter = 0;
    $(".marqueurs").find("input[type='radio']:checked").each(function (index, element) {
        console.log($(element).val());
        if ($(element).val() == 1) {
            marqCounter++;
        }
    })
    percentagePerSection.section_marq = Number((marqCounter / marqSize) * 100).toFixed(1);





    // SECTION : COMPETENCES-DC
    let listCompetencesDc = fichePreviewJson["competences_dc"];
    if (listCompetencesDc.length != 0) {
        let compDcSize = $(".comp-dc").length;
        let compDcCounter = 0;

        $(".comp-dc").find("input[type='radio']:checked").each(function (i, element) {


            // GET THE INDEX OF COMPETENCE
            let index = $(element).attr("id").split("-")[1];

            let reqNiveau = listCompetencesDc[index].requiredNiveau;


            if (reqNiveau === "E") {

                switch ($(element).val()) {
                    case "E":
                        compDcCounter++;
                        break;
                    case "M":
                        compDcCounter++;
                        break;
                    case "A":
                        compDcCounter++;
                        break;
                    case "X":
                        compDcCounter++;
                        break;

                }

            } else if (reqNiveau === "M") {
                switch ($(element).val()) {
                    case "E":
                        break;
                    case "M":
                        compDcCounter++;
                        break;
                    case "A":
                        compDcCounter++;
                        break;
                    case "X":
                        compDcCounter++;
                        break;

                }

            } else if (reqNiveau === "A") {
                switch ($(element).val()) {
                    case "E":

                        break;
                    case "M":

                        break;
                    case "A":
                        compDcCounter++;
                        break;
                    case "X":
                        compDcCounter++;
                        break;

                }

            } else if (reqNiveau === "X") {
                switch ($(element).val()) {
                    case "E":

                        break;
                    case "M":

                        break;
                    case "A":

                        break;
                    case "X":
                        compDcCounter++;
                        break;

                }

            }

        })
        // console.log(Number((compDcCounter / compDcSize) * 100).toFixed(1));
        percentagePerSection.section_dc = Number((compDcCounter / compDcSize) * 100).toFixed(1);
    } else {
        percentagePerSection.section_dc = "NaN";
    }

    // SECTION : COMPETENCES-SE
    let listCompetencesSe = fichePreviewJson["competences_se"];
    if (listCompetencesSe.length != 0) {
        let compSeSize = $(".comp-se").length;
        let compSeCounter = 0;

        $(".comp-se").find("input[type='radio']:checked").each(function (i, element) {


            // GET THE INDEX OF COMPETENCE
            let index = $(element).attr("id").split("-")[1];

            let reqNiveau = listCompetencesSe[index].requiredNiveau;


            if (reqNiveau === "E") {

                switch ($(element).val()) {
                    case "E":
                        compSeCounter++;
                        break;
                    case "M":
                        compSeCounter++;
                        break;
                    case "A":
                        compSeCounter++;
                        break;
                    case "X":
                        compSeCounter++;
                        break;

                }

            } else if (reqNiveau === "M") {
                switch ($(element).val()) {
                    case "E":
                        break;
                    case "M":
                        compSeCounter++;
                        break;
                    case "A":
                        compSeCounter++;
                        break;
                    case "X":
                        compSeCounter++;
                        break;

                }

            } else if (reqNiveau === "A") {
                switch ($(element).val()) {
                    case "E":

                        break;
                    case "M":

                        break;
                    case "A":
                        compSeCounter++;
                        break;
                    case "X":
                        compSeCounter++;
                        break;

                }

            } else if (reqNiveau === "X") {
                switch ($(element).val()) {
                    case "E":

                        break;
                    case "M":

                        break;
                    case "A":

                        break;
                    case "X":
                        compSeCounter++;
                        break;

                }

            }

        })
        // console.log(Number((compSeCounter / compSeSize) * 100).toFixed(1))
        console.log(compSeCounter, compSeSize, Number((compSeCounter / compSeSize) * 100).toFixed(1));
        percentagePerSection.section_se = Number((compSeCounter / compSeSize) * 100).toFixed(1);
    } else {
        percentagePerSection.section_se = "NaN";
    }

    // SECTION : COMPETENCES-SF
    let listCompetencesSf = fichePreviewJson["competences_sf"];
    if (listCompetencesSf.length != 0) {
        let compSfSize = $(".comp-sf").length;
        let compSfCounter = 0;
        $(".comp-sf").find("input[type='radio']:checked").each(function (i, element) {


            // GET THE INDEX OF COMPETENCE
            let index = $(element).attr("id").split("-")[1];

            let reqNiveau = listCompetencesSf[index].requiredNiveau;


            if (reqNiveau === "E") {

                switch ($(element).val()) {
                    case "E":
                        compSfCounter++;
                        break;
                    case "M":
                        compSfCounter++;
                        break;
                    case "A":
                        compSfCounter++;
                        break;
                    case "X":
                        compSfCounter++;
                        break;

                }

            } else if (reqNiveau === "M") {
                switch ($(element).val()) {
                    case "E":
                        break;
                    case "M":
                        compSfCounter++;
                        break;
                    case "A":
                        compSfCounter++;
                        break;
                    case "X":
                        compSfCounter++;
                        break;

                }

            } else if (reqNiveau === "A") {
                switch ($(element).val()) {
                    case "E":

                        break;
                    case "M":

                        break;
                    case "A":
                        compSfCounter++;
                        break;
                    case "X":
                        compSfCounter++;
                        break;

                }

            } else if (reqNiveau === "X") {
                switch ($(element).val()) {
                    case "E":

                        break;
                    case "M":

                        break;
                    case "A":

                        break;
                    case "X":
                        compSfCounter++;
                        break;

                }

            }

        });
        // console.log(Number((compSfCounter / compSfSize) * 100).toFixed(1));
        percentagePerSection.section_sf = Number((compSfCounter / compSfSize) * 100).toFixed(1);
    } else {
        percentagePerSection.section_sf = "NaN";
    }

    console.log(percentagePerSection);





}


