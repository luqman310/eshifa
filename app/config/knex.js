var knex = require('knex');

const conn = knex({
	client: 'oracledb',
	connection: {
		// host: process.env.ORACLE_HOST,
		user: process.env.ORACLE_USER,
		password: process.env.ORACLE_PASS,
		connectString: `(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = ${process.env.ORACLE_HOST})(PORT = ${process.env.ORACLE_PORT})) (CONNECT_DATA = (SERVER = DEDICATED) (SERVICE_NAME = ${process.env.ORACLE_DB})))`
		// database: process.env.ORACLE_DB,
		// port: process.env.ORACLE_PORT,
	},
	fetchAsString: ['date', 'clob'],
	"wrapIdentifier": (value, origImpl, queryContext) => origImpl(value.toUpperCase())
});

module.exports = conn;