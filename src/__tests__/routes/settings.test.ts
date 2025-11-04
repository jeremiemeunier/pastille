import request from 'supertest';
import { createTestApp } from '../testApp';
import Setting from '@models/Setting';

jest.mock('@models/Setting');

const app = createTestApp();

describe('Settings Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /settings', () => {
    it('should return settings for a guild', async () => {
      const mockSettings = {
        _id: 'settings1',
        guild_id: 'guild123',
        premium: false,
        premium_end: null,
        options: {
          bang: '!',
          color: 'E7BB41',
          channels: {
            announce: 'annonce',
            help: 'support',
            voiceText: 'voix-avec-les-mains',
            screenshots: 'screenshots',
          },
        },
        moderation: {
          sharing: false,
          channels: {
            alert: null,
            report: null,
            automod: null,
          },
          limit: {
            emoji: -1,
            mention: -1,
            link: -1,
            invite: -1,
          },
          imune: [],
          roles: {
            muted: null,
            rule: null,
            staff: null,
          },
          sanctions: {
            low: { duration: 5, unit: 'm' },
            medium: { duration: 30, unit: 'm' },
            hight: { duration: 1, unit: 'h' },
          },
        },
      };

      (Setting.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockSettings);

      const response = await request(app)
        .get('/settings')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ guild_id: 'guild123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Settings found');
      expect(response.body.data).toEqual(mockSettings);
    });

    it('should return 404 when no settings found', async () => {
      (Setting.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/settings')
        .set('pastille_botid', process.env.BOT_ID!)
        .query({ guild_id: 'guild123' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No settings found');
    });
  });

  describe('POST /settings/add', () => {
    it('should create new settings', async () => {
      const mockSettings = {
        guild_id: 'guild123',
        premium: false,
        options: {
          bang: '!',
          color: 'E7BB41',
          channels: {
            announce: 'annonce',
            help: 'support',
            voiceText: 'voix-avec-les-mains',
            screenshots: 'screenshots',
          },
        },
        moderation: {
          sharing: false,
          channels: {
            alert: null,
            report: null,
            automod: null,
          },
          limit: {
            emoji: -1,
            mention: -1,
            link: -1,
            invite: -1,
          },
          imune: [],
          roles: {
            muted: null,
            rule: null,
            staff: null,
          },
          sanctions: {
            low: { duration: 5, unit: 'm' },
            medium: { duration: 30, unit: 'm' },
            hight: { duration: 1, unit: 'h' },
          },
        },
        save: jest.fn().mockResolvedValue(true),
      };

      (Setting as any).mockImplementation(() => mockSettings);

      const response = await request(app)
        .post('/settings/add')
        .set('pastille_botid', process.env.BOT_ID!)
        .send({
          guild_id: 'guild123',
          premium: false,
          premium_end: null,
          options: {
            bang: '!',
            color: 'E7BB41',
            channels: {
              announce: 'annonce',
              help: 'support',
              voiceText: 'voix-avec-les-mains',
              screenshots: 'screenshots',
            },
          },
          moderation: {
            sharing: false,
            channels: {
              alert: null,
              report: null,
              automod: null,
            },
            limit: {
              emoji: -1,
              mention: -1,
              link: -1,
              invite: -1,
            },
            imune: [],
            roles: {
              muted: null,
              rule: null,
              staff: null,
            },
            sanctions: {
              low: { duration: 5, unit: 'm' },
              medium: { duration: 30, unit: 'm' },
              hight: { duration: 1, unit: 'h' },
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('New settings registered');
      expect(mockSettings.save).toHaveBeenCalled();
    });
  });
});
