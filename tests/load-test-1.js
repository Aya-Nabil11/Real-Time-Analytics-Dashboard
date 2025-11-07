import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,           // عدد المستخدمين الافتراضيين
  duration: '30s',    // مدة الاختبار
};

export default function () {
  let res = http.post('http://localhost:8000/api/metrics', JSON.stringify({
    server_id: 1,
    metric_type: 'cpu',
    value: Math.random() * 100,
    unit: '%'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
