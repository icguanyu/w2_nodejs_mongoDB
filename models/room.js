const mongoose = require('mongoose')
const roomSchema = new mongoose.Schema(
  {
    name: String,
    price: {
      type: Number,
      required: [true, "價格必填"]
    },
    ratting: Number
  }, {
  versionKey: false,
  timestamps: true
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room