import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { imap_config } from '../config/config.js';
import asyncHandler from 'express-async-handler';
import { table } from '../config/config.js';
import bigquery from '../config/big_query.js';
import timeFormat from '../helper/time.js';
import { generateID, customerGenerateID, prospectGenerateID } from '../helper/_ID_Increment.js';
import nodemailer from 'nodemailer';


 
const imap = new Imap({
    user: imap_config.user,
    password: imap_config.password,
    host: imap_config.host,
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
});




function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}



const customerEmailDetails = asyncHandler(async (req, res) => {

    const { customer_email } = req.body;

    imap.once('ready', function() {
        openInbox(function(err, box) {
            if (err) throw err;
          
            imap.search([['FROM', customer_email]], function(err, results) {
                if (err) throw err;

                if (results.length === 0) {
                    // res.status(400) 
                    // throw new Error('No emails found from the specified sender.')
                    // imap.end();
                    // return;
                    imap.end();
                    return res.status(400).json({ 
                        error: 'No emails found from the specified sender.' 
                    });
                }
            
                const latestEmailUID = results[results.length - 1];
                const f = imap.fetch(latestEmailUID, { bodies: '' });
            
                f.on('message', function(msg, seqno) {
                    console.log('Got email with UID ' + latestEmailUID);
      
                    let messageBody = '';
      
                    msg.on('body', function(stream, info) {
                        stream.on('data', function(chunk) {
                            messageBody += chunk.toString('utf8');
                        });
      
                        stream.on('end', function() {
                            simpleParser(messageBody, async (err, parsed) => {
                                if (err) throw err;
                
                                // console.log('Subject:', parsed.subject);
                                // console.log('From:', parsed.from.text);
                                // console.log('To:', parsed.to.text);
                                // console.log('Body:', parsed.text);



                                const fromNameArray = parsed.from.text.split('"'); 
                                let fromName = ''; // customer Name
                                let fromEmail = ''; // Email

                                if (fromNameArray.length >= 2) {

                                  fromName = fromNameArray[1]; 
                                  fromEmail = fromNameArray[2].replace(/[<>]/g, ''); 

                                } else {
                                  fromName = parsed.from.text[0].split(' ')[0];

                                }

                                let fromSubject = parsed.subject; // subject
                                let fromBody = parsed.text.replace(/[\n+]/g, '') // body content

                                const customer_check = `SELECT * FROM ${table.customer} WHERE CUST_MAIL='${fromEmail.trim()}'`;
                                const customerCheckData = await bigquery.query(customer_check);

                                const prospect_check = `SELECT * FROM ${table.prospect} WHERE PROS_MAIL='${fromEmail.trim()}'`;
                                const prospectCheckData = await bigquery.query(prospect_check);

                                if(customerCheckData[0][0]){
                                    
                                    res.status(200).json({
                                        fromName,
                                        fromEmail,
                                        fromSubject,
                                        fromBody,
                                        type: 'customer' 
                                    })

                                }else if(prospectCheckData[0][0]){

                                    res.status(200).json({
                                        fromName,
                                        fromEmail,
                                        fromSubject,
                                        fromBody,
                                        type: 'prospect' 
                                    })

                                }else{
                                    res.status(200).json({
                                        fromName,
                                        fromEmail,
                                        fromSubject,
                                        fromBody,
                                        type: 'new' 
                                    }) 
                                }

                                imap.end();
                            });
                        });
                    });
              
                    msg.once('end', function() {
                        console.log('Message finished.');
                    });
                });
            });
        });
    });
      
    imap.once('error', function(err) {
        console.error(err);
    });
    
    imap.once('end', function() {
        console.log('Connection ended');
    });
    
    imap.connect();
});



const addProspectManual = asyncHandler(async (req, res) => {

    const {
        customer_name,
        customer_email,
        customer_phone,
        subject,
        body_content,
        customer_type,
    } = req.body;


    if (!customer_name || !customer_email  || !subject || !body_content || !customer_type) {
        res.status(400)
        throw new Error('please add all details')
    }

    // prospect status
    let status_name = '';
    let id = '';

    if(customer_type === 'prospect'){
        status_name = 'Prospect Created';
        id = await generateID('PRS', `${table.prospect_main}`);

    }else if (customer_type === 'customer'){
        status_name = 'Enquiry Created';
        id = await generateID('ENQ', `${table.prospect_main}`);
    }


    const insert_query = `INSERT INTO ${table.prospect_main} 
    (ID, DATE, CUST_NAME, MAIL_ID, CONTACT_NO, SUBJECT, CONTENT, TYPE) VALUES 
    ('${id}', '${timeFormat()}', '${customer_name}', '${customer_email}', '${customer_phone}', '${subject}', '${body_content}', '${customer_type}')`;
    
    await bigquery.query(insert_query);



    const prospect_status_query = `INSERT INTO ${table.prospect_status} 
    (ID, DATE, STATUS) VALUES 
    ('${id}', '${timeFormat()}', '${status_name}')`;

    await bigquery.query(prospect_status_query);


    if(customer_type === 'customer'){

        const existCustomer_check = `SELECT * FROM ${table.customer} WHERE CUST_MAIL='${customer_email.trim()}'`;
        const existCustomerCheckData = await bigquery.query(existCustomer_check);

        if(!existCustomerCheckData[0][0]){

            let customer_id = await customerGenerateID('CUS', `${table.customer}`)

            const new_customer_query = `INSERT INTO ${table.customer} 
            (CUST_ID, CUST_NAME, CUST_MAIL, CUST_CONTACT_NO, CUST_DOC_URL, CUST_CREATED_DATE) VALUES 
            ('${customer_id}', '${customer_name}', '${customer_email.trim()}', '${customer_phone}', '', '${timeFormat()}')
            `
    
            await bigquery.query(new_customer_query);

            res.status(200).json({
                status: 'success',
                message: 'Customer Prospect Created'
            })
           
        }else{

            res.status(200).json({
                status: 'success',
                message: 'Customer Prospect Created'
            })
        }
       
    }else{

        const existProspect_check = `SELECT * FROM ${table.prospect} WHERE PROS_MAIL='${customer_email.trim()}'`;
        const existProspectCheckData = await bigquery.query(existProspect_check);

        if(!existProspectCheckData[0][0]){
            let prospect_id = await prospectGenerateID('PRO', `${table.prospect}`)

            const new_prospect_query = `INSERT INTO ${table.prospect} 
            (PROS_ID, PROS_NAME, PROS_MAIL, PROS_CONTACT_NO, PROS_DOC_URL, PROS_CREATED_DATE) VALUES 
            ('${prospect_id}', '${customer_name}', '${customer_email.trim()}', '${customer_phone}', '', '${timeFormat()}')
            `
            await bigquery.query(new_prospect_query);

            res.status(200).json({
                status: 'success',
                message: 'Prospect Created'
            })

        }else{
            res.status(200).json({
                status: 'success',
                message: 'Prospect Created'
            })
        }
    }

    
})





const enquiryProspectList = asyncHandler(async (req, res) => {

    const enquiries_query = `SELECT * FROM ${table.enquiry_view}`;
    const [enquiry] = await bigquery.query(enquiries_query);

    const prospect = enquiry.filter((val) => val.TYPE === "prospect");

    res.status(200).json(prospect)
})

const enquiryCustomerList = asyncHandler(async (req, res) => {

    const enquiries_query = `SELECT * FROM ${table.enquiry_view}`;
    const [enquiry] = await bigquery.query(enquiries_query);

    const customer = enquiry.filter((val) => val.TYPE === "customer");

    res.status(200).json(customer)
})



const enquiryAcceptDeny = asyncHandler(async (req, res) => {

    const { id, type, customer_type } = req.body;

    if (!id || !type || !customer_type) {
        res.status(400)
        throw new Error('please add all details')
    }

    const enquiry_query = `SELECT * FROM ${table.prospect_main} WHERE ID='${id.trim()}'`;
    const [enquiries] = await bigquery.query(enquiry_query);

    if(!enquiries[0]){
        res.status(400)
        throw new Error(`Data not found this ID ${id}`)
    }



    if(type === 'Accepted'){

        if(customer_type === 'prospect'){

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: imap_config.user,
                  pass: imap_config.password,
                }
            });
        
            const replySubject = 'Re:' + enquiries[0]?.SUBJECT; 
            const replyText = `Thank you for getting in touch. Our team has begun addressing your inquiry, and we will reach out shortly to gather additional details.\n ID :\b${enquiries[0]?.ID} \n Note: Please reply to the same email for any additional queries. \n\n Thanks, \nTeam Alubee.`; 
            await transporter.sendMail({
                from: imap_config.user, 
                to:  enquiries[0]?.MAIL_ID, 
                subject: replySubject,
                text: replyText
            });
    
            const prospect_status_query = `INSERT INTO ${table.prospect_status} 
            (ID, DATE, STATUS) VALUES 
            ('${id}', '${timeFormat()}', 'Prospect Accepted')`;
    
            await bigquery.query(prospect_status_query);

        }else if (customer_type === 'customer'){

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: imap_config.user,
                  pass: imap_config.password,
                }
            });
        
            const replySubject = 'Re:' + enquiries[0]?.SUBJECT; 
            const replyText = `Thank you for getting in touch. Our team has begun addressing your inquiry, and we will reach out shortly to gather additional details.\n ID :\b${enquiries[0]?.ID} \n Note: Please reply to the same email for any additional queries. \n\n Thanks, \nTeam Alubee.`; 
            await transporter.sendMail({
                from: imap_config.user, 
                to:  enquiries[0]?.MAIL_ID, 
                subject: replySubject,
                text: replyText
            });
    
            const prospect_status_query = `INSERT INTO ${table.prospect_status} 
            (ID, DATE, STATUS) VALUES 
            ('${id}', '${timeFormat()}', 'Enquiry Accepted')`;
    
            await bigquery.query(prospect_status_query);

        }else{
            res.status(400)
            throw new Error(`something went wrong on accept, please check your side!`)
        }

    }else if (type === 'Closed'){

        if(customer_type === 'prospect'){

            const prospect_status_query = `INSERT INTO ${table.prospect_status} 
            (ID, DATE, STATUS) VALUES 
            ('${id}', '${timeFormat()}', 'Prospect Closed')`;
    
            await bigquery.query(prospect_status_query);

        }else if (customer_type === 'customer'){

            const prospect_status_query = `INSERT INTO ${table.prospect_status} 
            (ID, DATE, STATUS) VALUES 
            ('${id}', '${timeFormat()}', 'Enquiry Closed')`;
    
            await bigquery.query(prospect_status_query);

        }else{
            res.status(400)
            throw new Error(`something went wrong on deny, please check your side!`)
        }

    }else{
        res.status(400)
        throw new Error(`something went wrong on type, please check your side!`)
    }

    res.status(200).json({
        status: 'success',
        message: `${id} ${type}`
    })
})


const enquiryCloseDescription = asyncHandler(async (req, res) => {

    const { id, description } = req.body;

    if (!id || !description ) {
        res.status(400)
        throw new Error('please add all details')
    }

    const close_desc_query = `INSERT INTO ${table.enquiry_close_desc} 
    (ID, DATE, NOTE) VALUES 
    ('${id}', '${timeFormat()}', '${description}')`;

    await bigquery.query(close_desc_query);

    res.status(200).json({
        status: 'success',
        message: `${id} Closed`
    })
})


const getClosedDescriptionById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) {
        res.status(400)
        throw new Error('ID is required')
    }

    const get_query = `SELECT * FROM ${table.enquiry_close_desc} WHERE ID='${id}'`
    const [result] = await bigquery.query(get_query);


    if (!result[0]) {
        res.status(400)
        throw new Error(`Record not found in this ${id}, please check your ID`)
    }

   
    res.status(200).json(result[0])

})


export {
    customerEmailDetails,
    addProspectManual,
    enquiryProspectList,
    enquiryCustomerList,
    enquiryAcceptDeny,
    enquiryCloseDescription,
    getClosedDescriptionById
}