const form = document.querySelector("#applicationForm");
const payloadOutput = document.querySelector("#payloadOutput");
const statusMessage = document.querySelector("#formStatus");
const positionSelect = document.querySelector("#positionSelect");
const desiredPositionTitle = document.querySelector("#desiredPositionTitle");

positionSelect.addEventListener("change", (e) => {
  const selectedOption = e.target.selectedOptions[0];
  desiredPositionTitle.value = selectedOption?.dataset.positionName || "";
});

function buildLeadPayload(formElement) {
  const formData = new FormData(formElement);
  const resume = formData.get("resume");

  const firstName = (formData.get("first_name") || "").trim();
  const lastName = (formData.get("last_name") || "").trim();

  return {
    first_name: firstName,
    last_name: lastName,
    email: (formData.get("email") || "").trim(),
    phone: (formData.get("phone") || "").trim(),
    company: (formData.get("company") || "").trim() || "Individual Applicant",

    Experience_Years__c: (formData.get("Experience_Years__c") || "").trim(),
    Primary_Skills__c: (formData.get("Primary_Skills__c") || "").trim(),
    Skills_Applied__c: (formData.get("Skills_Applied__c") || "").trim(),

    Position_Key__c: formData.get("Position_Key__c") || "",
    Position_Title__c: (formData.get("Position_Title__c") || "").trim(),
    Location_Preference__c: formData.get("Location_Preference__c") || "",

    Application_Source__c: formData.get("Application_Source__c") || "Career Web Page",
    Initial_Application_Stage__c: formData.get("Initial_Application_Stage__c") || "Applied",

    Resume_File_Name__c: resume?.name || "",
    Resume_Content_Type__c: resume?.type || "",
    Resume_File_Size__c: resume?.size || 0
  };
}

form.addEventListener("submit", () => {
  statusMessage.textContent = "";
  const payload = buildLeadPayload(form);
  payloadOutput.textContent = JSON.stringify(payload, null, 2);
});
