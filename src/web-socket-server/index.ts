import { WebSocketServer, createWebSocketStream, WebSocket } from 'ws';

export const initWsServer = () => {

    const WS_PORT = 3000
    const webSocketServer = new WebSocketServer({ port: WS_PORT }, () => console.log('Web Socket server started on the 3000 port!'));

    webSocketServer.on('connection', (ws: WebSocket, req) => {
        const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false })

        console.log((`WS_params:${JSON.stringify(req.socket.address())}`))

        wsStream.on('data', async (data: string) => {
            console.log(data)
            const command = data.split(' ')[0]

        })

        wsStream.on('close', () => {
            wsStream.end()
        })
    })
}