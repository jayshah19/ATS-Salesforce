// DOM references
const form = document.querySelector("#applicationForm");
const statusMessage = document.querySelector("#formStatus");
const payloadOutput = document.querySelector("#payloadOutput");

/**
 * Build a payload that separates Candidate, Position, and Application
 * while still being a flat object Web-to-Lead & Flow can consume.
 *
 * You will create matching custom fields on Lead and map them in Flow.
 */
function buildLeadPayload(formElement) {
  const formData = new FormData(formElement);
  const resume = formData.get("resume");

  const firstName = (formData.get("first_name") || "").trim();
  const lastName = (formData.get("last_name") || "").trim();

  return {
    // ----- Standard Lead-style fields -----
    first_name: firstName,
    last_name: lastName,
    email: (formData.get("email") || "").trim(),
    phone: (formData.get("phone") || "").trim(),
    company: (formData.get("company") || "").trim() || "Individual Applicant",

    // ----- Candidate fields -----
    Candidate_Experience_Years__c:
      (formData.get("Candidate_Experience_Years__c") || "").trim(),
    Candidate_Primary_Skills__c:
      (formData.get("Candidate_Primary_Skills__c") || "").trim(),
    Skills_Applied__c: (formData.get("Skills_Applied__c") || "").trim(),

    // ----- Position fields -----
    Position_Key__c: formData.get("Position_Key__c") || "",
    Desired_Position_Title__c:
      (formData.get("Desired_Position_Title__c") || "").trim(),
    Location_Preference__c: formData.get("Location_Preference__c") || "",

    // ----- Application fields -----
    Application_Source__c:
      formData.get("Application_Source__c") || "Career Web Page",
    Initial_Application_Stage__c:
      formData.get("Initial_Application_Stage__c") || "Applied",

    // ----- Resume metadata -----
    Resume_File_Name__c: resume?.name || "",
    Resume_Content_Type__c: resume?.type || "",
    Resume_File_Size__c: resume?.size || 0
  };
}

// On submit: validate + preview JSON, then let the browser post the form.
form.addEventListener("submit", (event) => {
  statusMessage.textContent = "";

  if (!form.checkValidity()) {
    // Ask browser to show native validation UI, then block submit
    event.preventDefault();
    form.reportValidity();
    statusMessage.textContent = "Please complete all required fields.";
    return;
  }

  // Build and show payload for debugging / documentation
  const payload = buildLeadPayload(form);
  payloadOutput.textContent = JSON.stringify(payload, null, 2);

  // IMPORTANT: do NOT call preventDefault here.
  // The browser will now submit the form directly to Web-to-Lead
  // using the action / method / hidden oid + retURL.
});
