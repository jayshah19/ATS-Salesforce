const form = document.querySelector("#applicationForm");
const statusMessage = document.querySelector("#formStatus");
const payloadOutput = document.querySelector("#payloadOutput");

form.addEventListener("submit", (event) => {
  
  if (!form.checkValidity()) {
    event.preventDefault();
    form.reportValidity();
    if (statusMessage) statusMessage.textContent = "Please complete all required fields.";
    return;
  }

  
  if (statusMessage) statusMessage.textContent = "Submitting your application...";


  if (payloadOutput) payloadOutput.textContent = "";
});
