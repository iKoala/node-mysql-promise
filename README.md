### node-mysql-promise
Node.js MySQL library promise wrapper

### Initialization
> npm install @ikoala/node-mysql-promise

### Usage
```javascript
const db = require('@ikoala/node-mysql-promise')
const mysqlConfig = {
  "host": "127.0.0.1",
  "user": "root",
  "password": "abc@123",
  "database": "test"
}
db.create('master', mysqlConfig)

const query = async (val) => {
  const sql = 'SELECT NOW(), ?, 1'
  const params = [val]
  const rs = await db.query(sql, params)
  console.log(rs) // 2020-02-01 15:56:00,foo,1
}

query('foo')
```

### Helper Functions
```javascript
const select = helper.createSelect('table_name', 'primary_key_field');
(async () => {
  await select({ all: true }) // Select all records
  await select(1) // Select primary key id 1
  // Select field `foo` with value `bar`
  await select({ where: {
    foo: 'bar'
  }})
})()

const insert = helper.createInsert('table_name', 'primary_key_field', {
  defaultFields: {
    ctime: () => new Date()
  }
});
(async () => {
  await insert({
    field1: 'foo',
    field2: 'bar'
  }) // foo,bar,[ctime date]
})()
```

# Testing
npm test

# Dependencies:
[mysql - Node.js MySQL driver](https://www.npmjs.com/package/mysql)
