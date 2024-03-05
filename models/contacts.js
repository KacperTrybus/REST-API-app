const path = require("node:path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const contactsPath = path.resolve(__dirname, "..", "models", "contacts.json");
const { v4: uuidv4 } = require("uuid");

function listContacts() {
  try {
    const data = fs.readFileSync(contactsPath);
    return JSON.parse(data);
  } catch (err) {
    console.log("error:", err.message);
    return null;
  }
}

async function getContactById(contactId) {
  try {
    const data = await fsPromises.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((contact) => contact.id === contactId);
    if (contact) {
      return contact;
    } else {
      console.log("Contact not found");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
function addContact(name, email, phone) {
  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.log("error:", err);
      return;
    }

    const contacts = JSON.parse(data);
    const newContact = {
      id: uuidv4(),
      name: name || "",
      email: email || "",
      phone: phone || "",
    };

    contacts.push(newContact);

    fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), (err) => {
      if (err) {
        console.log("error:", err);
        return;
      }
      console.log(`Added contact: ${name} ${email} ${phone}`);
      return newContact;
    });
  });
}

function removeContact(contactId) {
  fs.readFile(contactsPath, "utf8", function (err, data) {
    if (err) {
      console.log("error:", err);
      return;
    }
    const contacts = JSON.parse(data);

    const indexToRemove = contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (indexToRemove !== -1) {
      contacts.splice(indexToRemove, 1);
      fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), (err) => {
        if (err) {
          console.log("error:", err);
          return;
        }
        console.log("Contact removed successfully");
      });
    } else {
      console.log("Contact not found");
    }
  });
}

async function updateContact(contactId, newData) {
  try {
    const data = await fsPromises.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);

    const indexToUpdate = contacts.findIndex(
      (contact) => contact.id === contactId
    );
    if (indexToUpdate === -1) {
      console.log("Contact not found");
      return null;
    }

    contacts[indexToUpdate] = { ...contacts[indexToUpdate], ...newData };

    await fsPromises.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    console.log(`Contact with ID ${contactId} updated successfully`);

    return contacts[indexToUpdate];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
