// src/utils/debug.ts

/**
 * Force print stack trace to console
 */
export function forceStackTrace(message?: string) {
  const stack = new Error().stack;
  console.error('🔍 Forced Stack Trace:', message || 'Stack trace requested');
  console.error('🔍 Stack:', stack);
  return stack;
}

/**
 * Enhanced error logging with stack trace
 */
export function logError(error: Error | string, context?: string) {
  if (typeof error === 'string') {
    console.error('🚨 Error:', error);
    if (context) {
      console.error('🚨 Context:', context);
    }
    const stack = new Error().stack;
    console.error('🚨 Stack Trace:', stack);
  } else {
    console.error('🚨 Error:', error);
    console.error('🚨 Error Message:', error.message);
    console.error('🚨 Error Name:', error.name);
    console.error('🚨 Error Stack:', error.stack);
    if (context) {
      console.error('🚨 Context:', context);
    }
  }
}

/**
 * Debug log with stack trace
 */
export function debugLog(message: string, data?: any) {
  console.log('🔍 Debug:', message);
  if (data !== undefined) {
    console.log('🔍 Data:', data);
  }
  const stack = new Error().stack;
  console.log('🔍 Stack:', stack);
}

/**
 * Performance timing with stack trace
 */
export function timeLog(label: string, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`⏱️ ${label}: ${duration}ms`);
  const stack = new Error().stack;
  console.log('⏱️ Stack:', stack);
}

/**
 * Create a timer for performance measurement
 */
export function createTimer(label: string) {
  const startTime = Date.now();
  return () => timeLog(label, startTime);
}






