
const http = require('http')
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const handler = require('./consts');
// models
const Room = require('./models/room')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)
mongoose.connect(DB, { connectTimeoutMS: 1000 })
  .then(() => {
    console.log('連線成功');
  });



// Room.create({
//   name: '西格瑪單人房',
//   price: 100,
//   ratting: 5.0
// }).then(() => {
//   console.log('新增成功');
// }).catch(err => {
//   console.log('catch error: ', err.errors);
// })


// Room.findByIdAndUpdate('625ba89688ead86fdf137ce2', {
//   name: '1234569567'
// }).then(() => {
//   console.log('更新成功');
// }).catch(err => {
//   console.log('catch err', err);
// })
const requestListener = async (req, res) => {

  let body = ''
  req.on('data', chunk => {// POST & PATCH 取得封包
    body += chunk
  })

  console.log(body);
  if (req.url == '/rooms' && req.method == 'GET') {
    const rooms = await Room.find()
    handler.success(res, rooms)
  } else if (req.url == '/rooms' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const newRoom = await Room.create(
          {
            name: data.name,
            price: data.price,
            ratting: data.ratting
          }
        )
        handler.success(res, newRoom)

      } catch (err) {
        console.log('catch err: ', err);
        handler.error(res)

      }
    })
  } else if (req.url.startsWith('/rooms/') && req.method == 'PATCH') {
    const id = req.url.split('/').pop()
    req.on('end', async () => {

      try {
        const data = JSON.parse(body)
        console.log('PATCH:', data);
        await Room.findByIdAndUpdate(id, data)
        handler.success(res, '更新成功')
      } catch (error) {
        handler.error(res)
      }
    })

  } else if (req.url.startsWith('/rooms/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop()
    try {
      Room.findByIdAndDelete(id)
      handler.success(res, '刪除成功')
    } catch (error) {
      handler.error(res)
    }

  } else {
    res.writeHead(404, headers)
    res.write('404 Not found!')
    res.end()
  }

}

const server = http.createServer(requestListener)
server.listen(process.env.PORT)