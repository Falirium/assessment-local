console.log("404 page");


let user = (localStorage.getItem("user") === "admin") ? ("admin") : (JSON.parse(localStorage.getItem("user")));

if (user === "admin" || user.type === "drh") {

    $("#homepage-link").attr("href", "/assessment/list");
    
} else {
    $("#homepage-link").attr("href", "/evaluation/list");
}