// Import required modules
const express = require("express");
const bodyParser = require("body-parser");

//Helpers
const {
    createProducts,
    postEconomicProducts,
} = require("./Product/prod");

const { findOrCreateCustomer } = require("./Customer/customer");

const { createInvoice } = require("./Invoice/invoice");

// Create an Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Define routes and handlers
app.post("/product", productRequest);
app.post("/invoice", invoiceRequest);

// Request handlers
async function productRequest(req, res) {
    try {
        const shopifyNewProduct = req.body;
        const economicProduct = createProducts(shopifyNewProduct);
        await postEconomicProducts(economicProduct);
        res
            .status(201)
            .send({
                message: "success",
                productName: shopifyNewProduct.title,
                economicProduct,
            });
    } catch (error) {
        console.log(error);
    }
}

async function invoiceRequest(req, res) {
    try {
        const targetEmail = req.body.email;
        const lineItems = req.body.line_items;
        const currency = req.body.currency;

        let draftInvoice = {};
        let customer = await findOrCreateCustomer(targetEmail, req.body.customer);

        draftInvoice = await createInvoice(customer, lineItems, currency);

        res.status(201).send({ message: "success", data: draftInvoice });
    } catch (error) {
        console.log(error)
        // console.log(error.response.data.errors.lines.items[0].product);
        // res.status(500).send(error.response.data.errors[0].toString())
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});