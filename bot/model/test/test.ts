const { db } = require('../db.config')
async function initTest() {
    await db.sync({ force: true })
}
export { initTest }
