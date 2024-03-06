const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { contactValidation } = require("./validation");

mongoose.connect(
  "mongodb+srv://kacpertrybus133:123123123@cluster0.rdi4yxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "db-contacts",
  }
);

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});
const Contact = mongoose.model("Contact", contactSchema);

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    console.error("Error listing contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
    } else {
      res.json(contact);
    }
  } catch (error) {
    console.error(`Error getting contact by ID ${contactId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { name, email, phone } = req.body;
  try {
    const newContact = new Contact({ name, email, phone });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const contactId = req.params.id;
  try {
    const result = await Contact.deleteOne({ _id: contactId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Contact not found" });
    } else {
      res.json({ message: "Contact removed successfully" });
    }
  } catch (error) {
    console.error(`Error removing contact with ID ${contactId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const contactId = req.params.id;
  const { name, email, phone } = req.body;

  try {
    const result = await Contact.updateOne(
      { _id: contactId },
      { $set: { name, email, phone } }
    );
    if (result.n === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    console.error(`Error updating contact with ID ${contactId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
