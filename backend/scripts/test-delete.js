const axios = require('axios');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('./adminConfig');

async function testDelete() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginRes.data.token;
    
    // Get notifications
    const notifRes = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const notifs = notifRes.data.data;
    if (notifs.length > 0) {
      const id = notifs[0]._id;
      console.log("Attempting to delete notification", id);
      const delRes = await axios.delete(`http://localhost:5000/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Delete response:", delRes.data);
    } else {
      console.log("No notifications to delete");
    }
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}

testDelete();
