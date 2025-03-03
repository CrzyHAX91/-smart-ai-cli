import process from 'process';
import os from 'os';
import { EventEmitter } from 'events';

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      startTime: Date.now(),
      totalQueries: 0,
      totalResponseTime: 0,
      memoryUsage: {
        max: 0,
        current: 0
      },
      cpuUsage: {
        user: 0,
        system: 0
      }
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor memory usage
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      this.metrics.memoryUsage.current = memoryUsage.rss / 1024 / 1024; // MB
      this.metrics.memoryUsage.max = Math.max(
        this.metrics.memoryUsage.max,
        this.metrics.memoryUsage.current
      );
    }, 1000);

    // Monitor CPU usage
    const startUsage = process.cpuUsage();
    setInterval(() => {
      const usage = process.cpuUsage(startUsage);
      this.metrics.cpuUsage.user = usage.user / 1000; // ms
      this.metrics.cpuUsage.system = usage.system / 1000; // ms
    }, 5000);
  }

  trackQuery(startTime) {
    const duration = Date.now() - startTime;
    this.metrics.totalQueries++;
    this.metrics.totalResponseTime += duration;
    this.emit('queryCompleted', duration);
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      averageResponseTime: this.metrics.totalQueries > 0 ?
        this.metrics.totalResponseTime / this.metrics.totalQueries : 0,
      loadAverage: os.loadavg(),
      freeMemory: os.freemem() / 1024 / 1024, // MB
      totalMemory: os.totalmem() / 1024 / 1024 // MB
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
