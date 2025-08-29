// lib/db-utils.ts
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.warn(`Intento ${i + 1}/${maxRetries} falló:`, error.message);
      
      if (error.code === 'P1001' && i < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
      
      console.error(`Error después de ${i + 1} intentos:`, error.message);
      return null;
    }
  }
  return null;
}