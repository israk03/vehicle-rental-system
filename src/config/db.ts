import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
    connectionString: config.connection_str,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 seconds timeout
    idleTimeoutMillis: 30000,
    max: 20 // Maximum number of clients in the pool
});

const initDB = async() => {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`🔌 Connecting to database... (attempt ${retries + 1}/${maxRetries})`);
            
            // Test connection with timeout
            const client = await Promise.race([
                pool.connect(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 10000)
                )
            ]) as any;
            
            console.log("✅ Database connection successful!");
            
            console.log("📊 Creating/verifying tables...");

            // USER TABLE
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(150) UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log("✅ Users table ready");

            // VEHICLE TABLE
            await client.query(`
                CREATE TABLE IF NOT EXISTS vehicles (
                    id SERIAL PRIMARY KEY,
                    vehicle_name VARCHAR(200) NOT NULL,
                    type VARCHAR(20) NOT NULL CHECK (type IN('car', 'bike', 'van', 'SUV')),
                    registration_number VARCHAR(50) UNIQUE NOT NULL,
                    daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price > 0),
                    availability_status VARCHAR (20) NOT NULL CHECK (availability_status IN ('available', 'booked')),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log("✅ Vehicles table ready");

            // BOOKING TABLE
            await client.query(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id SERIAL PRIMARY KEY,
                    customer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
                    rent_start_date DATE NOT NULL,
                    rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
                    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
                    status VARCHAR(20) NOT NULL CHECK (status IN('active', 'cancelled', 'returned')),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log("✅ Bookings table ready");

            client.release();
            console.log("✅ Database tables initialized successfully!");
            return; // Success, exit function
            
        } catch (error: any) {
            retries++;
            console.error(`❌ Database connection attempt ${retries} failed:`, error.message);
            
            if (retries >= maxRetries) {
                console.error("❌ All connection attempts failed. Database initialization incomplete.");
                console.error("⚠️  The API will run but database operations will fail.");
                return; // Don't throw, allow server to start
            }
            
            // Wait before retry
            console.log(`⏳ Retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

export default initDB;
