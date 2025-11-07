# 🧠 Real-Time Analytics Dashboard  
**Backend Engineering Final Project**

---

## 📍 1. Scenario Chosen and Motivation  

**Scenario 2: Real-Time Analytics Dashboard**

This project simulates a monitoring system similar to **Datadog** or **Grafana**, where thousands of servers send metrics continuously, and engineers view real-time dashboards.  

We chose this scenario because:
- It involves **core backend engineering concepts** such as data ingestion, real-time streaming, protocol comparison, and load distribution.  
- It was **simple and practical** for us as students working on our **first backend project**.  
- It allowed us to explore and compare two real backend design approaches — push-based and streaming-based.

---

## ⚙️ 2. Tech Stack Used  

| Category | Technology |
|-----------|-------------|
| **Framework** | Laravel 12 |
| **Language** | PHP 8.2 |
| **Database** | MySQL |
| **Cache / Message Broker** | Redis *(used in Implementation 2)* |
| **Real-Time Communication** | Laravel Reverb (WebSockets) |
| **Reverse Proxy / HTTP/2** | Caddy |
| **Environment** | Local setup *(no Docker containerization used)* |

---

## 🧩 3. Project Overview  

The system demonstrates **two backend implementations** for real-time metric ingestion and dashboard updates.  
Each implementation was developed and tested separately on different local machines.

| Implementation | Data Ingestion | Protocol | Processing | Real-Time Updates | Storage |
|----------------|----------------|-----------|-------------|-------------------|----------|
| **Implementation 1** | HTTP POST (Push Model) | HTTP/1.1 | Stateful (In-Memory Aggregation) | WebSocket (Reverb) | In-Memory |
| **Implementation 2** | WebSocket Streaming | HTTP/2 | Redis-Based Aggregation | WebSocket (Reverb) | Redis |

> 💻 Implementation 1 was built and tested by **Aya**.  
> 💻 Implementation 2 was built and tested by **Heba**.

---

## ⚡ 4. Setup Instructions  

> ⚠️ Note: The project was developed and tested locally without Docker or `docker-compose`.

### 🧱 Step 1 — Clone the Repository
```bash
git clone https://github.com/Aya-Nabil11/Real-Time-Analytics-Dashboard.git
cd real-time-analytics-dashboard
````

### 🗂 Step 2 — Navigate to an Implementation

```bash
cd src/implementation-1   # For HTTP/1 + Push Model
# OR
cd src/implementation-2   # For HTTP/2 + WebSocket + Redis
```

### ⚙️ Step 3 — Install Dependencies

```bash
composer install
npm install && npm run dev
```

### 🧾 Step 4 — Configure Environment

Copy `.env.example` to `.env` and update the following keys as needed:

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:...
DB_CONNECTION=mysql
DB_DATABASE=realtimeanalytics
DB_USERNAME=root
DB_PASSWORD=
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database
CACHE_STORE=database
```

> For Implementation 2, also enable **Redis** configuration in `.env`.

---

### ▶️ Step 5 — Run the Application

```bash
php artisan serve
```

### 🌐 Step 6 — (Optional) Run with HTTP/2 using Caddy

```bash
caddy run --config Caddyfile
```

Caddy acts as a **reverse proxy** and enables **HTTP/2 multiplexing** for better performance under concurrent connections.

---

## 🧪 5. Load Testing

Automated load tests were **not performed** due to local limitations.
However, basic performance validation was done using a simple Python script that simulates multiple servers pushing metrics.

Example script:

```python
import requests, random, time

URL = "http://127.0.0.1:8000/api/metrics"
SERVER_ID = 1

while True:
    payload = {
        "server_id": SERVER_ID,
        "metric_type": "cpu",
        "value": round(random.uniform(20, 95), 2),
        "unit": "%"
    }
    r = requests.post(URL, json=payload)
    print(f"Sent: {payload} | Status: {r.status_code}")
    time.sleep(1)
```

---

## 🏗️ 6. Architecture Overview

### **Implementation 1 — Push Model + HTTP/1 + Stateful In-Memory**

1. Servers send metrics using **HTTP POST** requests.
2. Backend uses a **stateful in-memory aggregator** to temporarily store and process metrics.
3. Data is broadcast to clients using **Laravel Reverb WebSockets**.

**Pros:**

* Simple and lightweight for small-scale testing.
* Low latency for few concurrent connections.

**Cons:**

* Limited scalability (memory-bound).
* Each request opens a new HTTP connection (HTTP/1 limitation).

---

### **Implementation 2 — WebSocket Ingestion + HTTP/2 + Redis**

1. Servers establish **WebSocket connections** for continuous metric streaming.
2. The **Caddy** reverse proxy manages HTTP/2 multiplexing, allowing many streams over one connection.
3. Metrics are processed and stored in **Redis**.
4. Dashboards receive live updates via **WebSockets**.

**Pros:**

* Scales efficiently under high concurrency.
* Lower connection overhead using HTTP/2 multiplexing.

**Cons:**

* Slightly more complex to configure.
* Requires Redis for state management.

---

## 👩‍💻 7. Team Members

| Name                    | Role      | Responsibilities                                  |
| ----------------------- | --------- | ------------------------------------------------- |
| **Aya Nabil Alharazin** | Developer | Implementation 1 (WebSocket + HTTP/2 + Redis)     |
| **Heba [Last Name]**    | Developer | Implementation 2 (Push Model + HTTP/1 + Stateful) |

---

## 🧠 8. Lessons Learned

Through this project, we learned to:

* Design and implement **real-time backend systems**.
* Compare **HTTP/1.1 and HTTP/2** communication efficiency.
* Understand **stateful vs. stateless** backend design.
* Use **WebSockets** for live updates in Laravel.
* Configure a **reverse proxy (Caddy)** for multiplexed communication.

This experience strengthened our understanding of backend scalability, real-time communication, and performance optimization.

---

## 📂 9. Project Structure

```
real-time-analytics-dashboard/
│
├── README.md
├── ARCHITECTURE.md
├── ANALYSIS_REPORT.pdf
│
├── src/
│   ├── implementation-1/        # HTTP/1.1 + Push + In-Memory
│   └── implementation-2/        # HTTP/2 + WebSocket + Redis
│
├── load-balancer/               # Caddy reverse proxy setup
├── tests/                       # (Future load testing scripts)
├── results/                     # (Collected metrics, if any)
└── benchmarks/                  # (Performance graphs)
```

---

## 🧾 10. License

This project was created as part of the **Mastering Backend Engineering Course – Final Project** and is intended for educational purposes only.

---

> 💡 *Developed by Aya Nabil Alharazin & Heba — November 2025*

```
`
