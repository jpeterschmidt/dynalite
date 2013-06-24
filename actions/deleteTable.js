var db = require('../db')

module.exports = function deleteTable(data, cb) {

  var key = data.TableName

  db.getTable(key, function(err, table) {
    if (err) return cb(err)

    // Check if table is ACTIVE or not?
    if (table.TableStatus == 'CREATING') {
      err = new Error
      err.statusCode = 400
      err.body = {
        __type: 'com.amazonaws.dynamodb.v20120810#ResourceInUseException',
        message: 'Attempt to change a resource which is still in use: Table is being created: ' + key,
      }
      return cb(err)
    }

    table.TableStatus = 'DELETING'

    db.tableDb.put(key, table, function(err) {
      if (err) return cb(err)

      setTimeout(function() {
        // TODO: Delete items too
        db.tableDb.del(key, function(err) {
          // TODO: Need to check this
          if (err) console.error(err)
        })
      }, db.deleteTableMs)

      cb(null, {TableDescription: table})
    })
  })

}


