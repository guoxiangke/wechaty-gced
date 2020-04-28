var client = require('../../redis/client')
client.select('15')
// https://blog.csdn.net/q282176713/article/details/80580886
// https://www.cnblogs.com/zhaowinter/p/10776868.html
client.set('hello', 'This is a value')

client.get('hello', function (err, v) {
    console.log('redis get hello err,v', err, v)
})

// client.set('hello', { name: 'jacky', age: 22 })

// client.get('hello', function (err, v) {
//     console.log('redis get hello err,v', err, v)
// })

// 列表 - List
//先清除数据
client.del('testLists')
client.rpush('testLists', 'a')
client.rpush('testLists', 'b')
client.rpush('testLists', 'c')
client.rpush('testLists', 'd')
client.rpush('testLists', 'e')
client.rpush('testLists', '1')

client.lpop('testLists', function (err, v) {
    console.log('client.lpop , err , v : ', err, v)
})

client.rpop('testLists', function (err, v) {
    console.log('client.rpop , err, v ', err, v)
})

client.lrange('testLists', 0, -1, function (err, lists) {
    console.log('client.lrange , err ,lists: ', err, lists)
})
