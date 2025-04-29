import axios from 'axios';


const USERS = 20;
const URL = 'http://localhost:8000/bookings/book-spot';

async function sendRequest(userIndex) {
  const data = {
    user_id: "111919577987638512190",
    spot_id: 17,
    total_slots: 1,
    total_amount: 120,
    start_date_time: "2025-04-25T10:00:00+05:30",
    end_date_time: "2025-04-25T12:00:00+05:30",
    receipt: "booking_1714024200000"
  };

  try {
    console.time(`User ${userIndex}`);
    const response = await axios.post(URL, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    console.timeEnd(`User ${userIndex}`);
    console.log(`User ${userIndex} ➜ Status: ${response.status}`);
  } catch (error) {
    console.error(`User ${userIndex} ❌ Error:`, error.message);
  }
}

(async () => {
  const tasks = [];

  for (let i = 0; i < USERS; i++) {
    tasks.push(sendRequest(i));
  }

  await Promise.all(tasks);
})();
