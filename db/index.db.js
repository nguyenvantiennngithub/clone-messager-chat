const db = require('./connect.db')

async function connect(){
    try{
        await db.connect(()=>{
            console.log('Connect successfully')
        })
    }
    catch{
        console.log('Connect failure')
    }
}

module.exports = connect