const axios = require('axios');

const setupAdmin = async () => {
  try {
    console.log('🔧 Setting up admin user...');

    const response = await axios.post('http://localhost:5000/api/admin/setup-admin', {
      name: "System Admin",
      email: "admin@mealbridge.com",
      password: "Admin@123"
    });

    console.log('✅ Admin setup successful!');
    console.log('📧 Admin details:', response.data.admin);

  } catch (error) {
    console.log('❌ Admin setup failed!');
    console.log('📧 Error:', error.response?.data || error.message);
  }
};

setupAdmin();