const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { contactValidation } = require("./contatctValidation");
const authMiddleware = require("../auth");
require("dotenv").config();

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});
const Contact = mongoose.model("Contact", contactSchema);

router.use(authMiddleware);

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
  const { name, email, phone } = req.body;

  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newContact = await Contact.create({ name, email, phone });
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
  const contactId = req.params.id;
  const { name, email, phone } = req.body;

  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedContact = await Contact.updateOne(
      { _id: contactId },
      { name, email, phone },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    console.error(`Error updating contact ${contactId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:contactId/favorite", async (req, res) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  if (favorite === undefined || typeof favorite !== "boolean") {
    return res.status(400).json({ message: "Misging field favorite" });
  }

  try {
    const updateStatusContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );

    if (!updateStatusContact) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(updateStatusContact);
  } catch (error) {
    console.error(`Error updating favorite status for ${contactId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
