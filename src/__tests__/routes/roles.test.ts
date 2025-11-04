import request from 'supertest';
import { createTestApp } from '../testApp';
import Role from '@models/Role';

jest.mock('@models/Role');

const app = createTestApp();

describe('Roles Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /roles', () => {
    it('should return all roles for a guild', async () => {
      const mockRoles = [
        { _id: 'role1', guild_id: 'guild123', name: 'Role 1', description: 'Desc 1', role: 'role_id1', emote: '🎮' },
        { _id: 'role2', guild_id: 'guild123', name: 'Role 2', description: 'Desc 2', role: 'role_id2', emote: '🎨' },
      ];

      (Role.find as jest.Mock) = jest.fn().mockResolvedValue(mockRoles);

      const response = await request(app)
        .get('/roles')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ guild_id: 'guild123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRoles);
    });

    it('should return 404 when no roles found', async () => {
      (Role.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/roles')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ guild_id: 'guild123' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No roles found');
    });
  });

  describe('POST /roles/add', () => {
    it('should create a new role', async () => {
      const mockRole = {
        guild_id: 'guild123',
        name: 'New Role',
        description: 'New Description',
        role: 'role_id',
        emote: '🎮',
        save: jest.fn().mockResolvedValue(true),
      };

      (Role as any).mockImplementation(() => mockRole);

      const response = await request(app)
        .post('/roles/add')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          guild_id: 'guild123',
          name: 'New Role',
          description: 'New Description',
          role: 'role_id',
          emote: '🎮',
        });

      expect(response.status).toBe(201);
      expect(mockRole.save).toHaveBeenCalled();
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/roles/add')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          guild_id: 'guild123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /roles/update', () => {
    it('should update a role', async () => {
      const mockRole = {
        _id: '507f1f77bcf86cd799439011',
        guild_id: 'guild123',
        name: 'Updated Role',
        description: 'Updated Description',
        role: 'role_id',
        emote: '🎨',
      };

      (Role.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(mockRole);

      const response = await request(app)
        .put('/roles/update')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          id: '507f1f77bcf86cd799439011',
          guild_id: 'guild123',
          name: 'Updated Role',
          description: 'Updated Description',
          role: 'role_id',
          emote: '🎨',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRole);
    });

    it('should return 400 with invalid id', async () => {
      const response = await request(app)
        .put('/roles/update')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          id: 'invalid-id',
          guild_id: 'guild123',
          name: 'Updated Role',
          description: 'Updated Description',
          role: 'role_id',
          emote: '🎨',
        });

      expect(response.status).toBe(400);
    });
  });
});
