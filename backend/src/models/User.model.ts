import { query } from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'game_master' | 'player';
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  role: 'game_master' | 'player';
  name: string;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data: CreateUserData): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.email, data.password_hash, data.role, data.name]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update user
   */
  static async update(id: string, data: Partial<CreateUserData>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    return result.rows.length > 0;
  }
}
