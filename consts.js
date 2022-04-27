const headers = require("./headers");
const handler = {
  error(res, err) {
    res.writeHead(400, headers)
    res.write(JSON.stringify({
      status: 'false',
      message: err || 'Something went wrong!'　//test
    }))
    res.end()
  },
  success(res, data) {
    res.writeHead(200, headers)
    res.write(JSON.stringify({
      status: 'success',
      data: data
    }))
    res.end()
  }
}

module.exports = handler