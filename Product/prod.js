const economicHeaders = require("../env.json");
const axios = require("axios");

function createProducts(shopifyProduct) {
    return shopifyProduct.variants.map((variant) => ({
        name: variant.title,
        productNumber: variant.sku,
        salesPrice: +variant.price,
        description: shopifyProduct.title,
        productGroup: {
            productGroupNumber: 1, // Set product group number
        },
    }));
}

async function postEconomicProducts(products) {
    for (const product of products) {
        await axios.post(
            "https://restapi.e-conomic.com/products",
            product,
            economicHeaders
        );
    }
}

async function findOrCreateProducts(lineItems) {
    const economicProducts = [];

    for (const lineItem of lineItems) {
        const sku = lineItem.sku;
        const existingProduct = await findProductBySku(sku);

        if (existingProduct) {
            economicProducts.push(existingProduct);
        } else {
            const newProductData = {
                productGroup: { productGroupNumber: 1 },
                productNumber: sku,
                name: lineItem.title,
                salesPrice: parseInt(lineItem.price),
                variants: lineItem.variants,
                title: lineItem.title
            };
            const newProduct = await createProducts(newProductData);
            await postEconomicProducts(newProduct)
            economicProducts.push(newProduct[0]);
        }
    }
    return economicProducts;
}

async function findProductBySku(sku) {
    const result = await axios.get(
        `https://restapi.e-conomic.com/products?filter=productNumber$eq:${sku}`,
        economicHeaders
    );
    return result.data.collection[0] || null;
}

module.exports = {
    createProducts,
    postEconomicProducts,
    findOrCreateProducts,
};