/**
 * パフォーマンス監視とセキュリティ監査ユーティリティ
 */
import React from 'react';

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface SecurityEvent {
  type:
    | 'csp_violation'
    | 'xss_attempt'
    | 'injection_attempt'
    | 'rate_limit_exceeded';
  timestamp: string;
  userAgent: string;
  ip: string;
  details: any;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private securityEvents: SecurityEvent[] = [];

  /**
   * パフォーマンスメトリクスを収集
   */
  collectMetrics(): void {
    if (typeof window === 'undefined') return;

    // Navigation Timing API
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.pageLoadTime =
        navigation.loadEventEnd - navigation.loadEventStart;
    }

    // Paint Timing API
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(
      entry => entry.name === 'first-contentful-paint'
    );
    if (fcp) {
      this.metrics.firstContentfulPaint = fcp.startTime;
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver(list => {
        let clsValue = 0;
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as any;
        this.metrics.firstInputDelay =
          firstEntry.processingStart - firstEntry.startTime;
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  /**
   * メトリクスを取得
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * パフォーマンススコアを計算
   */
  calculateScore(): number {
    const weights = {
      pageLoadTime: 0.2,
      firstContentfulPaint: 0.2,
      largestContentfulPaint: 0.25,
      cumulativeLayoutShift: 0.15,
      firstInputDelay: 0.2,
    };

    let score = 100;

    // 各メトリクスに基づいてスコアを減点
    if (this.metrics.pageLoadTime && this.metrics.pageLoadTime > 3000) {
      score -= 20 * weights.pageLoadTime;
    }
    if (
      this.metrics.firstContentfulPaint &&
      this.metrics.firstContentfulPaint > 1800
    ) {
      score -= 30 * weights.firstContentfulPaint;
    }
    if (
      this.metrics.largestContentfulPaint &&
      this.metrics.largestContentfulPaint > 2500
    ) {
      score -= 40 * weights.largestContentfulPaint;
    }
    if (
      this.metrics.cumulativeLayoutShift &&
      this.metrics.cumulativeLayoutShift > 0.1
    ) {
      score -= 50 * weights.cumulativeLayoutShift;
    }
    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 100) {
      score -= 30 * weights.firstInputDelay;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * セキュリティイベントを記録
   */
  logSecurityEvent(
    event: Omit<SecurityEvent, 'timestamp' | 'userAgent' | 'ip'>
  ): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      ip: 'client-side', // サーバーサイドで取得する必要がある
    };

    this.securityEvents.push(securityEvent);

    // 本番環境では外部セキュリティサービスに送信
    console.warn('Security Event:', securityEvent);

    // ローカルストレージに保存（一時的）
    if (typeof window !== 'undefined') {
      try {
        const existingEvents = JSON.parse(
          localStorage.getItem('security_events') || '[]'
        );
        existingEvents.push(securityEvent);

        // 最新の100件のみ保持
        const recentEvents = existingEvents.slice(-100);
        localStorage.setItem('security_events', JSON.stringify(recentEvents));
      } catch (error) {
        console.error('Failed to store security event:', error);
      }
    }
  }

  /**
   * CSP違反を監視
   */
  monitorCSPViolations(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('securitypolicyviolation', event => {
      this.logSecurityEvent({
        type: 'csp_violation',
        details: {
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
        },
      });
    });
  }

  /**
   * XSS攻撃の兆候を検知
   */
  detectXSSAttempts(): void {
    if (typeof window === 'undefined') return;

    // URL パラメータでのXSS検知
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
      if (this.containsMaliciousContent(value)) {
        this.logSecurityEvent({
          type: 'xss_attempt',
          details: {
            parameter: key,
            value: value,
            source: 'url_parameter',
          },
        });
      }
    }

    // DOM変更監視
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.tagName === 'SCRIPT' &&
                !element.getAttribute('data-allowed')
              ) {
                this.logSecurityEvent({
                  type: 'xss_attempt',
                  details: {
                    tagName: element.tagName,
                    innerHTML: element.innerHTML,
                    source: 'dom_injection',
                  },
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 悪意のあるコンテンツをチェック
   */
  private containsMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /eval\s*\(/gi,
      /document\.write/gi,
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * パフォーマンス監視を開始
   */
  startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // ページロード完了後にメトリクス収集
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectMetrics();
      }, 0);
    });

    // セキュリティ監視を開始
    this.monitorCSPViolations();
    this.detectXSSAttempts();

    // 定期的なメトリクス収集
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // 30秒ごと
  }

  /**
   * レポートを生成
   */
  generateReport(): {
    performance: Partial<PerformanceMetrics> & { score: number };
    security: SecurityEvent[];
  } {
    return {
      performance: {
        ...this.metrics,
        score: this.calculateScore(),
      },
      security: this.securityEvents,
    };
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor();

// 自動開始
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}

/**
 * React コンポーネントのパフォーマンスを測定するヘルパー
 */
export function measureComponentPerformance<T extends React.ComponentType<any>>(
  Component: T,
  name: string
): T {
  const MeasuredComponent = (props: React.ComponentProps<T>) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16) {
        // 16ms以上の場合は警告
        console.warn(
          `Component ${name} took ${renderTime.toFixed(2)}ms to render`
        );
      }
    });

    return React.createElement(Component, props);
  };

  MeasuredComponent.displayName = `Measured(${name})`;
  return MeasuredComponent as T;
}
