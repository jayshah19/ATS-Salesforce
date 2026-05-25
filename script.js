// Where your middleware / Web-to-Lead endpoint lives.
// Leave blank while you’re just previewing the payload.
const SALESFORCE_ENDPOINT = "";

// DOM references
const form = document.querySelector("#applicationForm");
const statusMessage = document.querySelector("#formStatus");
const payloadOutput = document.querySelector("#payloadOutput");

/**
 * Build a payload that clearly separates Candidate, Position, and Application
 * while still being a flat object Salesforce can accept as a Lead.
 *
 * You will create matching custom fields on Lead and map them in Flow:
 *   Lead.Candidate_Experience_Years__c      → Candidate__c.Experience_Years__c
 *   Lead.Candidate_Primary_Skills__c       → Candidate__c.Primary_Skills__c
 *   Lead.Position_Key__c                   → Position__c.Position_Key__c (or Id)
 *   Lead.Desired_Position_Title__c         → Position__c.Title__c
 *   Lead.Application_Source__c             → Application__c.Source__c
 *   Lead.Skills_Applied__c                 → Application__c.Candidate_Skills_Free_Text__c
 */
function buildLeadPayload(formElement) {
  const formData = new FormData(formElement);
  const resume = formData.get("resume");

  // Basic candidate identity (standard Lead-style fields)
  const firstName = (formData.get("first_name") || "").trim();
  const lastName = (formData.get("last_name") || "").trim();

  return {
    // ---------- Standard Lead-ish fields ----------
    FirstName: firstName,
    LastName: lastName,
    Email: (formData.get("email") || "").trim(),
    Phone: (formData.get("phone") || "").trim(),
    Company: (formData.get("company") || "").trim() || "Individual Applicant",

    // ---------- Candidate-related custom fields on Lead ----------
    Candidate_Experience_Years__c: Number(
      formData.get("Candidate_Experience_Years__c") || 0
    ),
    Candidate_Primary_Skills__c:
      (formData.get("Candidate_Primary_Skills__c") || "").trim(),

    // You can still keep a free-text “skills applied” field if you like
    Skills_Applied__c: (formData.get("Skills_Applied__c") || "").trim(),

    // ---------- Position-related custom fields on Lead ----------
    // External key that Flow uses to find the Position__c record
    Position_Key__c: formData.get("Position_Key__c") || "",
    Desired_Position_Title__c:
      (formData.get("Desired_Position_Title__c") || "").trim(),
    Location_Preference__c: formData.get("Location_Preference__c") || "",

    // ---------- Application-related custom fields on Lead ----------
    // This will become Application__c.Source__c in your Flow
    Application_Source__c:
      formData.get("Application_Source__c") || "Career Web Page",

    // Optional: you can pass a desired initial stage for the application
    Initial_Application_Stage__c:
      formData.get("Initial_Application_Stage__c") || "Applied",

    // ---------- Resume metadata (for logging / attachments later) ----------
    Resume_File_Name__c: resume?.name || "",
    Resume_Content_Type__c: resume?.type || "",
    Resume_File_Size__c: resume?.size || 0
  };
}

/**
 * Convert the payload into multipart/form-data for your endpoint.
 * The endpoint can either call Web-to-Lead or Salesforce REST API.
 */
function buildApiFormData(formElement, payload) {
  const apiFormData = new FormData();
  const resume = new FormData(formElement).get("resume");

  Object.entries(payload).forEach(([key, value]) => {
    apiFormData.append(key, value);
  });

  if (resume instanceof File && resume.size > 0) {
    apiFormData.append("resume", resume, resume.name);
  }

  return apiFormData;
}

async function submitToSalesforce(formElement, payload) {
  if (!SALESFORCE_ENDPOINT) {
    // Dev mode: just preview the payload, don’t actually send anywhere
    return {
      skipped: true,
      message: "No Salesforce endpoint configured. Payload preview only."
    };
  }

  const response = await fetch(SALESFORCE_ENDPOINT, {
    method: "POST",
    body: buildApiFormData(formElement, payload)
  });

  if (!response.ok) {
    throw new Error(
      `Salesforce submission failed with status ${response.status}.`
    );
  }

  return {
    skipped: false,
    message: "Application sent to Salesforce."
  };
}

// Submit handler: validate, build payload, preview, then (optionally) send
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    statusMessage.textContent = "Please complete all required fields.";
    return;
  }

  const payload = buildLeadPayload(form);
  // Show nicely formatted JSON preview so you can see Candidate/Position/Application pieces
  payloadOutput.textContent = JSON.stringify(payload, null, 2);

  try {
    const result = await submitToSalesforce(form, payload);
    statusMessage.textContent = result.message;
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});
