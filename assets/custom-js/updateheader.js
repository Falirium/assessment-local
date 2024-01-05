// GET MANAGER OR CONSULTANT INFO
// let user = localStorage.getItem("user");
let user = (localStorage.getItem("user") === "admin") ? ("admin") : (JSON.parse(localStorage.getItem("user")));

console.log(user);

if (user === "admin") {
    // IS ADMIN
    $("#profile-name").text("ADMIN");
    $("#profile-role").text("Consultant BCP");

} else if (user.type === "1" || user.type === "2") {
    // IS MANAGER
    // let manager = JSON.parse(user);
    let managerFullName = user.data.firstName + " " + user.data.lastName;

    $("#profile-name").text(managerFullName);
    $("#profile-role").text("Manager");

} else {

    // IS DRH
    // let manager = JSON.parse(user);
    let managerFullName = user.data.firstName + " " + user.data.lastName;

    $("#profile-name").text(managerFullName);
    $("#profile-role").text("Consultant DRH");

}
/// EXTRA STEP : CHANGE THE HREF VALUE OF DASHBOARD ANCHOR ELEMENT
updateUserDashboardLink(user);

function updateUserDashboardLink(userObject) {
    var type = userObject.type;

    // Determine the correct href based on the user type
    var newHref;
    console.log(type);
    if (type === "1" || type === "2") {
        newHref = "list-fiches.html";
    } else if (type === "drh") {
        newHref = "list-assessments.html";
    } 
    // else {
    //     // Optional: Default href if type doesn't match expected values
    //     newHref = "default-file.html";
    // }

    // Update the href attribute of the element with id 'to_dashboard'
    $('#to_dashboard').attr('href', newHref);
    console.log("WORK DONE")
}

//ADD EVENT LISTENER ON SIGNOUT
$("#signout").click(function () {

    // CLEAR EVERY DATA STORED IN LOCAL_STORAGE
    localStorage.clear();

    // REDIRECT TO LOGINPAGE
    window.location.replace(extractDomain(window.location.href));

    window.location.replace("login.html");

})

