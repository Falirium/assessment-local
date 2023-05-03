const prevBtns = document.querySelectorAll(".btn-prev");
const nextBtns = document.querySelectorAll(".btn-next");
const progress = document.getElementById("progress");
const formSteps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".progress-step");

let formStepsNum = 0;

console.log("PROGRESS STEPS");


function comparingDates(d1, d2) {
  let date1 = new Date(d1).getTime();
  let date2 = new Date(d2).getTime();

  if (date1 < date2) {
    return `${d1} is less than ${d2}`;
  } else if (date1 > date2) {
    return `${d1} is greater than ${d2}`;
  } else {
    return `Both dates are equal`;
  }
};

nextBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {

    let toContinue = true;

    if (e.target.id === "btn-next-info-assessment") {
      let startedAt = $("#input-started-date").val();
      let finishesAt = $("#input-finishes-date").val();

      let dateNow = new Date();
      let startedDate = new Date(startedAt);

      comparingDates(dateNow.toISOString().split("T")[0], startedAt).includes("greater");

      if (comparingDates(dateNow.toISOString().split("T")[0], startedAt).includes("greater")) {


        $("#input-started-date").addClass("is-invalid");
        $("#input-finishes-date").addClass("is-invalid");

        $("#started-date-error").text("La date de début ne doit pas être inférieure à la date du jour.");
      } else if (startedAt >= finishesAt) {
        $("#input-started-date").addClass("is-invalid");
        $("#input-finishes-date").addClass("is-invalid");

        $("#started-date-error").text("Ce jour doit être inférieur à la date de fin !");

      } else {
        formStepsNum++;
        updateFormSteps();
        updateProgressbar();
      }
    } else {

      formStepsNum++;
      updateFormSteps();
      updateProgressbar();

    }

  });
});

prevBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    formStepsNum--;
    updateFormSteps();
    updateProgressbar();
  });
});

function updateFormSteps() {
  formSteps.forEach((formStep) => {
    formStep.classList.contains("form-step-active") &&
      formStep.classList.remove("form-step-active");
  });

  formSteps[formStepsNum].classList.add("form-step-active");
}

function updateProgressbar() {
  progressSteps.forEach((progressStep, idx) => {
    if (idx < formStepsNum + 1) {
      progressStep.classList.add("progress-step-active");
    } else {
      progressStep.classList.remove("progress-step-active");
    }
  });

  const progressActive = document.querySelectorAll(".progress-step-active");

  progress.style.width =
    ((progressActive.length - 1) / (progressSteps.length - 1)) * 100 + "%";
}

