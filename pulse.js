/**
 * pulse-fetch v1.0.0
 * A universal library for server-aware adaptive prefetching.
 * Supports: Node.js (Express), React, and Angular patterns.
 */

// ==========================================
// PART 1: NODE.JS MIDDLEWARE (Server Side)
// ==========================================
class PulseServer {
  constructor(options = {}) {
    this.options = {
      endpoint: '/api/pulse',
      ...options
    };
    // In a real environment, we would require('os') here
    this.currentLoad = 0; 
  }

  // Simulates getting CPU load (0.0 to 1.0)
  _getLoad() {
    // In production: return os.loadavg()[0] / os.cpus().length;
    return this.currentLoad; 
  }

  // Express Middleware
  middleware() {
    return (req, res, next) => {
      const load = this._getLoad();
      // Inject the Pulse header into every response
      res.setHeader('X-Server-Pulse', load.toFixed(2));
      
      // If load is critical (>0.9), optionally reject non-essential prefetch requests
      if (load > 0.9 && req.headers['x-purpose'] === 'prefetch') {
        return res.status(503).send('Server Busy - Prefetch Rejected');
      }
      next();
    };
  }

  // Method to manually update load (for the simulation/demo)
  setMockLoad(load) {
    this.currentLoad = Math.max(0, Math.min(1, load));
  }
}

// ==========================================
// PART 2: CLIENT ADAPTER (Browser Side)
// ==========================================
class PulseClient {
  constructor(options = {}) {
    this.thresholds = {
      aggressive: 0.5, // Below this: Prefetch on Hover
      conservative: 0.8 // Below this: Prefetch only on Interaction
    };
    this.currentPulse = 0; // 0.0 (Idle) to 1.0 (Meltdown)
    this.listeners = [];
    
    // Auto-detect pulse from any fetch response
    this._interceptFetch();
  }

  _interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      this._updatePulseFromHeader(response);
      return response;
    };
  }

  _updatePulseFromHeader(response) {
    const headerVal = response.headers.get('X-Server-Pulse');
    if (headerVal) {
      this.currentPulse = parseFloat(headerVal);
      this._notifyListeners();
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  _notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentPulse));
  }

  /**
   * DECISION ENGINE
   * Returns 'aggressive', 'conservative', or 'blocked'
   */
  getStrategy() {
    if (this.currentPulse < this.thresholds.aggressive) return 'aggressive';
    if (this.currentPulse < this.thresholds.conservative) return 'conservative';
    return 'blocked';
  }

  // The main public method for checking if we should prefetch a URL
  shouldPrefetch() {
    const strategy = this.getStrategy();
    return strategy !== 'blocked';
  }
}

// ==========================================
// PART 3: FRAMEWORK BINDINGS (Mockups)
// ==========================================

// React Hook
const usePulse = (clientInstance) => {
  // In real React code:
  // const [strategy, setStrategy] = useState(clientInstance.getStrategy());
  // useEffect(() => clientInstance.subscribe(() => setStrategy(clientInstance.getStrategy())), []);
  // return strategy;
  return "React Hook Placeholder";
};

// Angular Service
class PulseAngularService {
  constructor() {
    this.client = new PulseClient();
  }
  // In real Angular: returns an Observable<string>
  get strategy$() {
    return "Observable Placeholder";
  }
}

// Export for consumption
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PulseServer, PulseClient, usePulse, PulseAngularService };
} else {
  // Browser global
  window.PulseFetch = { PulseServer, PulseClient };
}