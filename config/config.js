const database_name = "alubee-erp-dev";

const table = {
    login: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_LOGIN_TABLE',
    prospect_main: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_MAIL_TABLE',
    prospect_status: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_STATUS_TABLE',
    customer: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_CUST_TABLE',
    prospect: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_PROS_TABLE',
    enquiry_view: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_ENQUIRY_VIEW',
    enquiry_close_desc: database_name+'.'+'ALUBEE_ERP_DEV.ALUB_DESCRIPTION_TABLE'

};

const imap_config = {
    user: 'alubee.erp@gmail.com', // vigneshkumargcp@gmail.com
    password: 'atao axsp pjyu ylyw', // bqxz ptvn jywx rkoy
    host: 'imap.gmail.com'
};


export {
    database_name,
    table,
    imap_config
}