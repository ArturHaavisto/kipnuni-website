import { Request, Response } from 'express';
import { User } from '../models';

export const userController = {
  // Get all users
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  },

  // Get user by ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
  },

  // Create new user
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      const user = new User({ email, name });
      await user.save();
      res.status(201).json({ success: true, data: user });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        res.status(400).json({ success: false, error: 'Email already exists' });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  },

  // Update user
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { email, name },
        { new: true, runValidators: true }
      );
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }
  },

  // Delete user
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  },
};
