require("dotenv").config()

const express = require('express');
const app = express();
const cors = require("cors")
app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:5500",
    })
  )
app.use(express.static('public'))
const stripe = require('stripe')(process.env.STRIPE_PK)

const storeItems = new Map([
    [1,{priceIncents:1000,name: "learn node.js"} ],
    [2,{priceIncents:2000,name: "learn react.js today"}]
]);

let session;
app.post("/create", async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map(item => {
          const storeItem = storeItems.get(item.id)
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: storeItem.name,
              },
              unit_amount: storeItem.priceIncents,
            },
            quantity: item.quantity,
          }
        }),
        success_url: `${process.env.SERVER_URL}/sucess.html`,
        cancel_url: `${process.env.SERVER_URL}/cancel.html`,
      })
      res.json({ url: session.url })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
app.listen(3000,()=>{
    console.log(`server start at port ${3000}`);
});