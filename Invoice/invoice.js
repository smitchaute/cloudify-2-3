const { findOrCreateProducts } = require("../Product/prod");
const axios = require("axios");
const economicHeaders = require("../env.json")

async function createInvoice(customer, lineItems, currency) {
    const collection = await findOrCreateProducts(lineItems);
    const draftInvoiceBody = {
        currency,
        customer: {
            customerNumber: customer.customerNumber,
        },
        date: new Date().toISOString().split("T")[0],
        layout: { layoutNumber: 20 },
        paymentTerms: { paymentTermsNumber: 1 },
        recipient: {
            name: customer.name,
            vatZone: {
                vatZoneNumber: customer.vatZone.vatZoneNumber,
            },
        },
        lines: createInvoiceContent(collection),
    };
    const draftInvoice = await axios.post(
        "https://restapi.e-conomic.com/invoices/drafts",
        draftInvoiceBody,
        economicHeaders
    );
    console.log(draftInvoice);
    return draftInvoice.data;
}

function createInvoiceContent(collection) {
    return collection.map((data) => (
        {
            lineNumber: 1,
            product: { productNumber: data.productNumber },
            quantity: 1.0,
            unitNetPrice: 20000.0, // You may need to set the appropriate price here
        }));
}

module.exports = { createInvoice };