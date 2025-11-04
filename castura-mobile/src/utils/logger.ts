// src/utils/logger.ts
import { Platform } from 'react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  platform: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const platform = Platform.OS;
    
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp,
      platform,
    };

    // Add to internal logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Format for console
    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '🚨',
    }[level];

    const formattedMessage = `${emoji} [${timestamp}] [${platform.toUpperCase()}] ${message}`;
    
    return formattedMessage;
  }

  debug(message: string, data?: any) {
    if (__DEV__) {
      const formatted = this.formatMessage('debug', message, data);
      console.log(formatted, data || '');
    }
  }

  info(message: string, data?: any) {
    const formatted = this.formatMessage('info', message, data);
    console.log(formatted, data || '');
  }

  warn(message: string, data?: any) {
    const formatted = this.formatMessage('warn', message, data);
    console.warn(formatted, data || '');
  }

  error(message: string, error?: any) {
    const formatted = this.formatMessage('error', message, error);
    console.error(formatted, error || '');
    
    // Log error details
    if (error instanceof Error) {
      console.error('🚨 Error Stack:', error.stack);
    }
  }

  // Bundle-related logging
  bundle(message: string, data?: any) {
    this.info(`📦 Bundle: ${message}`, data);
  }

  // Navigation logging
  navigation(message: string, data?: any) {
    this.info(`🧭 Navigation: ${message}`, data);
  }

  // API/Network logging
  network(message: string, data?: any) {
    this.info(`🌐 Network: ${message}`, data);
  }

  // Theme logging
  theme(message: string, data?: any) {
    this.info(`🎨 Theme: ${message}`, data);
  }

  // Get recent logs
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.clear();
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
const logger = new Logger();

// Global error handler for unhandled errors
const originalError = console.error;
console.error = (...args) => {
  logger.error('Unhandled Console Error', args);
  originalError(...args);
};

export default logger;






