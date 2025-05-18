const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// Submit a new contact message
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and message",
      });
    }

    // Create new contact
    const contact = await Contact.create({
      name,
      email,
      message,
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all contact messages (for admin purposes)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a single contact message by ID (for admin purposes)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update contact status (for admin purposes)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a contact message (for admin purposes)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// NEW: Send reply email to contact
exports.sendReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    // Find the contact message
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: Your message to Muhammad Adil`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${contact.name},</h2>
          <p>Thank you for contacting me. Here is my response to your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2f7df4; margin: 20px 0;">
            ${replyText.replace(/\n/g, "<br>")}
          </div>
          <p>Your original message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #999; margin: 20px 0; color: #666;">
            ${contact.message.replace(/\n/g, "<br>")}
          </div>
          <p>Best regards,<br>Muhammad Adil</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update contact status to replied
    contact.status = "replied";
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};

// Add this new function to your existing exports
exports.sendReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    // Find the contact message
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: Your message to Muhammad Adil`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${contact.name},</h2>
          <p>Thank you for contacting me. Here is my response to your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2f7df4; margin: 20px 0;">
            ${replyText.replace(/\n/g, "<br>")}
          </div>
          <p>Your original message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #999; margin: 20px 0; color: #666;">
            ${contact.message.replace(/\n/g, "<br>")}
          </div>
          <p>Best regards,<br>Muhammad Adil</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update contact status to replied
    contact.status = "replied";
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};
