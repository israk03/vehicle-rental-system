import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import config from "../../config";
import jwt, { SignOptions } from "jsonwebtoken";


interface UserData {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
}

//*---------------------REGISTER USER
const registerUser = async(userData: UserData)=>{
    const {name, email, password, phone, role} = userData;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // convert email to lowercase
    const lowercaseEmail = email.toLocaleLowerCase();

    // insert user into db
    const result = await pool.query(`
        INSERT INTO users (name, email, password, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, phone, role
        `,
        [name, lowercaseEmail, hashedPassword, phone, role]
    );

    return result.rows[0];
};

//*---------------------LOGIN USER
const loginUser = async(email: string, password: string)=>{

    // find user by email
    const result = await pool.query(`
        SELECT * FROM users
        WHERE email=$1
        `,
        [email.toLocaleLowerCase()]
    );

    if(result.rows.length === 0){
        return null;
    }

    const user = result.rows[0]

    // compare password
    const isPassValid = await bcrypt.compare(password, user.password);

    if(!isPassValid){
        return false;
    }


    // jwt token generate
    const secret = config.jwt_secret as string;

    const signOptions: SignOptions = {
         expiresIn: config.jwt_expires_in as any,
  };

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, secret, signOptions);

    return { 
        token, 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
        } 
    };
};



export const authServices = {
    registerUser,
    loginUser,
};