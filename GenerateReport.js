//request: https://staging.coopcircuits.fr/api/v0/reports/orders_and_fulfillment/order_cycle_customer_totals?q[completed_at_gt]=2020_01_02

const json = require('./customerreport.json')

const data = json[0].data
let orderCycles = []
let products = []
let hubNames
let jsonObject
let jsonPricesObject
let filteredDataByOC
let filteredData
let myArray = []

for (let i in data) {
    orderCycles.push(data[i].order_cycle)
    products.push(data[i].product + " - " + data[i].variant)
}
orderCycles = Array.from(new Set(orderCycles))
products = Array.from(new Set(products))

jsonPricesObject = {}
jsonPricesObject["Boutique"] = "-"
jsonPricesObject["Cycle de vente"] = "-"
jsonPricesObject["Name"] = "-"

for (let p = 0; p < products.length; p++) {
    const product = products[p]
    let match = {}
    match = data.find(it => (it.product + " - " + it.variant) === product)

    jsonPricesObject[product] = match.item_price
}

for (let o = 0; o < orderCycles.length; o++) {
    filteredDataByOC = data
    filteredDataByOC = Object.values(data).filter((v) =>
        v.order_cycle === orderCycles[o])

    hubNames = []
    for (let i = 0; i < filteredDataByOC.length; i++) {
        hubNames.push(filteredDataByOC[i].hub)
    }
    hubNames = Array.from(new Set(hubNames))

    for (let h = 0; h < hubNames.length; h++) {
        filteredData = filteredDataByOC
        filteredData = Object.values(filteredDataByOC).filter((v) =>
            v.hub === hubNames[h])

        products = []
        // Aggregates product+variant
        for (let i = 0; i < filteredData.length; i++) {
            const toAdd = filteredData[i].product + " - " + filteredData[i].variant
            products.push(toAdd)
        }
        products = Array.from(new Set(products))

        let customerList = []

        for (let x = 0; x < filteredData.length; x++) {
            customerList.push(filteredData[x].customer + " - " + filteredData[x].phone)
        }
        customerList = Array.from(new Set(customerList))
        console.log("cust list sorted = " + customerList)

        //Build our customer in rows
        for (let c = 0; c < customerList.length; c++) {
            const customer = customerList[c]

            //Starting building our JSON
            jsonObject = {}
            jsonObject["Boutique"] = hubNames[h]
            jsonObject["Cycle de vente"] = orderCycles[o]
            jsonObject["Name"] = customer

            //Build our product in columns
            for (let p = 0; p < products.length; p++) {
                const product = products[p]

                let totalPerCustomer = 0
                for (let k = 0; k < filteredData.length; k++) {
                    if ((filteredData[k].product + " - " + filteredData[k].variant) === product
                        && (filteredData[k].customer + " - " + filteredData[k].phone) === customer) {
                        totalPerCustomer += filteredData[k].quantity
                        jsonObject[product] = totalPerCustomer
                        jsonObject["Prix total"] = filteredData[k].total_price
                        jsonObject["Payé"] = filteredData[k].paid
                        jsonObject["Méthode de paiement"] = filteredData[k].payment_method
                    }
                }
            }
            myArray.push(jsonObject)
        }
    }
}
myArray.unshift(jsonPricesObject)
console.log("array = " + JSON.stringify(myArray))


