require('dotenv').config()
const WebSocketServer = require('ws')
const jwt = require('jsonwebtoken')

const wss = new WebSocketServer.Server({ port: 8080 })

wss.on('connection', async (ws) => {
  let token = null
  let isBackend = false
  let authenticated = false

  setTimeout(() => {
    if (!authenticated) {
      ws.send('No authorization sent')
      ws.terminate()
    }
  }, 5000)

  ws.on('message', (message) => {
    let payload
    try {
      payload = JSON.parse(message.toString())
    } catch (err) {
      ws.send("Invalid message, couldn't parse JSON")
      ws.terminate()
      return
    }

    if (payload.hasOwnProperty('auth')) {
      try {
        token = jwt.verify(payload.auth, process.env.JWT_SECRET)
      } catch(err) {
        ws.send('Invalid authorization')
        ws.terminate()
        return
      }
      authenticated = true

      ws.send('Authenticated user: ' + token.id)

      if (token.role === 'server') {
        isBackend = true
      }
      return
    }

    if (payload.hasOwnProperty('subscribe_to')) {
      console.log('Going to subscribe user ' + token.id + ' to chat ' + payload.subscribe_to)
      // add ws to rooms[chat_id]
      // add chat_id to user_subscriptions[token.id]
      return
    }

    if (isBackend && payload.hasOwnProperty('chat_id')) {
      console.log('Received message: ' + payload.message)
      // forward to everyone in rooms[chat_id]
      // rooms[chat_id].map(w => w.send(message))
      // does this need a 'any exist' check before it?
    }
  })


  ws.on('close', () => {
    // go through user_subscriptions[token.id]
    // and for every value of chat_id in it remove
    // this ws from rooms[that chat_id]
    // then clear user_subscriptions[token.id]
  })

  ws.send('hello my friend')
})