// GET VALUES FROM INPUTS
let matricule;
let password;

let assessment_ID = "";
const idb_config = "assessments_config";
const idb_result = "assessments_results";
let users = [];

// INITIALIZATION
intializeDB()
    .then((data) => {
        assessment_ID = data.assessmentId;
        users = data.users;
    })

// END INITIALISATION

$(".matricule-input").change(function (e) {
    matricule = e.target.value;

    console.log("matricule :" + matricule);
})

$(".pwd-input").change(function (e) {
    password = e.target.value;

    console.log("password :" + password);
})

// AUTHENTIFICATION BCP
$("#cnx-btn").click(function () {
    //console.log(typeof(authenticate(matricule)), typeof(authenticate(matricule).then));
    // if (validateMatriculeConsultant(matricule, password)) {

    //     // SAVE MANAGER MATRICULE
    //     localStorage.setItem("user", "admin");

    //     // SET AUTHORIZATION : 
    //     // let auth = {
    //     //     "regex": [
    //     //         '(\\/\\w*)(\\/\\w*)\\?*'
    //     //     ],
    //     //     "sections": {
    //     //         "hide": [],
    //     //         "show": []
    //     //     }
    //     // }

    //     // localStorage.setItem("auth", JSON.stringify(auth));

    //     let auth = {
    //         "regex": [
    //             '(list-assessments|assesment-result|fiche-evaluation)\\\.html',

    //         ],
    //         "sections": {
    //             "hide": [

    //                 {
    //                     "name": "emploi",
    //                     "id": "#emploi"
    //                 },
    //                 {
    //                     "name": "pv",
    //                     "id": "#pv"
    //                 },
    //                 {
    //                     "name": "drh",
    //                     "id": "#drh"
    //                 },
    //                 {
    //                     "name": "manager",
    //                     "id": "#manager"
    //                 },
    //                 {
    //                     "name": "add assessment",
    //                     "id": "#btn-add-assessment"
    //                 }
    //             ],
    //             "show": [
    //                 {
    //                     "type": "anchor",
    //                     "name": "dashboard",
    //                     "id": "#dashboard",
    //                     "link": "/assessment/list"
    //                 }
    //             ]
    //         }
    //     };

    //     // REDIRECT TO HOMEPAGE
    //     let currentUrl = window.location.href;
    //     // window.location.replace(extractDomain(currentUrl) + "assessment/list");
    //     window.location.href = './list-assessments.html';
    //     console.log("SUCCESS CONNECTION ADMIN")

    // }

    let authObj = {

        "matricule": matricule,
        "pwd": password
    }



    let resultAuth = validateMatricule(authObj);
    console.log(validateMatricule(authObj));
    if (resultAuth.status == false) {

        showModal("error", "Échec", "L'authentification a échoué, car la matrice et/ou les données sont incorrectes. Veuillez réessayer avec des informations d'identification valides.", "");

    } else {
        let roleAuth = resultAuth.user.role;
        if (resultAuth.status && roleAuth === "drh") {

            // SET AUTHORIZATION
            let auth = {
                "regex": [
                    '(list-assessments|assesment-result|fiche-evaluation)\\\.html',

                ],
                "sections": {
                    "hide": [

                        {
                            "name": "emploi",
                            "id": "#emploi"
                        },
                        {
                            "name": "pv",
                            "id": "#pv"
                        },
                        {
                            "name": "drh",
                            "id": "#drh"
                        },
                        {
                            "name": "manager",
                            "id": "#manager"
                        },
                        {
                            "name": "add assessment",
                            "id": "#btn-add-assessment"
                        }
                    ],
                    "show": [
                        {
                            "type": "anchor",
                            "name": "dashboard",
                            "id": "#dashboard",
                            "link": "/assessment/list"
                        }
                    ]
                }
            };
            localStorage.setItem("auth", JSON.stringify(auth));

            let userData = {

            }

            // SET USER INFO
            let user = {
                "type": "drh",
                "data": resultAuth.user
            };
            localStorage.setItem("user", JSON.stringify(user));


            // REDIRECT TO HOMEPAGE
            window.location.href = './list-assessments.html';
            console.log("SUCCESS CONNECTION BPR");
        } else if (resultAuth.status && roleAuth.includes("manager")) {

            // SET AUTHORIZATION
            let auth = {
                "regex": [
                    '(list-fiches|fiche-evaluation)\\\.html',

                ],
                "sections": {
                    "hide": [
                        {
                            "name": "assessment",
                            "id": "#assessment"

                        },
                        {
                            "name": "emploi",
                            "id": "#emploi"
                        },
                        {
                            "name": "pv",
                            "id": "#pv"
                        }
                    ],
                    "show": [
                        {
                            "type": "anchor",
                            "name": "dashboard",
                            "id": "#dashboard",
                            "link": "/evaluation/list"
                        }
                    ]
                }
            }
            console.log(auth);


            let manager = resultAuth.user;

            let managerType = resultAuth.user.role;

            if (getSecondPart(managerType, '-') === "1") {

                // manager = authRes.managerOneUser;
                showModal("success", "Welcome :" + manager.matricule, "Vous avez été connecté avec succès");

                // SAVE MANAGER MATRICULE
                let user = {
                    "type": "1",
                    "data": manager

                }

                localStorage.setItem("user", JSON.stringify(user));

                console.log("SUCCESS CONNECTION MANAGER N+1")


                // CHANGE BREADCRUMB TEXT TO MANAGER N+1
                auth.sections.show.push(
                    {
                        "type": "text",
                        "name": "breadcrumb",
                        "id": "#breadcrumb-text",
                        "text": "Espace Manager N+1"
                    }
                );
            } else if (getSecondPart(managerType, '-') === "2") {

                // manager = authRes.managerTwoUser;
                showModal("success", "Welcome :" + manager.matricule, "Vous avez été connecté avec succès");


                // SAVE MANAGER MATRICULE
                let user = {
                    "type": "2",
                    "data": manager

                }

                localStorage.setItem("user", JSON.stringify(user));

                // // REDIRECT TO HOMEPAGE
                let currentUrl = window.location.href;
                // window.location.replace(extractDomain(currentUrl) + "evaluation/list");
                console.log("SUCCESS CONNECTION MANAGER N+2")


                // CHANGE BREADCRUMB TEXT TO MANAGER N+1
                auth.sections.show.push(
                    {
                        "type": "text",
                        "name": "breadcrumb",
                        "id": "#breadcrumb-text",
                        "text": "Espqce Manager N+2"
                    }
                );
            }

            localStorage.setItem("auth", JSON.stringify(auth));
            // console.log(localStorage.getItem("user"));


            // // REDIRECT TO HOMEPAGE
            window.location.href = './list-fiches.html';
        }
    }




})


// AUTHENTIFICATION BPR
$("#cnx-btn-bpr").click(function () {
    //console.log(typeof(authenticate(matricule)), typeof(authenticate(matricule).then));

    let authObj = {
        "type": "drh",
        "matricule": matricule,
        "pwd": password
    }

    console.log(authObj);

    let resultAuth = validateMatricule(authObj);

    console.log(resultAuth);

    if (resultAuth.status && resultAuth.user.role === "drh") {

        // SET AUTHORIZATION
        let auth = {
            "regex": [
                '(list-assessments|assesment-result|fiche-evaluation)\\\.html',

            ],
            "sections": {
                "hide": [

                    {
                        "name": "emploi",
                        "id": "#emploi"
                    },
                    {
                        "name": "pv",
                        "id": "#pv"
                    },
                    {
                        "name": "drh",
                        "id": "#drh"
                    },
                    {
                        "name": "manager",
                        "id": "#manager"
                    },
                    {
                        "name": "add assessment",
                        "id": "#btn-add-assessment"
                    }
                ],
                "show": [
                    {
                        "type": "anchor",
                        "name": "dashboard",
                        "id": "#dashboard",
                        "link": "/assessment/list"
                    }
                ]
            }
        };
        localStorage.setItem("auth", JSON.stringify(auth));

        let userData = {

        }

        // SET USER INFO
        let user = {
            "type": "drh",
            "data": resultAuth.user
        };
        localStorage.setItem("user", JSON.stringify(user));


        // REDIRECT TO HOMEPAGE
        window.location.href = './list-assessments.html';
        console.log("SUCCESS CONNECTION BPR");
    } else {

        // SHOW ERROR MODAL
        showModal("error", "Échec", "L'authentification a échoué, car la matrice et/ou les données sont incorrectes. Veuillez réessayer avec des informations d'identification valides.", "");
    }



})

// AUTHENTIFICATION MANAGER

$("#cnx-btn-manager").click(function () {

    let authObj = {
        "type": "manager",
        "matricule": matricule,
        "pwd": password
    }

    // console.log(authObj);
    let resultAuth = validateMatricule(authObj);
    console.log(resultAuth);

    let roleAuth = resultAuth.user.role;
    if (resultAuth.status && roleAuth.includes("manager")) {

        // SET AUTHORIZATION
        let auth = {
            "regex": [
                '(list-fiches|fiche-evaluation)\\\.html',

            ],
            "sections": {
                "hide": [
                    {
                        "name": "assessment",
                        "id": "#assessment"

                    },
                    {
                        "name": "emploi",
                        "id": "#emploi"
                    },
                    {
                        "name": "pv",
                        "id": "#pv"
                    }
                ],
                "show": [
                    {
                        "type": "anchor",
                        "name": "dashboard",
                        "id": "#dashboard",
                        "link": "/evaluation/list"
                    }
                ]
            }
        }
        console.log(auth);


        let manager = resultAuth.user;

        let managerType = resultAuth.user.role;

        if (getSecondPart(managerType, '-') === "1") {

            // manager = authRes.managerOneUser;
            showModal("success", "Welcome :" + manager.matricule, "Vous avez été connecté avec succès");

            // SAVE MANAGER MATRICULE
            let user = {
                "type": "1",
                "data": manager

            }

            localStorage.setItem("user", JSON.stringify(user));

            console.log("SUCCESS CONNECTION MANAGER N+1")


            // CHANGE BREADCRUMB TEXT TO MANAGER N+1
            auth.sections.show.push(
                {
                    "type": "text",
                    "name": "breadcrumb",
                    "id": "#breadcrumb-text",
                    "text": "Espace Manager N+1"
                }
            );
        } else if (getSecondPart(managerType, '-') === "2") {

            // manager = authRes.managerTwoUser;
            showModal("success", "Welcome :" + manager.matricule, "Vous avez été connecté avec succès");


            // SAVE MANAGER MATRICULE
            let user = {
                "type": "2",
                "data": manager

            }

            localStorage.setItem("user", JSON.stringify(user));

            // // REDIRECT TO HOMEPAGE
            let currentUrl = window.location.href;
            // window.location.replace(extractDomain(currentUrl) + "evaluation/list");
            console.log("SUCCESS CONNECTION MANAGER N+2")


            // CHANGE BREADCRUMB TEXT TO MANAGER N+1
            auth.sections.show.push(
                {
                    "type": "text",
                    "name": "breadcrumb",
                    "id": "#breadcrumb-text",
                    "text": "Espace Manager N+2"
                }
            );
        }

        localStorage.setItem("auth", JSON.stringify(auth));
        // console.log(localStorage.getItem("user"));


        // // REDIRECT TO HOMEPAGE
        window.location.href = './list-fiches.html';



    } else {
        showModal("error", "Erreur", "L'authentification a échoué. Veuillez entrer une combinaison correcte du nom d'utilisateur et du mot de passe.");

    }



    // authenticate(matricule).then((manager) => {
    //     // console.log(manager, password);
    //     // console.log(manager.type, (password === "manager2"));

    //     // SET AUTHORIZATION
    //     let auth = {
    //         "regex": [
    //             '\\/(evaluation)\\/(evaluate|list)\\?*',

    //         ],
    //         "sections": {
    //             "hide": [
    //                 {
    //                     "name": "assessment",
    //                     "id": "#assessment"

    //                 },
    //                 {
    //                     "name": "emploi",
    //                     "id": "#emploi"
    //                 },
    //                 {
    //                     "name": "pv",
    //                     "id": "#pv"
    //                 }
    //             ],
    //             "show": [
    //                 {
    //                     "type": "anchor",
    //                     "name": "dashboard",
    //                     "id": "#dashboard",
    //                     "link": "/evaluation/list"
    //                 }
    //             ]
    //         }
    //     }

    //     if (manager.type === "1" && password === "manager1") {
    //         showModal("success", "Welcome :" + manager.data.firstName, "Vous avez été connecté avec succès");

    //         // SAVE MANAGER MATRICULE
    //         localStorage.setItem("user", JSON.stringify(manager));

    //         // CHANGE BREADCRUMB TEXT TO MANAGER N+1
    //         auth.sections.show.push(
    //             {
    //                 "type": "text",
    //                 "name": "breadcrumb",
    //                 "id": "#breadcrumb-text",
    //                 "text": "Manager N+1"
    //             }
    //         );




    //     } else if (manager.type == "2" && password === "manager2") {
    //         showModal("success", "Welcome :" + manager.data.firstName, "Vous avez été connecté avec succès");

    //         // SAVE MANAGER MATRICULE
    //         localStorage.setItem("user", JSON.stringify(manager));

    //         // // REDIRECT TO HOMEPAGE
    //         // let currentUrl = window.location.href;
    //         // window.location.replace(extractDomain(currentUrl) + "evaluation/list");

    //         // console.log("redirected");

    //         // CHANGE BREADCRUMB TEXT TO MANAGER N+1
    //         auth.sections.show.push(
    //             {
    //                 "type": "text",
    //                 "name": "breadcrumb",
    //                 "id": "#breadcrumb-text",
    //                 "text": "Manager N+2"
    //             }
    //         );

    //     } else {
    //         showModal("error", "échec", "Le mot de passe est incorrect")
    //     }



    //     localStorage.setItem("auth", JSON.stringify(auth));


    //     // REDIRECT TO HOMEPAGE
    //     let currentUrl = window.location.href;
    //     window.location.replace(extractDomain(currentUrl) + "evaluation/list");
    //     console.log("redirected");

    // });


})
const extractDomain = (url) => {
    const elems = url.split("/");
    return elems[0] + "//" + elems[2] + "/";
}

// ADD EVENT LISTENERS 
$("#forget-pwd").click(function () {
    showModal("info", "Mot-de-passe oublié !", `
    <p>Pour récupérer votre mot de passe, n'hésitez pas à contacter la Direction des Ressources Humaines de votre Banque Populaire Régionale.</p>

<br>
<p>Dans l'objet de l'e-mail, indiquez : <strong>Mot de passe oublié</strong> et ajoutez en pièce jointe <strong>le fichier JSON</strong> que vous recevez par e-mail.</p>

    
    `)
})

$("#contact-us").click(function () {
    showModal("info", "Contacter-nous", `
    <p>Si vous avez besoin d'assistance ou si vous avez des questions supplémentaires, n'hésitez pas à contacter la Direction des Ressources Humaines de votre Banque Populaire Régionale.</p>
    <br>
    `)
})

async function authenticate(mat) {



    // GET THE MANAGER
    return validateMatriculeManagerOne(mat).then((res) => {
        let manager = {}
        if (res.code === 404) {
            console.log("mal9itoch");

            return validateMatriculeManagerTwo(mat).then((res) => {
                // let manager = {
                //     "type": "",
                //     "data": {}
                // }
                console.log(manager.type);
                if (res.code === 404) {
                    throw "Manager not found";
                } else {
                    manager.type = "2";
                    manager.data = res;
                    console.log(manager);
                }
                return manager;
            }).catch((error) => {
                console.log("not found manager 2");
                showModal("error", "L'authentification a échoué", "Le matricle est erroné", "");
            })
        } else {
            manager.type = "1";
            manager.data = res;
        }
        return manager;


    }).catch((error) => {
        let errorMsg = error;
        console.log("not found manager 1");
        console.log(mat);
        return error;

        //showModal("error", "L'authentification a échoué", error, "");

    })




}

async function validateMatriculeManagerOne(matricule) {
    let url1 = "http://localhost:8080/preassessment/api/v1/employee/managerOne/" + matricule;


    return fetch(url1, {
        method: 'GET'
    }).then(response => response.json())
        .then((success) => {
            console.log(success);
            return success;
        }).catch((error) => {
            console.error(error);
            return error;
        })
}

function validateMatricule(json) {
    console.log("herrre in function");
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(user, json);
        if (user.matricule === json.matricule && user.hashedPwd === json.pwd) {
            return {
                "status": true,
                "user": user
            }
        }
    }

    return {
        "status": false,
        "user": null
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

async function validateMatriculeManagerOne(json) {
    let url1 = "http://localhost:8080/preassessment/api/v1/employee/managerOne/auth";

    return fetch(url1, {
        method: 'POST',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json) // This is your file object
    }).then(response => response.json())
        .then((success) => {
            console.log(success);
            return success;
        }).catch((error) => {
            console.error(error);
            console.log("error 1");
            return error;
        })
}

async function validateMatriculeManagerTwo(json) {
    let url1 = "http://localhost:8080/preassessment/api/v1/employee/managerTwo/auth";

    return fetch(url1, {
        method: 'POST',
        headers: {
            // Content-Type may need to be completely **omitted**
            // or you may need something
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json) // This is your file object
    }).then(response => response.json())
        .then((success) => {
            console.log(success);
            return success;
        }).catch((error) => {
            console.error(error);
            console.log("error 1");
            return error;
        })
}

async function validateMatriculeManagerTwo(matricule) {

    let url2 = "http://localhost:8080/preassessment/api/v1/employee/managerTwo/" + matricule;

    return fetch(url2, {
        method: 'GET'
    }).then(response => response.json())
        .then((success) => {
            console.log(success);
            return success;
        }).catch((error) => {
            console.error(error);
            return error;
        })
}
async function getDrhInfo(matricule) {
    let url2 = "http://localhost:8080/preassessment/api/v1/employee/drh/" + matricule;

    return fetch(url2, {
        method: 'GET'
    }).then(response => response.json())
        .then((success) => {
            console.log(success);
            return success;
        }).catch((error) => {
            console.error(error);
            return error;
        })
}

function validateMatriculeConsultant(matricule, pwd) {

    if (matricule === "admin" && pwd === "admin123") {

        return true;
    } else {
        showModal("error", "Échec", "Le matricule ou bien le mot de passe sont incorrects. Veuillez réessayer de vous reconnecter ", "")
        return false;
    }
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


async function intializeDB() {
    return getAllDataFromDB(idb_config)
        .then((result) => {
            let assessmentData = result.files[0];
            // console.log(assessmentData);
            return assessmentData;
        })
}


function getSecondPart(str, delimiter) {
    const parts = str.split(delimiter);
    return parts[1] || '';
}
