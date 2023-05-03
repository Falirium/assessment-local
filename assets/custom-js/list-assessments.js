
console.log("list-assessments.js");

// REMOVE ANY SAVED ASSESSMENT ID;
removeAssessmentFromStorage();



let authorizedCol = ["id", "name", "startedAt", "finishesAt", "status"];

let assessmentDatatable;



let listAssessments;

// INITIALIZATION 


// END INITIALIZATION

// GET LIST OF ASSESSMENTS
getListOfTempAssessments().then((data) => {



    // APPEND THE TEMP RESULTS TO  TEMP OF ASSESSMENTS  FIRST
    listAssessments = data;
    console.log(listAssessments);


}).then((data) => {

    getListOfAssessments().then((temp) => {

        let user = (localStorage.getItem("user") === "admin") ? "admin" : JSON.parse(localStorage.getItem("user"));

        console.log(user);

        // UPDATE BREADCRUMB
        updateBreadcrumb(user);

        // APPEND THE PUBLISHED LIST OF ASSESSMENTS
        listAssessments.push(...temp);

        let dataSet = []
        let col = []

        // CHECK IF WE ARE IN DRH SESSION
        if (user.type === "drh") {
            listAssessments = filterAssessmentsByBpr(listAssessments, user.data.topDirection);

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

                window.location.href = extractDomain(currentUrl) + "assessment/" + assessment.id;
                // console.log(extractDomain(currentUrl) + "assessment/add");
                // console.log(localStorage.getItem("assessmentId"));
            }
        })

    })
})

function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
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
        console.log(col);
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

            console.log(value);



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