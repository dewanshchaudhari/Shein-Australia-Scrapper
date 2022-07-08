const links = require("./links.json");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const os = require("os");
const { Parser } = require("json2csv");
// const fields = ["Title", "Images", "Size", "Description", "Price"];
const fields = [
  "ID",
  "Type",
  "SKU",
  "Name",
  "Published",
  "Is featured?",
  "Visibility in catalog",
  "Short description",
  "Description",
  "Date sale price starts",
  "Date sale price ends",
  "Tax status",
  "Tax class",
  "In stock?",
  "Stock",
  "Low stock amount",
  "Backorders allowed?",
  "Sold individually?",
  "Weight (kg)",
  "Length (cm)",
  "Width (cm)",
  "Height (cm)",
  "Allow customer reviews?",
  "Purchase note",
  "Sale price",
  "Regular price",
  "Categories",
  "Tags",
  "Shipping class",
  "Images",
  "Download limit",
  "Download expiry days",
  "Parent",
  "Grouped products",
  "Upsells",
  "Cross-sells",
  "External URL",
  "Button text",
  "Position",
  "Attribute 1 name",
  "Attribute 1 value(s)",
  "Attribute 1 visible",
  "Attribute 1 global",
  "Attribute 2 name",
  "Attribute 2 value(s)",
  "Attribute 2 visible",
  "Attribute 2 global",
  "Attribute 3 name",
  "Attribute 3 value(s)",
  "Attribute 3 visible",
  "Attribute 3 global",
  "Attribute 4 name",
  "Attribute 4 value(s)",
  "Attribute 4 visible",
  "Attribute 4 global",
  "Attribute 5 name",
  "Attribute 5 value(s)",
  "Attribute 5 visible",
  "Attribute 5 global",
];
const opts = { fields };
let products = [];
(async () => {
  try {
    for (let i = 0; i < links.length; i++) {
      const response = await fetch(links[i]);
      const body = await response.text();
      const data = JSON.parse(
        body.split("productIntroData: ")[1].split("abt:")[0].trim().slice(0, -1)
      );
      delete data.sizeInfoDes.sizeInfo[0].attr_id;
      delete data.sizeInfoDes.sizeInfo[0].attr_name;
      delete data.sizeInfoDes.sizeInfo[0].attr_value_id;
      delete data.sizeInfoDes.sizeInfo[0].attr_value_name;
      delete data.sizeInfoDes.sizeInfo[0].attr_value_name_en;
      const product = {
        Name: data.detail.goods_name,
        Images: [
          `https:${data.goods_imgs.main_image.origin_image}`,
          ...data.goods_imgs.detail_image.map(
            (image) => `https:${image.origin_image}`
          ),
        ].join(","),
        Description: data.detail.productDetails
          .map((details) => `${details.attr_name_en}:${details.attr_value_en}`)
          .join("\\n"),
        "Regular price": data.detail.retailPrice.amountWithSymbol,
      };
      // console.log(product);
      let j = 1;
      for (let x in data.sizeInfoDes.sizeInfo[0]) {
        if (j > 5) break;
        product[`Attribute ${j} name`] = x;
        product[`Attribute ${j} value(s)`] = data.sizeInfoDes.sizeInfo[0][x];
        j++;
      }
      product.Type = "simple";
      product.Published = 1;
      product["Is featured?"] = 0;
      product["Visibility in catalog"] = "visible";
      product["In stock?"] = 1;
      product["Backorders allowed?"] = 0;
      product["Sold individually?"] = 0;
      product["Allow customer reviews?"] = 1;
      product["Categories"] = "Handbags";
      product["Position"] = 0;
      product["Attribute 1 visible"] = 1;
      product["Attribute 1 global"] = 1;
      product["Attribute 2 visible"] = 1;
      product["Attribute 2 global"] = 1;
      product["Attribute 3 visible"] = 1;
      product["Attribute 3 global"] = 1;
      product["Attribute 4 visible"] = 1;
      product["Attribute 4 global"] = 1;
      product["Attribute 5 visible"] = 1;
      product["Attribute 5 global"] = 1;
      products.push(product);
      console.log(`${i}: ${links[i]} done`);
    }
  } catch (error) {
    console.log(error);
  }
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(products);
    fs.writeFileSync("./products.csv", csv);
    console.log(csv);
  } catch (error) {
    console.log(error);
  }
})();
