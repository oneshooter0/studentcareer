/***********************
 * CareerLaunch Backend
 * Saves form submissions to Google Sheets
 ***********************/

const CONFIG = {
  SPREADSHEET_ID: "1K4iofsKaOE1n7d_dXLOorKUAt2_PDOGjYWnnusGoAbQ",
  SHEET_NAME: "Applications", // <-- You can change this tab name
  HEADERS: [
    "Timestamp",
    "Name",
    "Email",
    "College Email",
    "Mobile",
    "WhatsApp",
    "College/University",
    "Department",
    "Year Of Study",
    "Domain",
    "Batch/Month",
    "Language",
    "Terms Accepted",
    "User Agent",
    "IP (if available)"
  ]
};

function doGet() {
  return ContentService
    .createTextOutput("CareerLaunch API is running ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const payload = parsePayload_(e);

    // Minimal server-side validation (frontend also validates)
    const requiredFields = ["name", "email", "mobile", "whatsapp", "college", "department", "yearOfStudy", "domain", "batch", "language", "terms"];
    const missing = requiredFields.filter(k => !String(payload[k] || "").trim());

    if (missing.length) {
      return json_({ success: false, message: "Missing required fields", missing });
    }

    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);

    sheet.appendRow([
      new Date(),
      payload.name,
      payload.email,
      payload.collegeEmail || "",
      payload.mobile,
      payload.whatsapp,
      payload.college,
      payload.department,
      payload.yearOfStudy,
      payload.domain,
      payload.batch,
      payload.language,
      String(payload.terms) === "true" ? "Yes" : "No",
      payload.userAgent || "",
      payload.ip || ""
    ]);

    return json_({ success: true, message: "Saved successfully" });

  } catch (err) {
    return json_({ success: false, message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** -------- Helpers ---------- */

function parsePayload_(e) {
  // Supports:
  // 1) application/x-www-form-urlencoded (from URLSearchParams)
  // 2) application/json
  const payload = {};

  // Try JSON first
  if (e && e.postData && e.postData.contents) {
    const ct = (e.postData.type || "").toLowerCase();
    if (ct.includes("application/json")) {
      const obj = JSON.parse(e.postData.contents);
      Object.assign(payload, obj || {});
    }
  }

  // Fallback to form fields
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(k => payload[k] = e.parameter[k]);
  }

  // Add meta if available
  payload.userAgent = (e && e.parameter && e.parameter.userAgent) ? e.parameter.userAgent : (payload.userAgent || "");
  payload.ip = (e && e.parameter && e.parameter.ip) ? e.parameter.ip : (payload.ip || "");

  return payload;
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CONFIG.HEADERS);
    sheet.setFrozenRows(1);
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
