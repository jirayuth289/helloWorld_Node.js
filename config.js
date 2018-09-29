/*
*Create and export configuration variable
*
*/

//Container for all the developments
const environments = {};

// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging'
};

//Production environment
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production'
};

//Detwermine which environment was passed as a command-line argument
const currentEnironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check that the current environment is one of the environment above, if not, default to staging
const environmentToExport = typeof (environments[currentEnironment]) === 'object' ? environments[currentEnironment] : environments.staging;

//Export to module
module.exports = environmentToExport;

