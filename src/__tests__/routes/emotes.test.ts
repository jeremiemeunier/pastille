import request from 'supertest';
import { createTestApp } from '../testApp';
import Emote from '@models/Emote';

jest.mock('@models/Emote');

const app = createTestApp();

describe('Emotes Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /emotes', () => {
    it('should return emote by letter', async () => {
      const mockEmote = { _id: 'emote1', letter: 'A', emote: '🅰️' };

      (Emote.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockEmote);

      const response = await request(app)
        .get('/emotes')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ letter: 'A' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockEmote);
    });

    it('should return 404 when emote not found', async () => {
      (Emote.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/emotes')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ letter: 'Z' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No emotes');
    });
  });

  describe('GET /emotes/all', () => {
    it('should return all emotes', async () => {
      const mockEmotes = [
        { _id: 'emote1', letter: 'A', emote: '🅰️' },
        { _id: 'emote2', letter: 'B', emote: '🅱️' },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockEmotes),
      };

      (Emote.find as jest.Mock) = jest.fn().mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/emotes/all')
        .set('pastille_botid', process.env.BOT_ID!);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockEmotes);
    });

    it('should return limited emotes', async () => {
      const mockEmotes = [{ _id: 'emote1', letter: 'A', emote: '🅰️' }];

      const mockQuery = {
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockEmotes),
        }),
      };

      (Emote.find as jest.Mock) = jest.fn().mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/emotes/all')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ limit: '1' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockEmotes);
    });

    it('should return 404 when no emotes found', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };

      (Emote.find as jest.Mock) = jest.fn().mockReturnValue(mockQuery);

      const response = await request(app)
        .get('/emotes/all')
        .set('pastille_botid', process.env.BOT_ID!);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No letters found');
    });
  });

  describe('POST /emotes/mass', () => {
    it('should create multiple emotes', async () => {
      const mockEmote = {
        save: jest.fn().mockResolvedValue(true),
      };

      (Emote as any).mockImplementation(() => mockEmote);

      const response = await request(app)
        .post('/emotes/mass')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          emotes: [
            { letter: 'A', emote: '🅰️' },
            { letter: 'B', emote: '🅱️' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Emotes added');
    });
  });
});
