const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
// Creates queries for objects
// dataToUpdate is the data we want to update
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
//joins the line together
  return {
    setCols: cols.join(", "),
    //sets the new values in the sql statement
    values: Object.values(dataToUpdate),
  };
}

/**  Transforms data into SQLable format for GET all filtered functions.
 Query data keys become "key1(operator)$1, key2(operator)$2, etc"
 Values become [value1, value2, etc] */
// Basically turns the data into a language that is readbale for sql
// 

function sqlForFilter(query){
    const keys = Object.keys(query);

    let cols = [];
    let values = [];

    for (let i = 0; i < keys.length; i++){
      if (keys[i] === "name"){
        cols.push(`${keys[i]} ILIKE $${i + 1}`)
        console.log(`COLS1:${cols}`)
        values.push(`%${query.name}%`)
      }
      if (keys[i] === "minEmployees"){
        cols.push(`num_employees >= $${i + 1}`)
        console.log(`COLS2:${cols}`)
        values.push(parseInt(query.minEmployees))
      }
      if (keys[i] === "maxEmployees"){
        cols.push(`num_employees <= $${i + 1}`)
        console.log(`COLS3:${cols}`)
        values.push(parseInt(query.maxEmployees))
      }
      if (keys[i] === "title"){
        cols.push(`${keys[i]} ILIKE $${i + 1}`)
        values.push(`%${query.title}%`)
      }
      if (keys[i] === "minSalary"){
        cols.push(`salary >= $${i + 1}`)
        values.push(parseInt(query.minSalary))
      }
      if ((keys[i] === "hasEquity") && (query.hasEquity === 'true')){
        cols.push(`equity > $${i + 1}`)
        values.push(0)
      }
    }
    
    return {
      cols: cols.join(" AND "),
      values: values,
    };
}

function checkCompanyQuery(query){
  const keys = Object.keys(query);

  // Checks to see if the query was input correct and has correct fields
  for (let key of keys){
    if (key !== "name" && key !== "minEmployees" && key !== "maxEmployees"){
      throw new BadRequestError(`Value not found: ${key}`)
    }
  }

  // Makes sure that a number has been implemented
  if ((query.minEmployees && isNaN(parseInt(query.minEmployees))) || 
        (query.maxEmployees && isNaN(parseInt(query.maxEmployees)))){
    throw new BadRequestError("min and maxEmployees must be numbers")
  }

  // Makes sure that minEmployees is less than maxEmployees 
  if (query.minEmployees && query.maxEmployees && 
        (parseInt(query.minEmployees) > parseInt(query.maxEmployees))){
    throw new BadRequestError(`maxEmployees must be greater than minEmployees`)
  }
}



function getSqlWhereJobFilters(filter) {
  const { title, minSalary, hasEquity } = filter;

  let sqlFilter = '';
  // if filters are added create a where clause
  if (title || minSalary || hasEquity) {
    // makes sql ready statements as necessary for each filter
    // Create SQL statement for each filter as it would appear in WHERE Clause (if exists)
    let titleSql = title ? `title ILIKE '%${title}%'` : '';
    let minSalarySql = minSalary
      ? `${titleSql ? 'AND ' : ''}salary >= ${minSalary}`
      : '';
    let hasEquitySql = hasEquity
      ? `${titleSql || minSalarySql ? 'AND ' : ''}equity > 0`
      : '';

    // Concatenate filter statements into one WHERE clause string
    sqlFilter = `
        WHERE
          ${titleSql} ${minSalarySql} ${hasEquitySql}
      `;
  }
  return sqlFilter;
}


module.exports = { sqlForPartialUpdate, sqlForFilter, checkCompanyQuery, getSqlWhereJobFilters };
