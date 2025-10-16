import { getCache, setCache } from '../config/redis.js';

/**
 * Middleware de cache générique
 * @param {string} keyPrefix - Préfixe pour la clé de cache (ex: "tables", "games")
 * @param {number} ttl - Durée de vie du cache en secondes (défaut: 300s = 5min)
 * @param {function} keyGenerator - Fonction optionnelle pour générer la clé de cache
 */
export const cacheMiddleware = (keyPrefix, ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Ignorer le cache pour les méthodes non-GET
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Générer la clé de cache
      let cacheKey;
      if (keyGenerator) {
        cacheKey = keyGenerator(req);
      } else {
        // Clé par défaut : prefix:url:query
        const queryString = JSON.stringify(req.query);
        cacheKey = `${keyPrefix}:${req.originalUrl}:${queryString}`;
      }

      // Vérifier si les données sont en cache
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        console.log(`📦 Cache HIT: ${cacheKey}`);
        return res.status(200).json({
          ...cachedData,
          cached: true,
          cached_at: new Date().toISOString()
        });
      }

      console.log(`📭 Cache MISS: ${cacheKey}`);

      // Intercepter la réponse pour la mettre en cache
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Ne mettre en cache que les réponses réussies
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, data, ttl).catch(err => {
            console.error('Erreur lors de la mise en cache:', err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Erreur dans le middleware de cache:', error);
      // En cas d'erreur Redis, continuer sans cache
      next();
    }
  };
};

/**
 * Middleware de cache pour les listes de tables
 * Cache pendant 5 minutes
 */
export const cacheTablesList = cacheMiddleware('tables:list', 300);

/**
 * Middleware de cache pour une table spécifique
 * Cache pendant 10 minutes
 */
export const cacheTable = cacheMiddleware('tables:detail', 600, (req) => {
  return `tables:detail:${req.params.id}`;
});

/**
 * Middleware de cache pour les parties en cours
 * Cache pendant 30 secondes (données dynamiques)
 */
export const cacheLiveGames = cacheMiddleware('games:live', 30);

/**
 * Middleware de cache pour une partie spécifique
 * Cache pendant 2 minutes
 */
export const cacheGame = cacheMiddleware('games:detail', 120, (req) => {
  return `games:detail:${req.params.id}`;
});

/**
 * Middleware de cache pour la disponibilité d'une table
 * Cache pendant 1 minute
 */
export const cacheTableAvailability = cacheMiddleware('tables:availability', 60, (req) => {
  const { start_time, end_time } = req.query;
  return `tables:availability:${req.params.id}:${start_time}:${end_time}`;
});

/**
 * Fonction helper pour invalider le cache
 * À utiliser dans les controllers après des opérations de modification
 */
export const invalidateCache = async (patterns) => {
  const { deleteCachePattern } = await import('../config/redis.js');
  
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  for (const pattern of patterns) {
    await deleteCachePattern(pattern);
    console.log(`🗑️  Cache invalidé: ${pattern}`);
  }
};

