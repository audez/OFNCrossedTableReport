const fs = require("fs");
const generateReport = require("./generateReport");

fs.readFile("./oc_customer_report.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("File read failed:", err);
    return;
  }
  generateReport(JSON.parse(jsonString)[0].data);
});
