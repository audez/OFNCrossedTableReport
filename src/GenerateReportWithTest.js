// Get the OC customer report JSON

const generateReport = (data) => {
  let orderCycles = [];
  let products = [];
  let hubNames;
  let jsonObject;
  let jsonPricesObject;
  let filteredDataByOC;
  let filteredData;
  let jsonArray = [];

  data.forEach((element) => {
    orderCycles.push(element.order_cycle);
    products.push(element.product + " - " + element.variant);
  });
  orderCycles = Array.from(new Set(orderCycles));
  products = Array.from(new Set(products));

  // Create a specific JSON object to get variants prices of all products
  jsonPricesObject = {};
  jsonPricesObject["Cycle de vente"] = "-";
  jsonPricesObject["Boutique"] = "-";
  jsonPricesObject["Name"] = "-";

  for (let p = 0; p < products.length; p++) {
    const product = products[p];
    let match = {};
    match = data.find((it) => it.product + " - " + it.variant === product);

    jsonPricesObject[product] = match.item_price;
  }

  // Loop through OC then hubs
  for (let o = 0; o < orderCycles.length; o++) {
    filteredDataByOC = data;
    filteredDataByOC = Object.values(data).filter(
      (v) => v.order_cycle === orderCycles[o]
    );

    hubNames = [];
    for (let i = 0; i < filteredDataByOC.length; i++) {
      hubNames.push(filteredDataByOC[i].hub);
    }
    hubNames = Array.from(new Set(hubNames));

    for (let h = 0; h < hubNames.length; h++) {
      filteredData = filteredDataByOC;
      filteredData = Object.values(filteredDataByOC).filter(
        (v) => v.hub === hubNames[h]
      );

      // Get all products sold for this OC and this hub
      products = [];
      for (let i = 0; i < filteredData.length; i++) {
        const toAdd = filteredData[i].product + " - " + filteredData[i].variant;
        products.push(toAdd);
      }
      products = Array.from(new Set(products));

      let customerList = [];

      // Aggregates customers names + phone numbers
      for (let x = 0; x < filteredData.length; x++) {
        customerList.push(
          filteredData[x].customer + " - " + filteredData[x].phone
        );
      }
      customerList = Array.from(new Set(customerList));

      //Build our customer in rows
      for (let c = 0; c < customerList.length; c++) {
        const customer = customerList[c];

        //Start building the main JSON object
        jsonObject = {};
        jsonObject["Cycle de vente"] = orderCycles[o];
        jsonObject["Boutique"] = hubNames[h];
        jsonObject["Name"] = customer;

        //Build our product in columns
        for (let p = 0; p < products.length; p++) {
          const product = products[p];

          let totalPerCustomer = 0;
          for (let k = 0; k < filteredData.length; k++) {
            if (
              filteredData[k].product + " - " + filteredData[k].variant ===
                product &&
              filteredData[k].customer + " - " + filteredData[k].phone ===
                customer
            ) {
              // Get product quantities
              totalPerCustomer += filteredData[k].quantity;

              jsonObject[product] = totalPerCustomer;
              jsonObject["Prix total"] = filteredData[k].total_price;
              jsonObject["Payé"] = filteredData[k].paid;
              jsonObject["Méthode de paiement"] =
                filteredData[k].payment_method;
            }
          }
        }
        //Add the object to the final Array
        jsonArray.push(jsonObject);
      }
    }
  }
  // Add the prices to the final Array
  jsonArray.unshift(jsonPricesObject);
  return jsonArray;
};

module.exports = generateReport;
