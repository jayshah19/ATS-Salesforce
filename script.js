// Web-to-Lead servlet endpoint – this must be EXACTLY this path.
const SALESFORCE_ENDPOINT =
  "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8";

// TODO: replace with your real 15- or 18-char Salesforce Org Id
const SALESFORCE_ORG_ID = "00Dd200000hogL3";

// TODO: replace with your actual thank-you URL (or keep same page)
const WEB_TO_LEAD_RET_URL = "https://stablewp.com/wp-content/uploads/2019/12/thankyou1.png";

// DOM references
const form = document.querySelector("#applicationForm");
const statusMessage = document.querySelector("#formStatus");
const payloadOutput = document.querySelector("#payloadOutput");

/**
 * Build a payload that separates Candidate, Position, and Application
 * while still being a flat object compatible with Web-to-Lead / Flow.
 *
 * You will create matching custom fields on Lead and map them in Flow.
 */
function buildLeadPayload(formElement) {
  const formData = new FormData(formElement);
  const resume = formData.get("resume");

  const firstName = (formData.get("first_name") || "").trim();
  const lastName = (formData.get("last_name") || "").trim();

  return {
    // ---------- Standard Lead-style fields ----------
    first_name: firstName,
    last_name: lastName,
    email: (formData.get("email") || "").trim(),
    phone: (formData.get("phone") || "").trim(),
    company: (formData.get("company") || "").trim() || "Individual Applicant",

    // ---------- Candidate-related custom fields ----------
    Candidate_Experience_Years__c:
      (formData.get("Candidate_Experience_Years__c") || "").trim(),
    Candidate_Primary_Skills__c:
      (formData.get("Candidate_Primary_Skills__c") || "").trim(),
    Skills_Applied__c: (formData.get("Skills_Applied__c") || "").trim(),

    // ---------- Position-related custom fields ----------
    Position_Key__c: formData.get("Position_Key__c") || "",
    Desired_Position_Title__c:
      (formData.get("Desired_Position_Title__c") || "").trim(),
    Location_Preference__c: formData.get("Location_Preference__c") || "",

    // ---------- Application-related custom fields ----------
    Application_Source__c:
      formData.get("Application_Source__c") || "Career Web Page",
    Initial_Application_Stage__c:
      formData.get("Initial_Application_Stage__c") || "Applied",

    // ---------- Resume metadata ----------
    Resume_File_Name__c: resume?.name || "",
    Resume_Content_Type__c: resume?.type || "",
    Resume_File_Size__c: resume?.size || 0
  };
}

/**
 * Convert the payload to multipart/form-data for the Web-to-Lead servlet.
 * Adds the required oid and optional retURL parameters.
 */
function buildApiFormData(formElement, payload) {
  const apiFormData = new FormData();
  const resume = new FormData(formElement).get("resume");

  // REQUIRED: your Salesforce org id
  apiFormData.append("oid", SALESFORCE_ORG_ID);

  // Recommended: where Salesforce should redirect after a successful submit
  apiFormData.append("retURL", WEB_TO_LEAD_RET_URL);

  // Add all payload fields
  Object.entries(payload).forEach(([key, value]) => {
    apiFormData.append(key, value);
  });

  // Optional file upload metadata (your middleware / Flow can handle it)
  if (resume instanceof File && resume.size > 0) {
    apiFormData.append("resume", resume, resume.name);
  }

  return apiFormData;
}

async function submitToSalesforce(formElement, payload) {
  if (!SALESFORCE_ORG_ID || SALESFORCE_ORG_ID === "YOUR_ORG_ID_HERE") {
    // Safety: don't accidentally send without configuring org id
    return {
      skipped: true,
      message:
        "Org Id not configured. Update SALESFORCE_ORG_ID in script.js to send to Salesforce."
    };
  }

  const response = await fetch(SALESFORCE_ENDPOINT, {
    method: "POST",
    body: buildApiFormData(formElement, payload)
  });

  if (!response.ok) {
    // 405 and other errors will surface here
    throw new Error(
      `Salesforce submission failed with status ${response.status}.`
    );
  }

  return {
    skipped: false,
    message: "Application sent to Salesforce via Web-to-Lead."
  };
}

// Submit handler: validate → build payload → preview → send
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    statusMessage.textContent = "Please complete all required fields.";
    return;
  }

  const payload = buildLeadPayload(form);
  // Show JSON preview so you can confirm Candidate/Position/Application mapping
  payloadOutput.textContent = JSON.stringify(payload, null, 2);

  try {
    const result = await submitToSalesforce(form, payload);
    statusMessage.textContent = result.message;
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});
