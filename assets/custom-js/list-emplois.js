
console.log("list-emplois.js")



// let authorizedCol = ["id", "intitule", "level", "filiere", "sousFiliere", "dateMaj"];
let authorizedCol = ["id", "intitule", "niveaux", "filiere", "sousFiliere", "dateMaj"];


let emploiDatatable;


let listEmplois;

// GET LIST OF EMPLOIS
getListOfEmplois().then((data) => {


    listEmplois = data;
    // INITIALIZE DATATABLE

    let dataSet = getEmploisDataFromJson(data);
    let col = getEmploiColumnFromJson(data[0], authorizedCol);

    emploiDatatable = $("#tbs2").DataTable({
        data: dataSet
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

        // let btns = $(".view-btn").get();
        // let indexOfAssessment = btns.indexOf(aElement);
        // console.log(indexOfAssessment);

        // // GET THE ASSOCIATED ASSESSMENT
        // let assessment = listEmplois[indexOfAssessment];
        // console.log(assessment);

        // //SAVE ASSESSMENT ON LOCAL SESSION
        // localStorage.setItem("assessment", JSON.stringify(assessment));

        // // REDIRECT TO THE ASSESSMENT PAGE 
        // // let url = buildURL("evaluation/evaluate", urlParams);

        // // window.open(extractDomain(currentUrl) + url)
        // // console.log(localStorage.getItem("assessment"));

        let emploiName = $(aElement).parents("td").siblings().slice(1, 2).text();
        console.log(emploiName);

        let emploi = getEmploiInfoFromArr(emploiName).emploi;
        console.log(emploi);

        //SAVE EMPLOI ON LOCAL SESSION
        localStorage.setItem("emploi", JSON.stringify(emploi));

        // REDIRECT TO THE EMPLOI EDIT PAGE 

        let currentUrl = window.location.href;
        window.location.href = extractDomain(currentUrl) + "emploi/edit";


    })

})

function buildURL(prefix, params) {

    let url = prefix + "?";
    for (var key of Object.keys(params)) {
        url = url + key + "=" + params[key] + "&";
    }

    return url;
}

async function getListOfEmplois() {
    let url = "http://localhost:8080/preassessment/api/v1/emploi/";
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

function getEmploiColumnFromJson(json, authorizedCol) {
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
                case "id":
                    value = "id";
                    break;
                case "intitule":
                    value = "intitulé ";
                    break;
                case "level":
                    value = "niveau"
                    break;
                case "filiere":
                    value = "filière"
                    break;
                case "sousFiliere":
                    value = "sous filière"
                    break;
                case "dateMaj":
                    value = "dernière Maj";
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

function getEmploisDataFromJson(arrJson) {
    let finalArr = [];
    arrJson.map((e, i) => {
        console.log(i);
        let arr = [];

        arr.push(e.id);
        arr.push(capitilizeFirstLetter(e.intitule));
        arr.push(e.niveaux.length);
        arr.push(e.niveaux[0]["filiere"]);
        arr.push(e.niveaux[0]["sousFiliere"]);
        if (e.niveaux[0]["dateMaj"] != null) {
            arr.push(e.niveaux[0]["dateMaj"].split("T")[0]);
        } else {
            arr.push("No date");
        }


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



function getEmploiInfoFromArr(emploiName) {

    for (var i = 0; i < listEmplois.length; i++) {
        let emploi = listEmplois[i];
        if (emploiName.toUpperCase() === emploi.intitule.toUpperCase()) {
            return {
                "index": i,
                "emploi": emploi
            }
        }


    }
    return {
        "index": -1,
        "emploi": null
    }
}