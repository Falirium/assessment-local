// CHECK IF THERE IS A MATRICE COMPETENCE IN LOCALSTORAGE
if ( localStorage.getItem("matriceCompetence") != null) {

    //STEP 1 : GET THE OBJECT OF THE MATRICE COMPETENCE
    matriceCompetenceJson = JSON.parse(localStorage.getItem("matriceCompetence"));

    // STEP 2 : POPULATE VARIABLES
    competenceArray =  matriceCompetenceJson.competences;
    fileHasBeenProcessed = true;

    // STEP 3 : PARSE RESULTS ON INPUTS + TABLE
    $("#input-name-matrice").val(matriceCompetenceJson.name);
    $("#input-create-date").val(matriceCompetenceJson.createdAt.split("T")[0]);
    
    parseCompetencesToTable(competenceArray);

    // STEP 4 : 

    


} else {

    // REDIRECT TO THE LIST OF MATRICE OF COMPETENCE
    setTimeout(function () {
        let currentUrl = window.location.href;

        window.location.href = extractDomain(currentUrl) + "emploi/competence/list";
    }, 1000);
}


async function updateMatriceCompetence(json) {

    let url = "http://localhost:8080/preassessment/api/v1/competence/matrice"


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

            return success;



        } // Handle the success response object
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

