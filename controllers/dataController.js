const Customer = require("../models/customer");
const Order = require("../models/order");
const db = require("../config/db");

const renderCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.render("Data/customers", { customers });
  } catch (error) {
    res.status(500).send("Error fetching customers");
  }
};

const renderAddCustomerForm = (req, res) => {
  res.render("Data/addCustomers");
};

const renderOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.render("Data/orders", { orders });
  } catch (error) {
    res.status(500).send("Error fetching orders");
  }
};

const renderAddOrderForm = (req, res) => {
  res.render("Data/addOrder");
};

const addCustomer = async (req, res) => {
  try {
    const { name, email, total_spending, last_visit } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const customerId = await Customer.create(req.body);
    res.redirect("/Data/customers");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addOrder = async (req, res) => {
  try {
    const { customerEmail, amount } = req.body;
    console.log("Received email:", customerEmail); 

    const customers = await Customer.getByEmails([customerEmail]);
    console.log("Fetched customer:", customers);


    if (!customers || customers.length === 0) {
      return res.status(400).json({ error: "Customer does not exist" });
    }

    console.log("Customer found, creating order...");

    const orderData = {
      customer_id: customers[0].customer_id,
      amount,
      order_date: new Date(),
    };
    await Order.create(orderData);

    console.log("Order created, redirecting...");
    res.redirect("/Data/orders");
  } catch (error) {
    console.error("Error in addOrder:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  renderCustomers,
  renderAddCustomerForm,
  renderOrders,
  renderAddOrderForm,
  addCustomer,
  addOrder,
};
