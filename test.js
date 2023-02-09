const fs = require("fs").promises;
const generateReport = require("./src/GenerateReport");

describe("GenerateReport", () => {
  it("#generateReport() function", async () => {
    const json = await fs.readFile("./oc_customer_report.json");
    const data = JSON.parse(json)[0].data;
    const result = generateReport(data);
    expect(result).toEqual(excepected);
  });
});

const excepected = [
  {
    "Avocats - 10kg": "3.0",
    "Avocats - 2kg": "3.0",
    "Avocats - 6kg": "3.0",
    Boutique: "-",
    "Cycle de vente": "-",
    Name: "-",
    "Oranges - 2kg": "9.0",
  },
  {
    Boutique: "Groupe 1",
    "Cycle de vente": "Galline Felici janvier 2023",
    "Méthode de paiement": "Sur place (espèces, chèques)",
    Name: "ttttt Dumas - 0909890909",
    "Oranges - 2kg": 3,
    Payé: false,
    "Prix total": "",
  },
  {
    Boutique: "Groupe 1",
    "Cycle de vente": "Galline Felici janvier 2023",
    "Méthode de paiement": "Sur place (espèces, chèques)",
    Name: "Patou Dumas - 0909890909",
    "Oranges - 2kg": 3,
    Payé: false,
    "Prix total": "",
  },
  {
    "Avocats - 6kg": 1,
    Boutique: "Groupe 1",
    "Cycle de vente": "kk",
    "Méthode de paiement": "Sur place (espèces, chèques)",
    Name: "So Happy - 0909890909",
    Payé: false,
    "Prix total": "",
  },
  {
    "Avocats - 10kg": 1,
    "Avocats - 2kg": 1,
    Boutique: "Groupe 1",
    "Cycle de vente": "kk",
    "Méthode de paiement": "Sur place (espèces, chèques)",
    Name: "Patou Lagarrigue - 0909890909",
    Payé: false,
    "Prix total": "",
  },
];
