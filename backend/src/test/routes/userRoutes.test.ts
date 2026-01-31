import request from 'supertest';
import { createApp } from '../../app';
import { User } from '../../models';

const app = createApp();

describe('User Routes', () => {
  describe('GET /api/users', () => {
    it('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual([]);
    });

    it('should return users when they exist', async () => {
      await User.create({ email: 'test@example.com', name: 'Test User' });

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = { email: 'new@example.com', name: 'New User' };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('name', userData.name);
    });

    it('should return 400 when email is invalid', async () => {
      const userData = { email: 'invalid-email', name: 'Test User' };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 when name is empty', async () => {
      const userData = { email: 'test@example.com', name: '' };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when email already exists', async () => {
      await User.create({ email: 'duplicate@example.com', name: 'First User' });

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'duplicate@example.com', name: 'Second User' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const user = await User.create({ email: 'find@example.com', name: 'Find Me' });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('email', 'find@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with valid data', async () => {
      const user = await User.create({ email: 'update@example.com', name: 'Original' });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send({ email: 'updated@example.com', name: 'Updated' })
        .expect(200);

      expect(response.body.data).toHaveProperty('email', 'updated@example.com');
      expect(response.body.data).toHaveProperty('name', 'Updated');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const user = await User.create({ email: 'delete@example.com', name: 'Delete Me' });

      await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(200);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });
});
