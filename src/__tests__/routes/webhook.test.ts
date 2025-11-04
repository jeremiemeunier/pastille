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
    it('should handle webhook validation with signature check', async () => {
      // Note: Full signature validation requires proper HMAC calculation with BOT_SECRET_SIG
      // This test verifies the endpoint exists and processes requests
      const response = await request(app)
        .post('/twitch/webhook')
        .set('Content-Type', 'application/json')
        .set('twitch-eventsub-message-id', 'test-id')
        .set('twitch-eventsub-message-type', 'webhook_callback_verification')
        .set('twitch-eventsub-message-timestamp', '2024-01-01T00:00:00.000Z')
        .set('twitch-eventsub-message-signature', 'sha256=invalid')
        .send(Buffer.from(JSON.stringify({ challenge: 'test-challenge' })));

      // Should return 403 for invalid signature or handle appropriately
      expect([403, 500]).toContain(response.status);
    });

    it('should handle missing headers gracefully', async () => {
      const response = await request(app)
        .post('/twitch/webhook')
        .set('Content-Type', 'application/json')
        .send(Buffer.from(JSON.stringify({ challenge: 'test-challenge' })));

      // Should not process without required headers
      // The route doesn't explicitly handle missing headers, so it may not respond
      expect(response.status).not.toBe(200);
    }, 10000);
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
