const express = require("express");
const router = express.Router();
const { contactValidation } = require("./validation");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

router.get("/", (req, res) => {
  try {
    const contacts = listContacts();
    if (contacts !== null) {
      res.json(contacts);
    } else {
      throw new Error("Unable to fetch contacts");
    }
  } catch (error) {
    console.error("Error listing contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await getContactById(contactId);
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
    const newContact = await addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const contactId = req.params.id;
  try {
    const result = await removeContact(contactId);
    if (!result) {
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
    const updatedContact = await updateContact(contactId, {
      name,
      email,
      phone,
    });

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(updatedContact);
  } catch (error) {
    console.error(`Error updating contact with ID ${contactId}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
