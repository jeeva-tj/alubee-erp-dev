import bigquery from '../config/big_query.js';


export async function generateID(prefix, table) {
    

    const query = `SELECT ID as max_id  FROM ${table} ORDER BY DATE DESC LIMIT 1`;
    
    // Run the query
    const [rows] = await bigquery.query(query);

    
    let newId;
    
    if (rows.length === 0 || rows[0].max_id === null) {
        // If there are no existing IDs, start with 1
        newId = prefix + '001';

    } else {
        // Extract and return the max ID
        const maxId = rows[0].max_id;
        
        newId = prefix + (parseInt(maxId.substring(prefix.length)) + 1).toString().padStart(3, '0');
    }

    
    return newId;
}

export async function customerGenerateID(prefix, table) {
    

    const query = `SELECT CUST_ID as max_id FROM ${table} ORDER BY CUST_CREATED_DATE DESC LIMIT 1`;
    
    
    // Run the query
    const [rows] = await bigquery.query(query);
    
    let newId;
    
    if (rows.length === 0 || rows[0].max_id === null) {
        // If there are no existing IDs, start with 1
        newId = prefix + '001';
    } else {
        // Extract and return the max ID
        const maxId = rows[0].max_id;
        
        // Increment the ID
        newId = prefix + (parseInt(maxId.substring(prefix.length)) + 1).toString().padStart(3, '0');
    }
    
    return newId;
}

export async function prospectGenerateID(prefix, table) {
    

    const query = `SELECT PROS_ID as max_id  FROM ${table} ORDER BY PROS_CREATED_DATE DESC LIMIT 1`;
    
    // Run the query
    const [rows] = await bigquery.query(query);
    
    let newId;
    
    if (rows.length === 0 || rows[0].max_id === null) {
        // If there are no existing IDs, start with 1
        newId = prefix + '001';
    } else {
        // Extract and return the max ID
        const maxId = rows[0].max_id;
        
        // Increment the ID
        newId = prefix + (parseInt(maxId.substring(prefix.length)) + 1).toString().padStart(3, '0');
    }
    
    return newId;
}