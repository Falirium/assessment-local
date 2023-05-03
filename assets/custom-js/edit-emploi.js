function lanchEditScript() {
    // STEP 1 : CHECK OF EMPLOI-ID IN LOCAL STORAGE
    if (localStorage.getItem("emploi") != null) {

        // STEP 2 : GET THE OBJECT OF EMPLOI
        let emploi = JSON.parse(localStorage.getItem("emploi"));


        // STEP 3 : POPULATE THE VARIABLES + POPULATE MIDDLE VARIABLES WITH NIVEAU 1 DATA
        populateMainVariabes(emploi);
        populateMiddleVariabes(emploi);

        // STEP 4 : START PARSING DATA INTO TABLES
        // 1 - PARSE BASE INFO OF EMPLOI
        $("#input-name-emploi").val(emploiJSON["intitulé"]);
        // DISABLE THIS INPUT
        $("#input-name-emploi").attr('disabled', "");

        $("#input-filiere-emploi").val(emploiJSON["filière"]);
        $("#input-sousFiliere-emploi").val(emploiJSON["sous-filière"]);
        $("#input-date-emploi").val(emploiJSON["date Maj"].split("T")[0]);
        $("#input-vocation-emploi").val(emploiJSON["vocation"]);
        parseResToTable(responsabilitesArray);


        // 2 - PARSE NIVEAUX OF EMPLOI
        let sortedEmploiNiveaux = sortingAsc(emploi.niveaux);
        console.log(sortedEmploiNiveaux);
        sortedEmploiNiveaux.map((niveau, index) => {

            // GET THE CONTAINER
            let container = lastNiveauContainer();
            console.log( "ORDER OF LEVELS : " + niveau.level);



            // INITIALIZE ARRAYS FOR NEW NIVEAU VALUES
            exigencesArray = adapteToOldFormat(niveau.exigences);
            marqueursArray = adapteToOldFormat(niveau.marqueurs);
            competencesArray = niveau.competencesRequis;

            // console.log(exigencesArray, marqueursArray);

            parseExigenceToTable(exigencesArray, container);
            parseMarqueurToTable(marqueursArray, container);
            parseCompetenceToTable(competencesArray, container);

            if (index != niveauxArray.length - 1) {

                // let niveauJson = {
                //     "level": niveauCounter,
                //     "exigences": exigencesArray,
                //     "marqueurs": marqueursArray,
                //     "competences": competencesArray
                // };

                // niveauxArray.push(niveauJson);

                // console.log(niveauxArray);

                // // INITIALIZE ARRAYS FOR NEW NIVEAU
                // exigencesArray = [];
                // marqueursArray = [];
                // competencesArray = [];

                // DISABLE INPUTS-BUTTONS FOR THE PREVIOUS NIVEAU
                disableInputsFor(container);
                disableButtonsFor(container);


                // CREATE A  NEW CONTAINER 
                let niveauContainer = document.querySelector(".niveau-container");
                let parent = niveauContainer.parentElement;

                let newNiveau = document.createElement("div");
                parent.appendChild(newNiveau);
                niveauCounter++;
                newNiveau.outerHTML = addNewNiveauHTML(niveauCounter);


                let lastNiveau = lastNiveauContainer();
                focusedNiveauContainer = lastNiveauContainer();


                currentNiveauIndex = niveauCounter - 1;
                addListenersToNewNiveau(lastNiveau);

            }
        })


    } else {

        // SHOW A ERROR MODAL
        showModal("error", "Erreur dans le processus", "Nous ne pouvons pas trouver le travail cible pour l'édition. Veuillez retourner à la page précédente et cliquer à nouveau sur le bouton << Éditer >>", "",
            {
                "text": "Revenir à l'acceuil",
                "color": "danger",
                "id": "dfe1"
            }, function () {

                // REDIRECT TO THE LIST OF MATRICE OF COMPETENCE
                setTimeout(function () {
                    let currentUrl = window.location.href;

                    window.location.href = extractDomain(currentUrl) + "emploi/list";
                }, 1000);
            });

    }


}

function populateMainVariabes(emploi) {

    emploiJSON.id = emploi.id;
    emploiJSON["intitulé"] = capitilizeFirstLetter(emploi.intitule);
    emploiJSON["filière"] = emploi.niveaux[0]["filiere"];
    emploiJSON["sous-filière"] = emploi.niveaux[0]["sousFiliere"];
    emploiJSON["date Maj"] = emploi.niveaux[0]["dateMaj"];
    emploiJSON["vocation"] = emploi.niveaux[0]["vocation"];

    niveauxArray = emploi.niveaux.map((niveau, index) => {
        return {
            "level": niveau.level,
            "exigences": adapteToOldFormat(niveau.exigences),
            "marqueurs": adapteToOldFormat(niveau.marqueurs),
            "competences": niveau.competencesRequis
        };
    });


}


function populateMiddleVariabes(emploi) {

    // FILL WITH FIRST NIVEAU DATA
    
    let sortedNiveaux = sortingAsc(emploi.niveaux);
    console.log(sortedNiveaux);
    responsabilitesArray = sortedNiveaux[0].responsabilites;
    exigencesArray = sortedNiveaux[0].exigences;
    marqueursArray = sortedNiveaux[0].marqueurs;
    competencesArray = sortedNiveaux[0].competencesRequis;

}


async function updateEmploi(json) {

    let url = "http://localhost:8080/preassessment/api/v1/emploi/edit"


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

            // console.log(success);
            return success;



        } // Handle the success response object
    ).catch(
        error => console.log(error) // Handle the error response object
    );
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

function adapteToOldFormat(arr) {


    let finalArr = arr.map((e, i) => {
        return {
            "valeur": e
        }
    });

    return finalArr;

}

function sortingAsc(arr) {
   return arr.sort((a,b) => {
    const levelA = a.level;
    const levelB = b.level;

    if (levelA > levelB) {
        return 1;
    } else if (levelA < levelB) {
        return -1;
    } else {
        return 0;
    }
    
   })
}