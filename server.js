
const http = require('http')
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const handler = require('./consts');
const headers = require("./headers");
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
  if (req.url == '/post' && req.method == 'GET') {
    const posts = await Post.find()
    handler.success(res, posts)
  } else if (req.url == '/post' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const newPost = await Post.create(
          {
            name: data.name,
            content: data.content,
            type: data.type,
            tags: data.tags,
            images: data.images
          }
        )
        handler.success(res, newPost)

      } catch (err) {
        console.log('catch err: ', err);
        handler.error(res, err.errors.content)

      }
    })
  } else if (req.url.startsWith('/post/') && req.method == 'PATCH') {

    req.on('end', async () => {
      const id = req.url.split('/').pop()
      const data = JSON.parse(body)
      try {
        if (data.content && data.name) {
          // 再次檢查要更新的資料欄位不得為空
          let updatePost = await Post.findByIdAndUpdate(id, data)
          if (updatePost !== null) {
            handler.success(res, '更新成功')
          } else {
            handler.error(res, '文章不存在哦!')
          }
        } else {
          handler.error(res, '欄位有缺哦!')
        }
      } catch (error) {
        handler.error(res, '文章不存在哦!')
      }

    })

  } else if (req.url.startsWith('/post/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop()

    // console.log('刪除:', id)
    // 刪除所有 = Post.deleteMany({})
    let post = await Post.findByIdAndDelete(id)
    if (post !== null) {
      handler.success(res, post)
    } else {
      handler.error(res, '文章不存在哦!')
    }

  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "404 Not Found",
      })
    );
    res.end();
  }

}

const server = http.createServer(requestListener)
server.listen(process.env.PORT)