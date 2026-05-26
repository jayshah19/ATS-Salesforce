const form = document.querySelector("#applicationForm");
const payloadOutput = document.querySelector("#payloadOutput");
const statusMessage = document.querySelector("#formStatus");

/**
 * Build a debug payload for preview only.
 * This does NOT affect what Web-to-Lead sends; the real POST comes from the form.
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

// On submit: just build preview, DO NOT prevent default.
// The native form post will still go to Web-to-Lead.
form.addEventListener("submit", () => {
  statusMessage.textContent = "";
  const payload = buildLeadPayload(form);
  payloadOutput.textContent = JSON.stringify(payload, null, 2);
});
