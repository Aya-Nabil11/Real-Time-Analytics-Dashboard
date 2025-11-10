import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const GATEWAY = __ENV.WS_URL || 'ws://host.docker.internal:8081';
const API_KEY = __ENV.METRICS_API_KEY || 'change-me-very-strong';

// مقاييس مخصصة
export const msg_send_latency = new Trend('msg_send_latency'); // وقت إرسال/ACK (إن وُجد ACK)
export const conn_fail = new Rate('conn_fail');
export const send_fail = new Rate('send_fail');
export const msgs_sent = new Counter('msgs_sent');

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // ramp-up
    { duration: '1m', target: 120 }, // peak
    { duration: '1m', target: 30 },  // ramp-down
  ],
  thresholds: {
    conn_fail: ['rate<0.01'],
    send_fail: ['rate<0.01'],
  },
  summaryTrendStats: ['avg','min','med','p(90)','p(95)','p(99)','max'],
};

export default function () {
  const url = `${GATEWAY}?key=${API_KEY}`;
  const serverName = `ws-vu-${__VU}`;

  const res = ws.connect(url, {}, function (socket) {
    let openTs = Date.now();

    socket.on('open', () => {
      // اتصال ناجح
    });

    socket.on('error', (e) => {
      conn_fail.add(1);
    });

    // (اختياري) لو الـgateway يرجّع ACK، نقيس round-trip
    socket.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.ack_seq && msg.ack_ts && msg.sent_at) {
          msg_send_latency.add(Number(msg.ack_ts) - Number(msg.sent_at));
        }
      } catch (_) {}
    });

    // أرسل رسائل بوتيرة ثابتة خلال حياة الـVU
    for (let i = 0; i < 40; i++) { // ~40 رسالة لكل VU في الدقيقة
      const payload = JSON.stringify({
        seq: i + 1,
        server_name: serverName,
        cpu_usage: Math.floor(Math.random() * 100),
        memory_usage: Math.floor(Math.random() * 100),
        sent_at: Date.now(),
      });

      const ok = socket.send(payload);
      if (!ok) send_fail.add(1); else msgs_sent.add(1);

      sleep(1.5); //  ~0.66 msg/sec لكل اتصال
    }

    socket.close();
  });

check(res, { 'status is 101/connected': (r) => r && r.status === 101 || r.status === 0 })
}
