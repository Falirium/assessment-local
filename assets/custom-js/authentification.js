// GET VALUES FROM INPUTS
let matricule;
let password;

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
    if (validateMatriculeConsultant(matricule, password)) {

        // SAVE MANAGER MATRICULE
        localStorage.setItem("user", "admin");

        // SET AUTHORIZATION : 
        let auth = {
            "regex": [
                '(\\/\\w*)(\\/\\w*)\\?*'
            ],
            "sections": {
                "hide": [],
                "show": []
            }
        }

        localStorage.setItem("auth", JSON.stringify(auth));

        // REDIRECT TO HOMEPAGE
        let currentUrl = window.location.href;
        window.location.replace(extractDomain(currentUrl) + "assessment/list");

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
    validateMatricule(authObj).then((authRes) => {



        if (authRes.code === 404) {

            console.log("error 2");

            // SHOW ERROR MODAL
            showModal("error", "Échec", "L'authentification a échoué, car la matrice et/ou les données sont incorrectes. Veuillez réessayer avec des informations d'identification valides.", "");


        } else if (authRes.auth == true) {

            // SET AUTHORIZATION
            let auth = {
                "regex": [
                    '\\/(evaluation|assessment)\\/(.*|list)',

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
                            "name" : "add assessment",
                            "id" : "#btn-add-assessment"
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


            getDrhInfo(authObj.matricule).then((drh) => {

                // SET USER INFO
                let user = {
                    "type": "drh",
                    "data": authRes.dthUser
                };


                localStorage.setItem("user", JSON.stringify(user));
            }).then((next) => {

                // REDIRECT TO HOMEPAGE
                let currentUrl = window.location.href;
                window.location.replace(extractDomain(currentUrl) + "assessment/list");
                console.log("redirected");

            }).catch((error) => {

                console.log(error);

                // SHOW ERROR MODAL
                showModal("error", "Échec", "Un problème interne a interrompu le processus. Veuillez actualiser la page et réessayer.", "");
            })




        } else if (isValid == false) {

            console.log("error 2");

            // SHOW ERROR MODAL
            showModal("error", "Échec", "L'authentification a échoué, car la matrice et/ou les données sont incorrectes. Veuillez réessayer avec des informations d'identification valides.", "");

        }



    }).catch((error) => {

        // SHOW ERROR MODAL
        showModal("error", "Échec", "L'authentification a échoué, car la matrice et/ou les données sont incorrectes. Veuillez réessayer avec des informations d'identification valides.", "");
    });


})

// AUTHENTIFICATION MANAGER

$("#cnx-btn-manager").click(function () {

    let authObj = {
        "type": "manager",
        "matricule": matricule,
        "pwd": password
    }

    console.log(authObj);
    validateMatricule(authObj).then((authRes) => {

        // CHECK RESPONSE
        if (authRes.hasOwnProperty("code") || authRes.auth === false) {
            showModal("error", "Erreur", "L'authentification a échoué. Veuillez entrer une combinaison correcte du nom d'utilisateur et du mot de passe.");
        } else {
            
            // SET AUTHORIZATION
            let auth = {
                "regex": [
                    '\\/(evaluation)\\/(evaluate|list)\\?*',

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

            let manager = null;

            if (authRes.type === "1") {
                manager = authRes.managerOneUser;
                showModal("success", "Welcome :" + manager.firstName, "Vous avez été connecté avec succès");

                // SAVE MANAGER MATRICULE
                let user = {
                    "type": "1",
                    "data" : manager

                }

                localStorage.setItem("user", JSON.stringify(user));

                // CHANGE BREADCRUMB TEXT TO MANAGER N+1
                auth.sections.show.push(
                    {
                        "type": "text",
                        "name": "breadcrumb",
                        "id": "#breadcrumb-text",
                        "text": "Manager N+1"
                    }
                );
            } else if (authRes.type === "2") {
                manager = authRes.managerTwoUser;
                showModal("success", "Welcome :" + manager.firstName, "Vous avez été connecté avec succès");

                
                // SAVE MANAGER MATRICULE
                let user = {
                    "type": "2",
                    "data" : manager

                }

                localStorage.setItem("user", JSON.stringify(user));

                // // REDIRECT TO HOMEPAGE
                let currentUrl = window.location.href;
                window.location.replace(extractDomain(currentUrl) + "evaluation/list");

                console.log("redirected");

                // CHANGE BREADCRUMB TEXT TO MANAGER N+1
                auth.sections.show.push(
                    {
                        "type": "text",
                        "name": "breadcrumb",
                        "id": "#breadcrumb-text",
                        "text": "Manager N+2"
                    }
                );
            }

            localStorage.setItem("auth", JSON.stringify(auth));
            // console.log(localStorage.getItem("user"));


            // // REDIRECT TO HOMEPAGE
            let currentUrl = window.location.href;
            window.location.replace(extractDomain(currentUrl) + "evaluation/list");
            console.log("redirected");
        }
    })

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

async function validateMatricule(json) {
    let url1 = "http://localhost:8080/preassessment/api/v1/employee/auth";

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


function showModal(type, header, content, action) {

    let modalId, modalHeaderId, modalContentId;



    switch (type) {
        case "success":
            modalId = "success";
            modalHeaderId = "#modal-success-header";
            modalContentId = "#modal-success-content";
            break;

        case "warning":
            modalId = "warning";
            modalHeaderId = "#modal-warning-header";
            modalContentId = "#modal-warning-content";
            break;

        case "info":
            modalId = "info";
            modalHeaderId = "#modal-info-header";
            modalContentId = "#modal-info-content";
            break;

        case "error":
            modalId = "modaldemo5";
            modalHeaderId = "#modal-error-header";
            modalContentId = "#modal-error-content";
            $("#confirm-yes-btn").attr("data-action", action);
            break;

        case "confirm":
            modalId = "confirm";
            modalHeaderId = "#modal-confirm-header";
            modalContentId = "#modal-confirm-content";
            $("#confirm-yes-btn").attr("data-action", action);
            break;
    }


    var myModal = new bootstrap.Modal(document.getElementById(modalId));

    // SET HEADER
    $(modalHeaderId).text(header);

    // SET CONTENT
    $(modalContentId).html(content)

    myModal.show();

}

