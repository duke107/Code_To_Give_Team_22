import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

async function testOrder() {
    try {
        const options = {
            amount: 50000, // 500 INR
            currency: "INR",
            receipt: `test_order_${Date.now()}`,
        };

        console.log("Creating Razorpay order with options:", options);

        const order = await razorpay.orders.create(options);

        console.log("✅ Razorpay Order Response:", order);

    } catch (error) {
        console.error("❌ Error Creating Order:", error);

        if (error.response) {
            console.error("Razorpay API Response Error:", error.response.data);
        }
    }
}

testOrder();
