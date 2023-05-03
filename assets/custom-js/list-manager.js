console.log("list-managers");



// let authorizedCol = ["id", "intitule", "level", "filiere", "sousFiliere", "dateMaj"];
let authorizedCol = ["idManager", "matricule", "firstName", "lastName", "topDirection"];


let managerDataTable;


let listManagers;

// GET LIST OF EMPLOIS
getListOfManagers().then((data) => {

    if (data.hasOwnProperty("code")) {
        listManagers = [];
    } else {
        listManagers = data;
        // ATRIBUTE TOP-DIRECTION TO EACH MANAGER
        listManagers = listManagers.map((e, i) => {
            if (e.affectationCode == null) {
                e.topDirection = "*** Non spécifié ***"
            } else {
                e.topDirection = attributeBprByAffectationCode(e.matricule);
            }
            return e;
        })
    }




    // INITIALIZE DATATABLE
    let dataSet = getDrhsDataFromJson(listManagers);
    let col = getManagerColumnFromJson(listManagers[0], authorizedCol);

    managerDataTable = $("#tbs2").DataTable({
        data: dataSet,
        // columns: col
    })

    // ADD EVENTLISTENERS TO VIEW BTN

    $(".view-btn").click(function (e) {

        let aElement;
        if (e.target.tagName === "SPAN") {
            aElement = e.target.parentElement;
        } else {
            aElement = e.target;
        }


        let managerMatricule = $(aElement).parents("td").siblings().slice(1, 2).text();
        console.log(managerMatricule);

        let managerObj = getManagerInfoFromArr(managerMatricule).manager;
        console.log(managerObj);

        //SAVE EMPLOI ON LOCAL SESSION
        localStorage.setItem("managerObj", JSON.stringify(managerObj));

        // REDIRECT TO THE EMPLOI EDIT PAGE 

        let currentUrl = window.location.href;
        window.location.href = extractDomain(currentUrl) + "employee/manager/edit";


    })

})

function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
}

async function getListOfManagers() {
    let url = "http://localhost:8080/preassessment/api/v1/employee/managers";
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

function getManagerColumnFromJson(json, authorizedCol) {
    let colArr = [];


    if (typeof (json) === 'undefined') {
        return [];
    }


    authorizedCol.map((col, index) => {
        let value;
        console.log(col);
        console.log(json.hasOwnProperty(col));
        if (json.hasOwnProperty(col)) {
            switch (col) {
                case "idManager":
                    value = "id";
                    break;
                case "firstName":
                    value = "Prénom ";
                    break;
                case "matricule":
                    value = "matricule"
                    break;
                case "topDirection":
                    value = "BPR"
                    break;


            }

            console.log(value);

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

function getDrhsDataFromJson(arrJson) {
    let finalArr = [];

    console.log(arrJson, arrJson.length)

    if (arrJson.length == 0) {
        return finalArr;
    }

    arrJson.map((e, i) => {
        console.log(i);
        let arr = [];

        if (e.hasOwnProperty("idManagerOne")) {
            arr.push(e.idManagerOne);
        } else if (e.hasOwnProperty("idManagerTwo")) {
            arr.push(e.idManagerTwo);
        }
        arr.push(e.matricule);
        arr.push(capitilizeFirstLetter(e.firstName));
        arr.push(capitilizeFirstLetter(e.lastName));

        arr.push(displayFullBpr(e.topDirection));

        // ACTION COL
        arr.push(`
            <div class="g-1">
                <a class="btn text-primary btn-sm view-btn" data-bs-toggle="tooltip"
                    data-bs-original-title="Consulter"><span
                        class="fe fe-edit fs-14"></span></a>
            </div>
            `)



        finalArr.push(arr);
    })

    return finalArr;
}

function capitilizeFirstLetter(str) {
    const arr = str.split(" ");

    //loop through each element of the array and capitalize the first letter.


    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);

    }

    //Join all the elements of the array back into a string 
    //using a blankspace as a separator 
    return arr.join(" ");

}



function getManagerInfoFromArr(managerMat) {

    for (var i = 0; i < listManagers.length; i++) {
        let manager = listManagers[i];
        if (managerMat.toUpperCase() === manager.matricule.toUpperCase()) {
            return {
                "index": i,
                "manager": manager
            }
        }


    }
    return {
        "index": -1,
        "manager": null
    }
}

function displayFullBpr(tag) {
    let bpr = "";
    switch (tag) {
        case "bp_tanger_tetouan":
            bpr = "B.P de Tanger-Tétouan";
            break;
        case "bp_rabat_kenitra":
            bpr = "B.P de Rabat-Kénitra";
            break;
        case "bp_ouajda":
            bpr = "B.P d'Oujda";
            break;
        case "bp_nador_houceima":
            bpr = "B.P de Nador-Al Hoceima";
            break;
        case "bp_kech_mellal":
            bpr = "B.P de Marrakech-Béni Mellal";
            break;
        case "bp_laayoune":
            bpr = "B.P de Laayoune";
            break;
        case "bp_fes_meknes":
            bpr = "B.P de Fès-Meknès";
            break;
        case "bp_sud":
            bpr = "B.P du Centre-Sud";
            break;
        case "bp_casa":
            bpr = "B.de Casablanca";
            break;
        case null:
        case "":
        case "*** Non spécifié ***":
            bpr = "*** Non spécifié ***"
            break;
    }

    return bpr;
}

function attributeBprByAffectationCode(affectatioCode) {
    let codeBase2 = affectatioCode.slice(0, 2);
    let codeBase1 = affectatioCode.slice(0, 1);
    let tag = "";
    switch (codeBase2) {
        case "64":
        case "65":
            tag = "bp_tanger_tetouan";
            break;

        case "81":
        case "82":
        case "83":
            tag = "bp_rabat_kenitra";
            break;

        case "45":
        case "46":
            tag = "bp_kech_mellal";
            break;

        case "50":
        case "51":
            tag = "bp_nador_houceima";
            break;

        case "27":
        case "28":
            tag = "bp_fes_meknes";
            break;

        case "57":
        case "58":
        case "59":
            tag = "bp_ouajda";
            break;

        case "77":
        case "78":
        case "79":
        case "80":
            tag = "bp_casa";
            break;
    }

    switch (codeBase1) {
        case "1":
        case "2":
            tag = "bp_sud";
            break;
    }

    return tag;
}