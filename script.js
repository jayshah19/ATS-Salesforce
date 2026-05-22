const SALESFORCE_ENDPOINT = "";

const form = document.querySelector("#applicationForm");
const statusMessage = document.querySelector("#formStatus");
const payloadOutput = document.querySelector("#payloadOutput");

function buildLeadPayload(formElement) {
  const formData = new FormData(formElement);
  const resume = formData.get("resume");

  return {
    first_name: formData.get("first_name")?.trim() || "",
    last_name: formData.get("last_name")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    phone: formData.get("phone")?.trim() || "",
    company: formData.get("company")?.trim() || "Individual Applicant",
    Desired_Position_Title__c: formData.get("Desired_Position_Title__c")?.trim() || "",
    Location_Preference__c: formData.get("Location_Preference__c") || "",
    Skills_Applied__c: formData.get("Skills_Applied__c")?.trim() || "",
    Position_Key__c: formData.get("Position_Key__c") || "",
    lead_source: formData.get("lead_source") || "Career Web Page",
    Resume_File_Name__c: resume?.name || "",
    Resume_Content_Type__c: resume?.type || "",
    Resume_File_Size__c: resume?.size || 0
  };
}

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
    return {
      skipped: true,
      message: "No Salesforce endpoint configured. Payload preview generated only."
    };
  }

  const response = await fetch(SALESFORCE_ENDPOINT, {
    method: "POST",
    body: buildApiFormData(formElement, payload)
  });

  if (!response.ok) {
    throw new Error(`Salesforce submission failed with status ${response.status}.`);
  }

  return {
    skipped: false,
    message: "Application sent to Salesforce."
  };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    statusMessage.textContent = "Please complete all required fields.";
    return;
  }

  const payload = buildLeadPayload(form);
  payloadOutput.textContent = JSON.stringify(payload, null, 2);

  try {
    const result = await submitToSalesforce(form, payload);
    statusMessage.textContent = result.message;
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});
