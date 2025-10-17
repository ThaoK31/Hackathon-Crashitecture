import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

// Créer le client Redis
const redis = new Redis(redisConfig);

// Gestion des événements
redis.on('connect', () => {
  console.log('Connexion à Redis établie');
});

redis.on('ready', () => {
  console.log('Redis prêt à recevoir des commandes');
});

redis.on('error', (err) => {
  console.error('Erreur Redis:', err.message);
});

redis.on('close', () => {
  console.log('Connexion Redis fermée');
});

redis.on('reconnecting', () => {
  console.log('Reconnexion à Redis...');
});

// Fonction helper pour get avec parsing JSON automatique
export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Erreur lors de la lecture du cache (${key}):`, error);
    return null;
  }
};

// Fonction helper pour set avec stringify JSON automatique
export const setCache = async (key, value, ttl = 300) => {
  try {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, stringValue);
    } else {
      await redis.set(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans le cache (${key}):`, error);
    return false;
  }
};

// Fonction helper pour delete
export const deleteCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du cache (${key}):`, error);
    return false;
  }
};

// Fonction helper pour delete pattern (ex: "tables:*")
export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du pattern (${pattern}):`, error);
    return false;
  }
};

// Fonction helper pour vérifier la connexion
export const pingRedis = async () => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
};

export default redis;

