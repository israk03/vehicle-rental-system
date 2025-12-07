import { pool } from "../../config/db";

interface VehicleData {
    vehicle_name: string;
    type: string;
    registration_number: string;
    daily_rent_price: number;
    availability_status: string;
}

//!------------CREATE VEHICLE
const createVehicle = async(vehicleData: VehicleData)=>{
    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = vehicleData;

    const result = await pool.query(`
        INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    return result.rows[0];
};

//!-----------GET ALL VEHICLES
const getAllVehicles = async()=>{
    const result = await pool.query(`
        SELECT * FROM vehicles
        ORDER BY id ASC
        `);

    return result.rows;
}

//!-----------GET SINGLE VEHICLE
const getVehicleById = async (vehicleId: number)=>{
    const result = await pool.query(`
        SELECT * FROM vehicles 
        WHERE id=$1
        
        `,
        [vehicleId]
    );
    return result.rows[0] || null;
};

//!-----------UPDATE SINGLE VEHICLE
const updateVehicle = async(vehicleId: number, updateData: any)=>{
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // dynamic update query
    if(updateData.vehicle_name){
        fields.push(`vehicle_name = $${paramIndex}`);
        values.push(updateData.vehicle_name);
        paramIndex++;
    }
    if(updateData.type){
        fields.push(`type = $${paramIndex}`);
        values.push(updateData.type);
        paramIndex++;
    }
    if (updateData.registration_number) {
        fields.push(`registration_number = $${paramIndex}`);
        values.push(updateData.registration_number);
        paramIndex++;
    }
    if (updateData.daily_rent_price) {
        fields.push(`daily_rent_price = $${paramIndex}`);
        values.push(updateData.daily_rent_price);
        paramIndex++;
    }
    if (updateData.availability_status) {
        fields.push(`availability_status = $${paramIndex}`);
        values.push(updateData.availability_status);
        paramIndex++;
    }

    if (fields.length === 0) {
        return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(vehicleId);

    const query = `
        UPDATE vehicles 
        SET ${fields.join(", ")} 
        WHERE id = $${paramIndex} 
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;



};

//!-----------DELETE VEHICLE
const deleteVehicle = async (vehicleId: number) => {
    const result = await pool.query(
        `DELETE FROM vehicles WHERE id = $1 RETURNING id`,
        [vehicleId]
    );

    return result.rows.length > 0;
};

const hasActiveBookings = async (vehicleId: number) => {
    const result = await pool.query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE vehicle_id = $1 AND status = 'active'`,
        [vehicleId]
    );

    return parseInt(result.rows[0].count) > 0;
};

export const vehicleService = {
    createVehicle, 
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    hasActiveBookings,
    deleteVehicle
}