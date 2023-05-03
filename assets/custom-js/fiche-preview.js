
// SCORE VARIABLES
let totalPoints = 0;
let elementsNumbers = 0;
let score = 0;
let sur_points = 0;
let sous_points = 0;

// SET HEADER INFORMATIONS
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;
$("#date-eva-text").text(today);

let lastClickedIndexYes = -1;
let lastClickedIndexNo = -1;

// GET PARAMS FROM URL
const params = new URLSearchParams(window.location.search);
let urlParams = "?";
for (const param of params) {
    urlParams = urlParams + param[0] + "=" + param[1] + "&";
    console.log(param);
}
console.log(urlParams);



getFicheEmploiPreview(urlParams);


// CHECK FOR AVAILABLE SECTIONS
let radioBtnCompteur = 0;
let compBtnCompteur = 0;
let compSfBtnCompteur = 0;
let compSeBtnCompteur = 0;

function populateResTable(json) {
    console.log(json);
    // GET TABLE BODY 
    for (var key of Object.keys(json)) {
        console.log(key);
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
                        $("#res-table-body").append("<tr></tr>");
                        if (j === 0) {
                            $("#res-table-body").find("tr").last().append(`<td rowspan=` + categorie.valeur.length + `>` + categorie["categorie"] + `</td>`);
                            $("#res-table-body").find("tr").last().append(`<td>` + categorie["valeur"][j] + `</td>`);
                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input no-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);

                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input yes-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);

                        } else {


                            $("#res-table-body").find("tr").last().append(`<td>` + categorie["valeur"][j] + `</td>`);
                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input no-radio-btn">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description"></span>
                            </label>
                        </div>
                        </td>
                    `);

                            $("#res-table-body").find("tr").last().append(`<td>
                        <div class="">
                            <label class="custom-switch form-switch  ">
                                <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input yes-radio-btn">
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
                    $("#exi-table-body").append("<tr></tr>");


                    $("#exi-table-body").find("tr").last().append(`<td>${exiValues[j]}</td>`);

                    $("#exi-table-body").find("tr").last().append(`
                            <td>
                                <div class="">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input no-radio-btn">
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
                                        <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input yes-radio-btn">
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
                    $("#marq-table-body").append("<tr></tr>");


                    $("#marq-table-body").find("tr").last().append(`<td>${marqValues[j]}</td>`);

                    $("#marq-table-body").find("tr").last().append(`
                            <td>
                                <div class="">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioNo-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input no-radio-btn">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description"></span>
                                    </label>
                                </div>
                            </td>
                        `);
                    $("#marq-table-body").find("tr").last().append(`
                            <td>
                                <div class="">
                                    <label class="custom-switch form-switch  ">
                                        <input type="radio" id="radioYes-${radioBtnCompteur}" name="custom-switch-radio-${radioBtnCompteur}" class="custom-switch-input yes-radio-btn">
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
                    $("#comp-table-body").append("<tr></tr>");

                    if (index === 0) {
                        $("#comp-table-body").find("tr").last().append(`<td rowspan="${competences.length}"> Domaines de connaissances </td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td class="niveau-requis"> ${competence.requiredNiveau}</td>`);

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

                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td class="niveau-requis"> ${competence.requiredNiveau}</td>`);

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
                    $("#comp-table-body").append("<tr></tr>");

                    if (index === 0) {
                        $("#comp-table-body").find("tr").last().append(`<td rowspan="${competences_sf.length}"> Savoir-faire </td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.requiredNiveau}</td>`);

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

                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.requiredNiveau}</td>`);

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
                    $("#comp-table-body").append("<tr></tr>");

                    if (index === 0) {
                        $("#comp-table-body").find("tr").last().append(`<td rowspan="${competences_se.length}"> Savoir-être </td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.requiredNiveau}</td>`);

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

                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.name}</td>`);
                        $("#comp-table-body").find("tr").last().append(`<td> ${competence.requiredNiveau}</td>`);

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
    score = (((totalPoints / elementsNumbers)) * 100).toFixed(2);

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

    fetch(url, {
        method: 'GET'
    }).then((response) => {
        return response.json();
    }).then((success) => {
        //console.log(success);

        //GET NUMBER OF INPUTS TO CALCULATE SCORE
        elementsNumbers = countsInputs(success);
        return success;
    }).then((json) => {
        console.log(json)
        populateResTable(json);
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