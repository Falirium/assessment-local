console.log("list drh");




// let authorizedCol = ["id", "intitule", "level", "filiere", "sousFiliere", "dateMaj"];
let authorizedCol = ["idDrh", "matricule", "firstName", "lastName", "topDirection"];


let drhDataTable;


let listDrhs;

// GET LIST OF EMPLOIS
getListOfDrhs().then((data) => {


    listDrhs = data;
    // INITIALIZE DATATABLE

    let dataSet = getDrhsDataFromJson(data);
    let col = getDrhColumnFromJson(data[0], authorizedCol);

    drhDataTable = $("#tbs2").DataTable({
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


        let drhMatricule = $(aElement).parents("td").siblings().slice(1, 2).text();
        console.log(drhMatricule);

        let drh = getDrhInfoFromArr(drhMatricule).drh;
        console.log(drh);

        //SAVE EMPLOI ON LOCAL SESSION
        localStorage.setItem("drh", JSON.stringify(drh));

        // REDIRECT TO THE EMPLOI EDIT PAGE 

        let currentUrl = window.location.href;
        window.location.href = extractDomain(currentUrl) + "employee/drh/edit";


    })

})

function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
}

async function getListOfDrhs() {
    let url = "http://localhost:8080/preassessment/api/v1/employee/drh";
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

function getDrhColumnFromJson(json, authorizedCol) {
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
                case "idDrh":
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
    arrJson.map((e, i) => {
        console.log(i);
        let arr = [];

        arr.push(e.idDrh);
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



function getDrhInfoFromArr(drhMat) {

    for (var i = 0; i < listDrhs.length; i++) {
        let drh = listDrhs[i];
        if (drhMat.toUpperCase() === drh.matricule.toUpperCase()) {
            return {
                "index": i,
                "drh": drh
            }
        }


    }
    return {
        "index": -1,
        "drh": null
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
    }

    return bpr;
}