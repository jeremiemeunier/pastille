import request from 'supertest';
import { createTestApp } from '../testApp';
import Streamers from '@models/Streamers';

jest.mock('@models/Streamers');

const app = createTestApp();

describe('Webhook Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /twitch/webhook', () => {
    it('should return 403 for invalid signature', async () => {
      const response = await request(app)
        .post('/twitch/webhook')
        .set('Content-Type', 'application/json')
        .set('twitch-eventsub-message-id', 'test-id')
        .set('twitch-eventsub-message-type', 'webhook_callback_verification')
        .set('twitch-eventsub-message-timestamp', new Date().toISOString())
        .set('twitch-eventsub-message-signature', 'sha256=invalid')
        .send(JSON.stringify({ challenge: 'test-challenge' }));

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid signature');
    });

    it('should handle missing headers', async () => {
      const response = await request(app)
        .post('/twitch/webhook')
        .set('Content-Type', 'application/json')
        .send({ challenge: 'test-challenge' });

      // Should not process without required headers
      expect(response.status).not.toBe(200);
    });
  });

  describe('POST /discord/webhook', () => {
    it('should return 401 for missing signature', async () => {
      const response = await request(app)
        .post('/discord/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 1 }));

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Bad request signature');
    });

    it('should return 401 for invalid signature', async () => {
      const response = await request(app)
        .post('/discord/webhook')
        .set('Content-Type', 'application/json')
        .set('X-Signature-Ed25519', 'invalid-signature')
        .set('X-Signature-Timestamp', new Date().toISOString())
        .send(JSON.stringify({ type: 1 }));

      expect(response.status).toBe(401);
    });
  });
});
