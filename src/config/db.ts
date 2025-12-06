import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
    connectionString: config.connection_str,
});

const initDB = async()=>{
    try {

        //!------------ USER TABLE
        await pool.query(`
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

        //!----------- VEHICLE TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(200) NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN('car', 'bike', 'van', 'suv')),
                registration_number VARCHAR(50) UNIQUE NOT NULL,
                daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price > 0),
                availability_status VARCHAR (20) NOT NULL CHECK (availability_status IN ('available', 'booked')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            
            )
            `);


        //!------------ BOOKING TABLE
        await pool.query(`
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

        console.log("Database tables initialized successfully.")
        
    } catch (error: any) {
        console.error("Database initialization error: ", error.message);
        throw error;
        
        
    }
}

export default initDB;