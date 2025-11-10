
## 🚀 Scenario Chosen and Why

**Scenario 2: Real-Time Analytics Dashboard**

We chose this scenario because it represents a **real-world, high-throughput backend system** similar to Datadog or Grafana.
The system must handle:

* Continuous **metric ingestion** from up to **10,000 servers**
* **Real-time updates** for 500+ dashboard viewers
* **Low-latency data flow** between ingestion and visualization

This scenario allowed us to practically explore:

* Communication protocols (**HTTP/1.1 vs HTTP/2**)
* Data ingestion models (**push via POST vs WebSocket streaming**)
* Processing strategies (**stateful vs stateless**)
* Scalability trade-offs using **Redis and WebSocket broadcasting**

---
* *ARCHITECTURE File* : https://docs.google.com/document/d/16ccqvabPPXfxETTaFiE0VeU_WZdgMoo1/edit?usp=sharing&ouid=100654129709547485998&rtpof=true&sd=true
* *Analysis Report* : https://docs.google.com/document/d/1Bstk_cG4m2aOE6qvPICiW2abPh0f8cxA/edit?usp=sharing&ouid=100654129709547485998&rtpof=true&sd=true

## 🧩 Tech Stack Used

| Category                 | Tool / Framework                                               | Purpose                             |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------- |
| **Backend Framework**    | Laravel 12.x                                                   | API endpoints, WebSocket events     |
| **Protocol Layer**       | HTTP/1.1 & HTTP/2                                              | Communication protocol comparison   |
| **Realtime Layer**       | Laravel Reverb (WebSocket)                                     | Instant updates to dashboard        |
| **Data Store**           | MySQL (historical data), Redis (real-time cache in approach 2) | Storage and aggregation             |
| **Containerization**     | Docker, Docker Compose                                         | Deployment and environment setup    |
| **Load Testing**         | K6                                               | Throughput and latency benchmarking |
| **Logging & Monitoring** | Laravel Log & custom metrics                                   | Request traces and performance logs |

---

## 🧠 System Approaches Overview

### **Approach 1: HTTP/1.1 + POST Requests + WebSocket Dashboard (Stateful In-Memory)**

* **Ingestion:** Servers push metrics using `POST /api/metrics` over HTTP/1.1.
* **Processing:** Data is stored temporarily in **in-memory arrays** and aggregated.
* **Realtime Updates:** Aggregated data is broadcast via **WebSocket** to connected dashboards.
* **Characteristics:**

  * Low complexity and fast local aggregation.
  * High latency under heavy load due to connection overhead of HTTP/1.1.
  * Suitable for small to medium-scale environments.

### **Approach 2: HTTP/2 + WebSocket Ingestion + Redis Cache (Stateless Aggregation)**

* **Ingestion:** Servers send continuous metric streams via **WebSocket** using **HTTP/2 multiplexing**.
* **Processing:** Each node updates shared metrics in **Redis** (Pub/Sub).
* **Realtime Updates:** Dashboards subscribe to Redis channels via WebSocket for instant updates.
* **Characteristics:**

  * Highly scalable and low-latency.
  * Efficient connection management using multiplexed HTTP/2.
  * Best suited for large-scale, concurrent systems.

---

## ⚙️ Setup Instructions

### **1. Clone the Repository**

```bash
git clone https://github.com/Aya-Nabil11/Real-Time-Analytics-Dashboard.git
cd Real-Time-Analytics-Dashboard
```

### **2. Build and Run Containers**

```bash
docker-compose up --build
```

This will automatically start:

* Laravel application
* MySQL
* Redis (for approach 2)
* WebSocket server (Laravel Reverb)

### **3. Environment Configuration**

Create a `.env` file:

```env
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:xxxxxx
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=metrics
DB_USERNAME=root
DB_PASSWORD=root
BROADCAST_DRIVER=reverb
REDIS_HOST=redis
```

### **4. Run Database Migrations**

```bash
docker exec -it app php artisan migrate
```

---

## 🧪 How to Run Load Tests

### **Approach 1 (HTTP/1.1 Push)**

```bash
k6 run tests/load-test-1.js
```

Tests:

* `POST /api/metrics` requests from simulated servers.
* Measures latency, throughput, and request failures.

### **Approach 2 (HTTP/2 Streaming)**

```bash
k6 run tests/load-test-2.js
```

Tests:

* WebSocket ingestion and dashboard streaming performance.
* Tracks message delivery rate and CPU/memory usage.

Results are exported automatically to:

```
results/
├── approach1.json
├── approach2.json
```



---

## 🧱 Brief Architecture Overview

### **Approach 1:**

```
[Servers] --(HTTP/1.1 POST)--> [Laravel API] --(WebSocket)--> [Dashboard]
                │
          [In-Memory State]
                │
            [MySQL DB]
```

* Push model using POST.
* Stateful aggregation.
* WebSocket broadcasting to dashboards.

### **Approach 2:**

```
[Servers] ==(HTTP/2 + WebSocket)==> [Ingestion Layer] --> [Redis Cache] --> [Laravel Reverb + Dashboard]
```

* Continuous WebSocket streams for ingestion.
* Shared Redis cache for distributed nodes.
* Real-time Pub/Sub updates for dashboards.

---

## 🧮 Performance Summary (Preview)

| Metric             | Approach 1 | Approach 2 | Winner        |
| ------------------ | ---------- | ---------- | ------------- |
| Avg Latency (ms)   | 320        | 120        | 🏆 Approach 2 |
| P95 Latency (ms)   | 890        | 310        | 🏆 Approach 2 |
| Throughput (req/s) | 8,000      | 12,500     | 🏆 Approach 2 |
| CPU Usage (%)      | 65         | 82         | Approach 1    |
| Memory (MB)        | 480        | 650        | Approach 1    |

---

## 🧭 Conclusion

* **Approach 1** is simpler, better for lightweight real-time dashboards or local monitoring.
* **Approach 2** demonstrates production-level scalability using modern web protocols and caching.
* The final system shows a **60% reduction in latency** and **1.5× throughput improvement** under HTTP/2.


