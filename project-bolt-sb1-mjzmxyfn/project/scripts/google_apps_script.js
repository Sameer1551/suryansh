/**
 * Suryansh.dp - Google Sheets Master Database Receiver
 * 
 * Instructions:
 * 1. Open Google Sheets at https://sheets.new (under suryanshh.dp@gmail.com).
 * 2. Name your spreadsheet: "DOP Master Industry Database"
 * 3. In the top menu, click Extensions > Apps Script.
 * 4. Replace any existing code with this entire script.
 * 5. Click "Deploy" (top right blue button) > "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Set:
 *    - Description: "DOP Sync"
 *    - Execute as: "Me (suryanshh.dp@gmail.com)"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy", authorize permissions when prompted, and COPY the Web App URL.
 * 9. Paste that URL into the terminal or into scripts/google_sync_config.json!
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No post data received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheetsData = payload.sheets || [];
    if (!Array.isArray(sheetsData) || sheetsData.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No sheets data provided"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Map existing sheets by name
    var existingSheets = {};
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      existingSheets[allSheets[i].getName()] = allSheets[i];
    }

    var updatedCount = 0;

    for (var s = 0; s < sheetsData.length; s++) {
      var item = sheetsData[s];
      var name = item.name;
      var rows = item.data || [];

      if (!rows || rows.length === 0) continue;

      var targetSheet = existingSheets[name];
      if (!targetSheet) {
        targetSheet = ss.insertSheet(name);
        existingSheets[name] = targetSheet;
      }

      // Clear old contents
      targetSheet.clear();

      var numRows = rows.length;
      var numCols = 0;
      for (var r = 0; r < rows.length; r++) {
        if (rows[r].length > numCols) {
          numCols = rows[r].length;
        }
      }

      if (numRows > 0 && numCols > 0) {
        // Normalize rows to same column count
        var normalized = [];
        for (var r = 0; r < rows.length; r++) {
          var row = rows[r];
          var newRow = [];
          for (var c = 0; c < numCols; c++) {
            var val = (c < row.length && row[c] !== null && row[c] !== undefined) ? row[c] : "";
            newRow.push(val);
          }
          normalized.push(newRow);
        }

        targetSheet.getRange(1, 1, numRows, numCols).setValues(normalized);
        updatedCount++;
      }
    }

    // Delete default 'Sheet1' if it was empty and wasn't part of the database
    if (existingSheets["Sheet1"] && !sheetsData.some(function(item) { return item.name === "Sheet1"; })) {
      try {
        if (ss.getSheets().length > 1) {
          ss.deleteSheet(existingSheets["Sheet1"]);
        }
      } catch (err) {}
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Successfully synced " + updatedCount + " sheets to Google Drive!",
      spreadsheetTitle: ss.getName(),
      spreadsheetUrl: ss.getUrl(),
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Suryansh.dp Google Drive Database Sync",
    spreadsheet: ss ? ss.getName() : "Unknown",
    url: ss ? ss.getUrl() : ""
  })).setMimeType(ContentService.MimeType.JSON);
}
