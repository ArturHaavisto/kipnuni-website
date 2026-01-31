import { User } from '../../models';

describe('User Model', () => {
  describe('Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const user = new User(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should fail without required email', async () => {
      const user = new User({ name: 'Test User' });
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail without required name', async () => {
      const user = new User({ email: 'test@example.com' });
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should lowercase and trim email', async () => {
      const user = new User({ email: '  TEST@EXAMPLE.COM  ', name: 'Test' });
      await user.save();

      expect(user.email).toBe('test@example.com');
    });

    it('should trim name', async () => {
      const user = new User({ email: 'test@example.com', name: '  Test User  ' });
      await user.save();

      expect(user.name).toBe('Test User');
    });

    it('should enforce unique email', async () => {
      await User.create({ email: 'unique@example.com', name: 'First' });
      const duplicate = new User({ email: 'unique@example.com', name: 'Second' });

      await expect(duplicate.save()).rejects.toThrow();
    });
  });
});
