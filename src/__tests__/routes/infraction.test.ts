import request from 'supertest';
import { createTestApp } from '../testApp';
import Infraction from '@models/Infraction';

// Mock the Infraction model
jest.mock('@models/Infraction');

const app = createTestApp();

describe('Infraction Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /infraction', () => {
    it('should create a new infraction with valid authorization', async () => {
      const mockInfraction = {
        user_id: 'user123',
        guild_id: 'guild123',
        warn: {
          reason: 'Test reason',
          date: new Date(),
        },
        save: jest.fn().mockResolvedValue(true),
      };

      (Infraction as any).mockImplementation(() => mockInfraction);

      const response = await request(app)
        .post('/infraction')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          user_id: 'user123',
          guild_id: 'guild123',
          reason: 'Test reason',
          date: new Date(),
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('New infraction items created');
      expect(mockInfraction.save).toHaveBeenCalled();
    });

    it('should return 403 without valid authorization', async () => {
      const response = await request(app)
        .post('/infraction')
        .send({
          user_id: 'user123',
          guild_id: 'guild123',
          reason: 'Test reason',
          date: new Date(),
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Not authorized');
    });
  });

  describe('GET /infraction/all', () => {
    it('should return count of infractions', async () => {
      (Infraction.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(5);

      const response = await request(app)
        .get('/infraction/all')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({
          user_id: 'user123',
          guild_id: 'guild123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Infractions find');
      expect(response.body.count).toBe(5);
    });

    it('should return 403 without valid authorization', async () => {
      const response = await request(app)
        .get('/infraction/all')
        .query({
          user_id: 'user123',
          guild_id: 'guild123',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Not authorized');
    });
  });
});
