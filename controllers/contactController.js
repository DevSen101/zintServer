// controllers/contactController.js
const Contact = require("../models/Contact");

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single contact by ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Existing create function
const createContact = async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      interest,
      message
    });

    await newContact.save();
    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById
};