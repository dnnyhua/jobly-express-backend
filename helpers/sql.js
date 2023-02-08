const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Helper function to update selected columns
 * 
 * We are converting JS data to SQL so that it can be used in the SET clause of a SQL UPDATE
 * 
 * dataToUpdate - is from req.body {firstName: 'Aliya', age: 32} 
 * 
 * jsToSql - is used as a template to convert JS name to SQL col names {firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"}
 * some of the names do not need to be in the "template" because they are the same in postgresDB
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
