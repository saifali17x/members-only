import pool from "./pool.js";

export const createUser = async (
  firstName,
  lastName,
  email,
  hashedPassword,
  isAdmin = false
) => {
  const { rows } = await pool.query(
    `
    INSERT INTO users (first_name, last_name, email, password, is_admin)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING user_id, first_name, last_name, email, is_member, is_admin, joined_date
  `,
    [firstName, lastName, email, hashedPassword, isAdmin]
  );
  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return rows[0];
};

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT user_id, first_name, last_name, email, is_member, is_admin, joined_date 
    FROM users 
    WHERE user_id = $1
  `,
    [id]
  );
  return rows[0];
};

export const updateMembershipStatus = async (userId, isMember = true) => {
  const { rows } = await pool.query(
    `
    UPDATE users 
    SET is_member = $1
    WHERE user_id = $2
    RETURNING user_id, first_name, last_name, email, is_member, is_admin
  `,
    [isMember, userId]
  );
  return rows[0];
};

export const updateAdminStatus = async (userId, isAdmin = true) => {
  const { rows } = await pool.query(
    `
    UPDATE users 
    SET is_admin = $1
    WHERE user_id = $2
    RETURNING user_id, first_name, last_name, email, is_member, is_admin
  `,
    [isAdmin, userId]
  );
  return rows[0];
};

export const getAllUsers = async () => {
  const { rows } = await pool.query(
    `
    SELECT user_id, first_name, last_name, email, is_member, is_admin, joined_date 
    FROM users 
    ORDER BY joined_date DESC
  `
  );
  return rows;
};

export const emailExists = async (email) => {
  const { rows } = await pool.query(
    "SELECT COUNT(*) FROM users WHERE email = $1",
    [email]
  );
  return parseInt(rows[0].count) > 0;
};

export const createMessage = async (title, text, userId) => {
  const { rows } = await pool.query(
    `
    INSERT INTO messages (title, text, user_id)
    VALUES ($1, $2, $3)
    RETURNING message_id, title, text, user_id, created_at
  `,
    [title, text, userId]
  );
  return rows[0];
};

export const getAllMessagesWithUsers = async () => {
  const { rows } = await pool.query(`
    SELECT 
      m.message_id,
      m.title,
      m.text,
      m.created_at,
      m.user_id,
      u.first_name,
      u.last_name,
      u.email
    FROM messages m
    JOIN users u ON m.user_id = u.user_id
    ORDER BY m.created_at DESC
  `);
  return rows;
};

export const getAllMessages = async () => {
  const { rows } = await pool.query(`
    SELECT 
      m.message_id,
      m.title,
      m.text,
      m.created_at
    FROM messages m
    ORDER BY m.created_at DESC
  `);
  return rows;
};

export const getMessageById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT 
      m.message_id,
      m.title,
      m.text,
      m.created_at,
      m.user_id,
      u.first_name,
      u.last_name,
      u.email
    FROM messages m
    JOIN users u ON m.user_id = u.user_id
    WHERE m.message_id = $1
  `,
    [id]
  );
  return rows[0];
};

export const getMessagesByUserId = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      message_id,
      title,
      text,
      created_at
    FROM messages
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,
    [userId]
  );
  return rows;
};

export const deleteMessage = async (messageId) => {
  await pool.query("DELETE FROM messages WHERE message_id = $1", [messageId]);
};

export const verifyMessageOwnership = async (messageId, userId) => {
  const { rows } = await pool.query(
    "SELECT user_id FROM messages WHERE message_id = $1",
    [messageId]
  );
  return rows[0]?.user_id === userId;
};

export const getUserMessageCount = async (userId) => {
  const { rows } = await pool.query(
    "SELECT COUNT(*) FROM messages WHERE user_id = $1",
    [userId]
  );
  return parseInt(rows[0].count);
};

export const getDashboardStats = async () => {
  const totalUsers = await pool.query("SELECT COUNT(*) as count FROM users");
  const totalMembers = await pool.query(
    "SELECT COUNT(*) as count FROM users WHERE is_member = true"
  );
  const totalMessages = await pool.query(
    "SELECT COUNT(*) as count FROM messages"
  );

  return {
    totalUsers: totalUsers.rows[0].count,
    totalMembers: totalMembers.rows[0].count,
    totalMessages: totalMessages.rows[0].count,
  };
};
