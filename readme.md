pulse-fetch 💓

The World's First "Empathic" Prefetching Library. > Prevent "Thundering Herd" DDoS attacks on your own API by making your frontend aware of your backend's health.

Most prefetching libraries are selfish: they download data whenever the user hovers a link, regardless of whether your server is currently dying under load. pulse-fetch solves this by establishing a real-time feedback loop between server stress and client greed.

📦 Installation

npm install pulse-fetch


🚀 Usage

1. Node.js (Express) Middleware

Injects the health score into every response headers (X-Server-Pulse).

const express = require('express');
const { PulseServer } = require('pulse-fetch');

const app = express();
const pulse = new PulseServer();

// Add middleware globally
app.use(pulse.middleware());


2. React Hook

Automatically disables prefetching components when the server is stressed.

import { usePulse } from 'pulse-fetch/react';

const SmartLink = ({ url, children }) => {
  const strategy = usePulse(); // 'aggressive' | 'conservative' | 'blocked'

  const handleHover = () => {
    if (strategy === 'aggressive') {
      console.log("Prefetching data...");
      fetch(url);
    }
  };

  return (
    <a href={url} onMouseEnter={handleHover} style={{ opacity: strategy === 'blocked' ? 0.5 : 1 }}>
      {children}
    </a>
  );
};


3. Angular Service

Stream server health state to your components.

@Component({ ... })
export class DashboardComponent {
  constructor(private pulse: PulseAngularService) {
    this.pulse.strategy$.subscribe(strategy => {
      if (strategy === 'blocked') {
        this.disableBackgroundSync();
      }
    });
  }
}


🌡️ Strategies

Server Load

Pulse Score

Client Strategy

Behavior

Low

0.0 - 0.5

aggressive

Prefetch on Link Hover

Medium

0.5 - 0.8

conservative

Prefetch only on MouseDown / Focus

High

0.8 - 1.0

blocked

No Prefetching. Background syncs paused.

License

MIT