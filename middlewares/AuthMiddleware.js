import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import bigquery from '../config/big_query.js';
import { table }  from '../config/config.js';


const userProtect = asyncHandler(async (req, res, next) => {

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    
        try {

            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            
            const query = `SELECT USER_ID, EMAIL, NAME, ROLE FROM ${table.login} WHERE USER_ID=${decoded.id}`;
            
            const user = await bigquery.query(query);

            if (!user[0][0].USER_ID) {
                res.status(401)
                throw Error('User not found')
                
            }else{

                req.user = user[0][0];

                let role = user[0][0].ROLE;


                if (req.originalUrl === '/v2/api/login/new' && (role === 'admin' || role === 'manager')) {
                    next();

                }else if (req.originalUrl === '/v2/api/login/profile' && (role === 'admin' || role === 'manager')){
                    next();
                    
                }else if (req.originalUrl === '/v2/api/enquiry/customer-email' && (role === 'admin' || role === 'manager')){
                    next();

                }else if (req.originalUrl === '/v2/api/enquiry/add-prospect' && (role === 'admin' || role === 'manager')){
                    next();
                    
                }else if (req.originalUrl === '/v2/api/enquiry/prospect' && (role === 'admin' || role === 'manager')){
                    next();
                    
                }else if (req.originalUrl === '/v2/api/enquiry/customer' && (role === 'admin' || role === 'manager')){
                    next();

                }else if (req.originalUrl === '/v2/api/enquiry/accept-deny' && (role === 'admin' || role === 'manager')){
                    next();

                }else if (req.originalUrl === '/v2/api/enquiry/close-desc' && (role === 'admin' || role === 'manager')){
                    next();

                }else if (req.route.path === '/close-desc/:id' && (role === 'admin' || role === 'manager')){
                    next();
                    
                } else {
                    res.status(401)
                    throw Error("you can't access this api!")
                }

            }
            // next()
        } catch (err) {

            res.status(401)
            throw Error('Not Authorized, Token Failed')
        }

    }

    if (!token) {
        res.status(401)
        throw Error('User not logged in!')
    }

})


export {
    userProtect
}