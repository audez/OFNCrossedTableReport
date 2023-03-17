// Get the OC customer report JSON
const json = require('./terravie.json')

const initialArray = json[0].data

let OrderCycleVariants = []
let jsonMainObject
let jsonOCArray = []
let jsonMainArray = []
let jsonVariantPrices = {}
let jsonVariantTotalPrices = {}
let jsonVariantTotalQuantities = {}
let jsonEmptyLine
let shippingMethodArray
let orderCycleArray
let orderCycleNames
let orderTotalPrice = 0
let orderPaid
let paymentMethod
let hubNames
let shippingNames
let variantNames
let hubArray


orderCycleNames = extractNames(initialArray, "orderCycles")

orderCycleNames.forEach(orderCycleName => {

        orderCycleArray = []
        orderCycleArray = Object.values(initialArray).filter(
            (v) => v.order_cycle === orderCycleName
        )

        addVariantPricesToJson(orderCycleArray)

        hubNames = []
        hubNames = extractNames(orderCycleArray, "hubs")

        hubNames.forEach(hubName => {
            addHubNameToJson(hubName)

            hubArray = []
            hubArray = Object.values(orderCycleArray).filter(
                (v) => v.hub === hubName
            )

            shippingNames = []
            shippingNames = extractNames(hubArray, "shipping")

            shippingNames.forEach(shippingName => {
                addShippingMethodToJson(shippingName)

                shippingMethodArray = Object.values(hubArray).filter(
                    (v) => v.shipping === shippingName
                )

                let customerNames = []
                customerNames = extractNames(shippingMethodArray, "customers")

                customerNames.forEach(customerName => {

                    beginBuildingMainObject(customerName)

                    variantNames = []
                    variantNames = extractNames(shippingMethodArray, "variants")

                    variantNames.forEach(variant => {
                        addItemPricesToMainObject(shippingMethodArray, variant, customerName)
                    })

                    addOrderInfoToMainObject(customerName)

                    jsonOCArray.push(jsonMainObject)

                })

                jsonOCArray.push(jsonEmptyLine)
                //jsonOCArray.push(jsonVariantTotalPrices)


                jsonVariantTotalQuantities = addTotalToObject(variantNames, shippingMethodArray, "quantity")
                jsonVariantTotalPrices = addTotalToObject(variantNames, shippingMethodArray, "price")
                jsonOCArray.push(jsonVariantTotalQuantities)
                jsonOCArray.push(jsonVariantTotalPrices)
                jsonOCArray.push(jsonEmptyLine)
            })
            jsonOCArray.push(jsonEmptyLine)
        })
        jsonOCArray.unshift(jsonVariantPrices)
        let jsonOrderCycle = {}
        jsonOrderCycle["Cycle de vente"] = orderCycleName
        jsonOCArray.unshift(jsonOrderCycle)

    jsonMainArray.push(jsonOCArray)
        jsonOCArray.push(jsonEmptyLine)
    }
)
console.log("array = " + JSON.stringify(jsonMainArray))



function addHubNameToJson(hubName) {
    const jsonHub = {}
    jsonHub["-"] = "BOUTIQUE : " + hubName
    jsonOCArray.push(jsonHub)
}

function addShippingMethodToJson(shippingMethod) {
    jsonShipping = {}
    jsonShipping["-"] = "LIVRAISON : " + shippingMethod
    jsonOCArray.push(jsonShipping)
}

function beginBuildingMainObject(customer) {
    jsonMainObject = {}
    jsonMainObject["-"] = ""
    jsonMainObject["Infos client"] = customer
}

function addVariantPricesToJson(array) {
    jsonVariantPrices["-"] = ""
    jsonVariantPrices["Infos client"] = ""

    OrderCycleVariants = [] //All variants ordered in the OC
    for (let i in array) {
        OrderCycleVariants.push(array[i].product + " - " + array[i].variant)
    }
    OrderCycleVariants = Array.from(new Set(OrderCycleVariants)) // Remove duplicates

    for (let p = 0; p < OrderCycleVariants.length; p++) {
        variantObject = {}
        variantObject = array.find(it => (it.product + " - " + it.variant) === OrderCycleVariants[p])

        // TO BE FIXED WHEN API FIXED:
        // replace (variantArray.item_price  / variantArray.quantity) with item_price
        jsonVariantPrices[OrderCycleVariants[p]] = (parseFloat(variantObject.item_price) / variantObject.quantity) + "€"

        jsonEmptyLine = {}
        jsonEmptyLine["-"] = ""
        jsonEmptyLine["Infos client"] = ""
        jsonEmptyLine["Total commande"] = ""
        jsonEmptyLine[OrderCycleVariants[p]] = ""
    }

}

function addItemPricesToMainObject(array, variant, customer) {

    let variantQuantity = 0

    array.forEach(item => {

        if ((item.product + " - " + item.variant) === variant
            && (item.customer + " - " + item.phone) === customer) {

            variantQuantity += item.quantity
            jsonMainObject[variant] = variantQuantity // Columns with variant names :D

            orderTotalPrice += parseFloat(item.item_price)
            orderPaid = item.paid.toString()
            paymentMethod = item.payment_method
        }
    })
}

function addOrderInfoToMainObject(customerName) {

    jsonMainObject["Total commande"] = orderTotalPrice + "€"

    if (orderPaid === "false") {
        jsonMainObject["Payé"] = "non"
    } else {
        jsonMainObject["Payé"] = "oui"
    }
    jsonMainObject["Méthode de paiement"] = paymentMethod

    orderTotalPrice = 0
}


function extractNames(baseArray, items) {
    var arrayToReturn = []
    baseArray.forEach(element => {
        if (items === "hubs") {
            arrayToReturn.push(element.hub)
        } else if (items === "shipping") {
            arrayToReturn.push(element.shipping)
        } else if (items === "variants") {
            arrayToReturn.push(element.product + " - " + element.variant)
        } else if (items === "customers") {
            arrayToReturn.push(element.customer + " - " + element.phone)
        } else {
            arrayToReturn.push(element.order_cycle)
        }
    })

    return Array.from(new Set(arrayToReturn))
}


function addTotalToObject(variantList, array, toReturn) {
    let jsonVariantTotal = {}
    jsonVariantTotal["-"] = ""
    if (toReturn === "quantity") {
        jsonVariantTotal["Infos client"] = "TOTAL QUANTITÉ VARIANTES"
    } else {
        jsonVariantTotal["Infos client"] = "TOTAL PRIX VARIANTES"
    }

    let grandTotal = 0

    variantList.forEach(variant => {
        let total = 0
        array.forEach(element => {
            if (element.product + " - " + element.variant === variant) {
                if (toReturn === "quantity") {
                    total += element.quantity
                } else {
                    total += parseFloat(element.item_price)// TO FIX WHEN API FIXED: replace by element.total_price
                }
            }
        })
        if (toReturn === "quantity") {
            jsonVariantTotal[variant] = total
        } else {
            jsonVariantTotal[variant] = total.toFixed(2)
        }
        grandTotal += total
    })
    if(toReturn === "price"){
        jsonVariantTotal["Total commande"] = grandTotal + "€"
    }

    return jsonVariantTotal
}
