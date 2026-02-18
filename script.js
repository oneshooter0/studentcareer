/***********************
 * CareerLaunch Frontend
 * Submits to Apps Script Web App -> Google Sheet
 ***********************/

// 1) Paste your deployed Apps Script Web App URL here:
const WEB_APP_URL = "PASTE_YOUR_WEB_APP_URL_HERE";

const form = document.getElementById("signupForm");
const successMessage = document.getElementById("successMessage");
const submitBtn = document.getElementById("submitBtn");

// Copy mobile to WhatsApp
const copyToggle = document.getElementById("copyMobileToWhatsApp");
const mobileInput = document.getElementById("mobile");
const whatsappInput = document.getElementById("whatsapp");

copyToggle.addEventListener("change", () => {
  if (copyToggle.checked) whatsappInput.value = mobileInput.value.trim();
});

mobileInput.addEventListener("input", () => {
  if (copyToggle.checked) whatsappInput.value = mobileInput.value.trim();
});

// Simple Tilt effect (mouse move)
const tiltEl = document.getElementById("heroTilt");
if (tiltEl) {
  tiltEl.addEventListener("mousemove", (e) => {
    const r = tiltEl.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tiltEl.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  tiltEl.addEventListener("mouseleave", () => {
    tiltEl.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || "";
}

function validateForm() {
  let ok = true;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = mobileInput.value.trim();
  const whatsapp = whatsappInput.value.trim();
  const college = document.getElementById("college").value.trim();
  const department = document.getElementById("department").value.trim();

  const domain = document.getElementById("domain").value;
  const batch = document.getElementById("batch").value;
  const language = document.getElementById("language").value;
  const terms = document.getElementById("terms").checked;

  const yearRadio = document.querySelector('input[name="yearOfStudy"]:checked');
  const yearOfStudy = yearRadio ? yearRadio.value : "";

  // Clear old errors
  [
    "nameError","emailError","mobileError","whatsappError","collegeError",
    "departmentError","yearError","domainError","batchError","languageError","termsError"
  ].forEach(id => showError(id, ""));

  if (!name) { showError("nameError", "Name is required"); ok = false; }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showError("emailError", "Valid email is required"); ok = false; }
  if (!/^\d{10}$/.test(mobile)) { showError("mobileError", "Enter a valid 10-digit mobile number"); ok = false; }
  if (!/^\d{10}$/.test(whatsapp)) { showError("whatsappError", "Enter a valid 10-digit WhatsApp number"); ok = false; }

  if (!college) { showError("collegeError", "College/University is required"); ok = false; }
  if (!department) { showError("departmentError", "Department is required"); ok = false; }
  if (!yearOfStudy) { showError("yearError", "Select Year of Study"); ok = false; }

  if (!domain) { showError("domainError", "Select a domain"); ok = false; }
  if (!batch) { showError("batchError", "Select a batch month"); ok = false; }
  if (!language) { showError("languageError", "Select a language"); ok = false; }

  if (!terms) { showError("termsError", "You must agree to receive communications"); ok = false; }

  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!WEB_APP_URL || WEB_APP_URL.includes("PASTE_YOUR_WEB_APP_URL_HERE")) {
    alert("Please paste your Apps Script Web App URL in script.js (WEB_APP_URL).");
    return;
  }

  if (!validateForm()) return;

  const formData = new FormData(form);
  formData.set("terms", document.getElementById("terms").checked ? "true" : "false");

  // send some meta (optional)
  formData.set("userAgent", navigator.userAgent);

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    // Apps Script Web Apps often don't allow reading response via CORS.
    // mode:"no-cors" reliably sends the data; response will be "opaque".
    await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams([...formData.entries()]).toString()
    });

    // Assume success if request was sent
    form.style.display = "none";
    successMessage.style.display = "block";

  } catch (err) {
    console.error(err);
    alert("Submission failed. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Application";
  }
});
