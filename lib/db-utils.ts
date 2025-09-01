


// // lib/db-utils.ts
// // OPTIMIZADO: Sistema de retry más eficiente y específico
// export async function executeWithRetry<T>(
//   operation: () => Promise<T>,
//   maxRetries: number = 2, // Reducido de 3 a 2
//   delay: number = 500     // Reducido de 1000ms a 500ms
// ): Promise<T | null> {
  
//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       const result = await operation();
      
//       // OPTIMIZACIÓN 2: Log solo en el primer intento exitoso
//       if (i > 0) {
//         console.log(`✓ Operación exitosa en intento ${i + 1}`);
//       }
      
//       return result;
//     } catch (error: any) {
//       const isLastAttempt = i === maxRetries - 1;
      
//       // OPTIMIZACIÓN 3: Solo hacer retry en errores específicos de conexión
//       const shouldRetry = (
//         error.code === 'P1001' || // Database unreachable
//         error.code === 'P1008' || // Timeout
//         error.code === 'P1017' || // Connection closed
//         error.message?.includes('timeout') ||
//         error.message?.includes('connection')
//       ) && !isLastAttempt;

//       if (shouldRetry) {
//         console.warn(`Reintentando operación (${i + 1}/${maxRetries}): ${error.message}`);
        
//         // OPTIMIZACIÓN 4: Backoff exponencial más agresivo pero con límite
//         const backoffDelay = Math.min(delay * Math.pow(1.5, i), 2000); // Máximo 2 segundos
//         await new Promise(resolve => setTimeout(resolve, backoffDelay));
//         continue;
//       }
      
//       // OPTIMIZACIÓN 5: Logging más específico para debugging
//       if (isLastAttempt) {
//         console.error(`❌ Operación falló después de ${maxRetries} intentos:`, {
//           code: error.code,
//           message: error.message,
//           name: error.name
//         });
//       }
      
//       // OPTIMIZACIÓN 6: No hacer throw, devolver null para manejo graceful
//       return null;
//     }
//   }
  
//   return null;
// }

// // OPTIMIZACIÓN 7: Nueva función para operaciones críticas que SÍ necesitan retry
// export async function executeWithRetryStrict<T>(
//   operation: () => Promise<T>,
//   maxRetries: number = 3,
//   delay: number = 1000
// ): Promise<T> {
  
//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       return await operation();
//     } catch (error: any) {
//       const isLastAttempt = i === maxRetries - 1;
      
//       if (isLastAttempt) {
//         console.error(`❌ Operación crítica falló después de ${maxRetries} intentos:`, error);
//         throw error; // Hacer throw en operaciones críticas
//       }
      
//       console.warn(`Reintentando operación crítica (${i + 1}/${maxRetries}): ${error.message}`);
      
//       const backoffDelay = delay * Math.pow(2, i);
//       await new Promise(resolve => setTimeout(resolve, backoffDelay));
//     }
//   }
  
//   throw new Error('Maximum retries exceeded');
// }

// // OPTIMIZACIÓN 8: Función para verificar salud de la base de datos
// export async function checkDatabaseHealth(): Promise<boolean> {
//   try {
//     // Simple query para verificar conectividad
//     const { prisma } = await import('./prisma');
//     await prisma.$queryRaw`SELECT 1`;
//     return true;
//   } catch (error) {
//     console.error('❌ Database health check failed:', error);
//     return false;
//   }
// }

// // OPTIMIZACIÓN 9: Función para operaciones de dashboard específicamente
// export async function executeDashboardQuery<T>(
//   operation: () => Promise<T>,
//   fallbackValue: T
// ): Promise<T> {
//   try {
//     const result = await operation();
//     return result;
//   } catch (error: any) {
//     console.warn(`Dashboard query failed, using fallback:`, error.message);
//     return fallbackValue;
//   }
// }

// // OPTIMIZACIÓN 10: Cache simple en memoria para consultas frecuentes
// interface CacheEntry<T> {
//   data: T;
//   timestamp: number;
//   ttl: number; // Time to live in milliseconds
// }

// class SimpleCache {
//   private cache = new Map<string, CacheEntry<any>>();

//   set<T>(key: string, data: T, ttlMinutes: number = 5): void {
//     this.cache.set(key, {
//       data,
//       timestamp: Date.now(),
//       ttl: ttlMinutes * 60 * 1000
//     });
//   }

//   get<T>(key: string): T | null {
//     const entry = this.cache.get(key);
    
//     if (!entry) {
//       return null;
//     }

//     // Verificar si ha expirado
//     if (Date.now() - entry.timestamp > entry.ttl) {
//       this.cache.delete(key);
//       return null;
//     }

//     return entry.data;
//   }

//   clear(): void {
//     this.cache.clear();
//   }

//   // Limpiar entradas expiradas
//   cleanup(): void {
//     const now = Date.now();
//     for (const [key, entry] of this.cache.entries()) {
//       if (now - entry.timestamp > entry.ttl) {
//         this.cache.delete(key);
//       }
//     }
//   }
// }

// // OPTIMIZACIÓN 11: Instancia de cache global
// export const dashboardCache = new SimpleCache();

// // Limpiar cache cada 10 minutos
// // Solo ejecutar cleanup en el servidor
// if (typeof window === 'undefined') {
//   setInterval(() => {
//     dashboardCache.cleanup();
//   }, 10 * 60 * 1000);
// }


// lib/db-utils.ts
// OPTIMIZADO para Railway y producción con mejor manejo de conexiones y cache más eficiente

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 300 // Reducido para Railway
): Promise<T | null> {
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      const isLastAttempt = i === maxRetries - 1;
      
      // Errores específicos que justifican retry
      const shouldRetry = (
        error.code === 'P1001' || // Database unreachable
        error.code === 'P1008' || // Timeout
        error.code === 'P1017' || // Connection closed
        error.code === 'P2024' || // Timeout on connection
        error.message?.includes('timeout') ||
        error.message?.includes('connection') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ETIMEDOUT')
      ) && !isLastAttempt;

      if (shouldRetry) {
        console.warn(`Retry ${i + 1}/${maxRetries}: ${error.message}`);
        // Backoff más rápido para Railway
        const backoffDelay = Math.min(delay * Math.pow(1.3, i), 1000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
      
      if (isLastAttempt) {
        console.error(`❌ Falló después de ${maxRetries} intentos:`, {
          code: error.code,
          message: error.message
        });
      }
      
      return null;
    }
  }
  
  return null;
}

// Para operaciones de dashboard con fallback inmediato
export async function executeDashboardQuery<T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    // Timeout más agresivo para dashboard
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Dashboard query timeout')), 5000)
    );
    
    const result = await Promise.race([operation(), timeoutPromise]);
    return result;
  } catch (error: any) {
    console.warn(`Dashboard query fallback usado:`, error.message);
    return fallbackValue;
  }
}

// Cache mejorado para Railway
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number; // Para métricas
}

class OptimizedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Límite de memoria
  private stats = { hits: 0, misses: 0 };

  set<T>(key: string, data: T, ttlMinutes: number = 3): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
      hits: 0
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar expiración
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.data;
  }

  // Remover entradas más antiguas
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses)
    };
  }

  // Limpiar solo entradas expiradas
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instancia global optimizada
export const dashboardCache = new OptimizedCache();

// Función para operaciones paralelas con límite
export async function executeBatchQueries<T>(
  queries: Array<() => Promise<T>>,
  concurrency: number = 3 // Límite para Railway
): Promise<Array<T | null>> {
  const results: Array<T | null> = [];
  
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    const batchPromises = batch.map(query => 
      executeWithRetry(query).catch(() => null)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach(result => {
      results.push(result.status === 'fulfilled' ? result.value : null);
    });
  }
  
  return results;
}

// Función para verificar salud de DB específica para Railway
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { prisma } = await import('./prisma');
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    // Log si es muy lento
    if (duration > 2000) {
      console.warn(`⚠️ DB response slow: ${duration}ms`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ DB health check failed:', error);
    return false;
  }
}

// Función para warming del cache al inicio
export async function warmCache(): Promise<void> {
  console.log('🔥 Warming dashboard cache...');
  
  try {
    const { prisma } = await import('./prisma');
    
    // Pre-cargar estadísticas básicas
    const basicStats = await Promise.allSettled([
      prisma.paciente.count(),
      prisma.cita.count({
        where: {
          fechaHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);
    
    console.log('✅ Cache warmed');
  } catch (error) {
    console.warn('⚠️ Cache warming failed:', error);
  }
}

// Cleanup automático cada 5 minutos (más frecuente para Railway)
if (typeof window === 'undefined') {
  setInterval(() => {
    dashboardCache.cleanup();
    
    // Log stats cada hora
    const stats = dashboardCache.getStats();
    if (stats.hits + stats.misses > 0) {
      console.log(`📊 Cache stats - Hit rate: ${(stats.hitRate * 100).toFixed(1)}%, Size: ${stats.size}`);
    }
  }, 5 * 60 * 1000);
}