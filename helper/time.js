
function timeFormat(){

    //================================== indian time =========================
    // const utcDate = new Date();
    // const utcYear = utcDate.getFullYear();
    // const utcMonth = utcDate.getMonth() + 1; // Months are 0-indexed
    // const utcDay = utcDate.getDate();
    // const utcHours = utcDate.getHours();
    // const utcMinutes = utcDate.getMinutes();
    // const utcSeconds = utcDate.getSeconds();

    // const format = `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;


    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    const seconds = now.getUTCSeconds().toString().padStart(2, '0');
    
    const format = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return format;
}

export default timeFormat;