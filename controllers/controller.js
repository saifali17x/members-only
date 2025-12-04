import * as queries from "../db/queries.js";
import bcrypt from "bcrypt";

// HOME CONTROLLER
export const getHome = async (req, res) => {
  try {
    const stats = await queries.getDashboardStats();
    const messages = req.user?.is_member
      ? await queries.getAllMessagesWithUsers()
      : await queries.getAllMessages();

    res.render("index", {
      stats,
      messages: messages.slice(0, 10),
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(500).render("error", { error: "Failed to load home page" });
  }
};

// AUTH CONTROLLERS
export const getSignup = (req, res) => {
  res.render("auth/signup");
};

export const postSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, isAdmin } =
      req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.render("auth/signup", {
        error: "Passwords do not match",
        formData: req.body,
      });
    }

    // Check if email already exists
    const exists = await queries.emailExists(email);
    if (exists) {
      return res.render("auth/signup", {
        error: "Email already registered",
        formData: req.body,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await queries.createUser(
      firstName,
      lastName,
      email,
      hashedPassword,
      isAdmin === "on"
    );

    res.redirect("/login");
  } catch (error) {
    console.error("Error signing up:", error);
    res.render("auth/signup", {
      error: "Failed to create account",
      formData: req.body,
    });
  }
};

export const getLogin = (req, res) => {
  res.render("auth/login");
};

export const getLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).render("error", { error: "Failed to logout" });
    }
    res.redirect("/");
  });
};

// MEMBERSHIP CONTROLLER
export const getJoinClub = (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  if (req.user.is_member) {
    return res.redirect("/");
  }
  res.render("membership/join");
};

export const postJoinClub = async (req, res) => {
  try {
    const { passcode } = req.body;
    const SECRET_PASSCODE = process.env.MEMBERSHIP_PASSCODE || "secret123";

    if (passcode !== SECRET_PASSCODE) {
      return res.render("membership/join", {
        error: "Incorrect passcode",
      });
    }

    await queries.updateMembershipStatus(req.user.user_id, true);
    res.redirect("/");
  } catch (error) {
    console.error("Error joining club:", error);
    res.render("membership/join", {
      error: "Failed to join club",
    });
  }
};

// MESSAGE CONTROLLERS
export const getAllMessages = async (req, res) => {
  try {
    const messages = req.user?.is_member
      ? await queries.getAllMessagesWithUsers()
      : await queries.getAllMessages();

    res.render("messages/list", {
      messages,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).render("error", { error: "Failed to fetch messages" });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const message = await queries.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).render("error", { error: "Message not found" });
    }

    // Hide author info if user is not a member
    if (!req.user?.is_member) {
      delete message.first_name;
      delete message.last_name;
      delete message.email;
      delete message.user_id;
    }

    res.render("messages/detail", {
      message,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).render("error", { error: "Failed to fetch message" });
  }
};

export const getCreateMessage = (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render("messages/create");
};

export const createMessage = async (req, res) => {
  try {
    const { title, text } = req.body;
    await queries.createMessage(title, text, req.user.user_id);
    res.redirect("/messages");
  } catch (error) {
    console.error("Error creating message:", error);
    res.render("messages/create", {
      error: "Failed to create message",
      formData: req.body,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).render("error", {
        error: "You don't have permission to delete messages",
      });
    }

    await queries.deleteMessage(req.params.id);
    res.redirect("/messages");
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).render("error", { error: "Failed to delete message" });
  }
};

// USER PROFILE CONTROLLER
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const user = await queries.findUserById(req.user.user_id);
    const userMessages = await queries.getMessagesByUserId(req.user.user_id);
    const messageCount = await queries.getUserMessageCount(req.user.user_id);

    res.render("users/profile", {
      user,
      messages: userMessages,
      messageCount,
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).render("error", { error: "Failed to load profile" });
  }
};

// ADMIN CONTROLLERS
export const getAdminDashboard = async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).render("error", {
        error: "You don't have admin privileges",
      });
    }

    const stats = await queries.getDashboardStats();
    const users = await queries.getAllUsers();
    const messages = await queries.getAllMessagesWithUsers();

    res.render("admin/dashboard", {
      stats,
      users,
      messages: messages.slice(0, 10),
    });
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    res.status(500).render("error", {
      error: "Failed to load admin dashboard",
    });
  }
};
