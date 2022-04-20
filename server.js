
const http = require('http')
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const handler = require('./consts');
// models
const Post = require('./models/post')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)
mongoose.connect(DB, { connectTimeoutMS: 1000 })
  .then(() => {
    console.log('連線成功');
  });


const requestListener = async (req, res) => {

  let body = ''
  req.on('data', chunk => {// POST & PATCH 取得封包
    body += chunk
  })

  console.log(body);
  if (req.url == '/posts' && req.method == 'GET') {
    const posts = await Post.find()
    handler.success(res, posts)
  } else if (req.url == '/posts' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const newPost = await Post.create(
          {
            title: data.title,
            description: data.description,
            content: data.content,
            author: data.ratting,
            score: data.score,
            cover: data.cover
          }
        )
        handler.success(res, newPost)

      } catch (err) {
        console.log('catch err: ', err);
        handler.error(res, err)

      }
    })
  } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
    const id = req.url.split('/').pop()
    req.on('end', async () => {

      try {
        const data = JSON.parse(body)
        console.log('PATCH:', data);
        await Post.findByIdAndUpdate(id, data)
        handler.success(res, '更新成功')
      } catch (error) {
        handler.error(res)
      }
    })

  } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop()
    // console.log('刪除:', id)
    // 刪除所有 = Post.deleteMany({})
    Post.findByIdAndDelete(id).then(res => {
      console.log('刪除成功', res);
      handler.success(res, '刪除成功')
    }).catch(err => {
      console.log('刪除失敗', err);
      handler.error(res)
    })
  } else {
    handler.error(res)
  }

}

const server = http.createServer(requestListener)
server.listen(process.env.PORT)