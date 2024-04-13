import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
    projectId: 'alubee-erp-dev',
    keyFilename: './keyfile.json',
});

export default bigquery;