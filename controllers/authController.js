import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import bigquery from '../config/big_query.js';
import generateToken from '../utils/generateToken.js';
import { table }  from '../config/config.js';
import timeFormat from '../helper/time.js';



const login = asyncHandler(async (req, res) => {
    

    const { phoneOrEmail, password } = req.body;

    if (!phoneOrEmail || !password) {
        res.status(400)
        throw new Error('please add all fields!')
    }

    let user;

    try {

        const email_query = `SELECT * FROM ${table.login} WHERE EMAIL='${phoneOrEmail}'`;
        user = await bigquery.query(email_query);

        if(!user[0][0]){
            const phone_query = `SELECT * FROM ${table.login} WHERE PHONE='${phoneOrEmail}'`;
            user = await bigquery.query(phone_query);

            if (!user[0][0]) {
                res.status(400)
                throw new Error('User not found')
            }
        }
        
    } catch (error) {
        res.status(400)
        throw new Error('Invalid Phone or Email')
    }

    if(!user[0][0]['PASSWORD']){
        res.status(400)
        throw new Error('Something went to wrong!')
    }


    const isPassword = await bcrypt.compare(password, user[0][0]['PASSWORD'])
    if (!isPassword) {
        res.status(400)
        throw new Error("Invalid credentials!")
    }

    // // req.session.user = resData;

    // // // const tracker_query = `INSERT INTO alubee_dataset.alubee_nofitication_table VALUES ('${timeFormat()}', ${resData.id} , '-', 'Login')`;
    // // // await bigquery.query(tracker_query);

    res.status(200).json({
        message: 'Login successful!',
        success: true,
        token: generateToken(user[0][0]['USER_ID']),
        role: user[0][0]['ROLE']
    })
})




const login_newUser = asyncHandler(async(req, res) => {

    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !phone || !role || !password) {
        res.status(400)
        throw new Error('please add all details')
    }

    const existEmail_query = `SELECT * FROM ${table.login} WHERE EMAIL='${email}'`;
    const existEmail = await bigquery.query(existEmail_query);
    if (existEmail[0][0]) {
        res.status(400)
        throw new Error('Email already exists!, Try new Email')
    }

    const existPhone_query = `SELECT * FROM ${table.login} WHERE PHONE='${phone}'`;
    const existPhone = await bigquery.query(existPhone_query);
    if (existPhone[0][0]) {
        res.status(400)
        throw new Error('Phone Number already exists!, Try another phone number')
    }

    const getId_query = `SELECT MAX(USER_ID) as user_id FROM ${table.login}`;
    const user_id = await bigquery.query(getId_query);

    const salt = await bcrypt.genSalt(10);
    if (!salt) {
        res.status(400)
        throw new Error('somthing went wrong with bcrypt')
    }

    const hashPassword = await bcrypt.hash(password, salt)
    if (!hashPassword) {
        res.status(400)
        throw new Error('something went wrong with hashing')
    }

    const insert_query = `INSERT INTO ${table.login}
    (USER_ID,EMAIL,NAME,PHONE,ROLE,CREATED_AT,UPDATED_AT,PASSWORD) 
    VALUES(${user_id[0][0].user_id + 1}, '${email}', '${name}', '${phone}', '${role}', '${timeFormat()}', " ", '${hashPassword}')`;
   
    await bigquery.query(insert_query);

    res.status(200).json({
        msg: 'User Created successful!',
        success: true,
    })
})


const getLoginProfile = asyncHandler(async (req, res) => {

    const query = `SELECT * FROM ${table.login} WHERE USER_ID=${req.user.USER_ID}`;
    const user = await bigquery.query(query);

    if (!user[0][0]) {
        res.status(404)
        throw new Error('User not found')
    }

    res.status(200).json({
        _id: user[0][0].USER_ID,
        name: user[0][0].NAME,
        email: user[0][0].EMAIL,
        phone: user[0][0].PHONE,
        role: user[0][0].ROLE    
    })
})


const logout = asyncHandler(async (req, res) => {
    // req.session.destroy();
    res.redirect('/')
})

export {
    login,
    login_newUser,
    getLoginProfile,
    logout
}