const { vatChecker } = require("../help");
const economicHeaders = require("../env.json");
const axios = require("axios");

async function findOrCreateCustomer(email, customerData) {
    const existingCustomer = await findCustomerByEmail(email);
    if (existingCustomer) {
        return existingCustomer;
    } else {
        return createCustomer(customerData, email);
    }
}

async function findCustomerByEmail(email) {
    const result = await axios.get(
        `https://restapi.e-conomic.com/customers?filter=email$eq:${email}`,
        economicHeaders
    );
    return result.data.collection[0] || null;
}

async function createCustomer(customerData, email) {
    const newCustomerData = {
        currency: customerData.currency,
        email,
        customerGroup: { customerGroupNumber: 1 },
        name: `${customerData.first_name} ${customerData.last_name}`,
        paymentTerms: { paymentTermsNumber: 1 },
        vatZone: {
            vatZoneNumber: vatChecker(customerData.default_address.country),
        },
        phone: customerData.phone,
        city: customerData.default_address.city,
        address: `${customerData?.default_address?.address1 +
            " " +
            customerData?.default_address?.address2
            }`,
        zip: customerData?.default_address?.zip,
        country: customerData?.default_address?.country_name,
    };
    let createdCustomer = await axios.post(
        "https://restapi.e-conomic.com/customers",
        newCustomerData,
        economicHeaders
    );
    return createdCustomer.data
}

module.exports = {
    findOrCreateCustomer,
};