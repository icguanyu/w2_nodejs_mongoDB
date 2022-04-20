const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '標題必填']
    },
    description: String,
    content: String,
    author: String,
    cover: String,
    score: Number
  }, {
  versionKey: false,
  timestamps: true
})

const Post = mongoose.model('posts', postSchema)

module.exports = Post