import bcrypt from "bcryptjs";
import { pool } from "../../config/db"

//!-----GET ALL USERS
const getAllUsers = async()=>{
    const result = await pool.query(`
        SELECT id, name, email, phone, role, created_at, updated_at FROM users
        ORDER BY id ASC
        
        `);
        return result.rows;
};

//!-----UPDATE USER
const updateUser = async(userId: number, updateData: any)=>{
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // dynamic update query
    if(updateData.name){
        fields.push(`name = $${paramIndex}`);
        values.push(updateData.name);
        paramIndex++;
    }

    if(updateData.email){
        fields.push(`email = $${paramIndex}`);
        values.push(updateData.email.toLowerCase());
        paramIndex++;
    }

    if(updateData.password){
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        fields.push(`password = $${paramIndex}`);
        values.push(hashedPassword);
        paramIndex++;
    }

    if(updateData.phone){
        fields.push(`phone = $${paramIndex}`);
        values.push(updateData.phone);
        paramIndex++;
    }

    if(updateData.role){
        fields.push(`role = $${paramIndex}`);
        values.push(updateData.role);
        paramIndex++;
    }

    if(fields.length === 0){
        return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING id, name, email, phone, role, created_at, updated_at
    
    `;

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

//!-----DELETE USER
const deleteUser = async(userId: number)=>{
    const result = await pool.query(`
        DELETE FROM users
        WHERE id=$1
        RETURNING id
        `,
        [userId]
    );

    return result.rows.length > 0;
};

//!-----CHECK FOR ACTIVE BOOKINGS
const hasActiveBookings = async(userId: number)=>{
    const result = await pool.query(`
        SELECT COUNT(*) as count FROM bookings
        WHERE customer_id = $1 AND status = 'active
        
        `,
        [userId]
    );
    return parseInt(result.rows[0].count) > 0;
}

export const userServices = {
    getAllUsers, 
    updateUser, 
    deleteUser,
    hasActiveBookings
}