import { AddShipsPayload, CreatePlayerPayload, Game, Player, Room, Winner } from "./types";

const players: Player[] = []
const rooms: Room[] = []
const winners: Winner[] = []
const games: Game[] = []

export const createPlayer = ({name, password}: CreatePlayerPayload)=> {
    const newPlayer: Player = {
        name,
        password,
        index: players.length + 1
    }
    players.push(newPlayer)

    return {
        name: newPlayer.name,
        index: newPlayer.index
    }
}

const getPlayer = (playerId: number) => {
    return players.find((player) => player.index === playerId)
}

const getGameIndex = (gameId: number) => {
    return games.findIndex((game) => game.idGame === gameId)
}

export const getGame = (gameId: number) => {
    return games.find((game) => game.idGame === gameId)
}

const getRoomIndex = (roomId: number) => {
    return rooms.findIndex((room) => room.roomId === roomId)
}

export const getRoomsWithOnePlayer = () => {
    return rooms.filter((room)=> room.roomUsers.length === 1)
}

export const createRoom = (currentPlayerId: number) => {
    const currentPlayer = getPlayer(currentPlayerId)

    if (currentPlayer) {
        const newRoom = {
            roomId: rooms.length + 1,
            roomUsers: [{
                name: currentPlayer.name,
                index: currentPlayer.index
            }]
        }

       rooms.push(newRoom)
    }
}

export const addUserToRoom = (currentPlayerId: number, roomId: number) => {
    const currentPlayer = getPlayer(currentPlayerId)
    const roomToIndex = getRoomIndex(roomId)

    if (currentPlayer && roomToIndex !== -1) {
        rooms[roomToIndex].roomUsers.push({
            name: currentPlayer.name,
            index: currentPlayer.index
        })

        return rooms[roomToIndex].roomUsers.map((user)=> user.index)
    }
}

export const createGame = (playersId: number[])=> {
    const newGame: Game = {
        turn: playersId[0],
        players: playersId.map((id)=>({
            id,
            ships: []
        })),
        idGame: games.length + 1
    }

    games.push(newGame)

    return newGame.idGame
}

export const addShips = (payload: AddShipsPayload) => {
    const gameIndex = getGameIndex(payload.gameId)

    games[gameIndex].players = games[gameIndex].players.map((player)=> {
        if (player.id === payload.indexPlayer) {
            player.ships = payload.ships
        }

        return player
    })

    return games[gameIndex]
}

export const updateTurn = (gameId: number) => {
    const gameIndex = getGameIndex(gameId)
    const nextTurn = games[gameIndex].players.find((player) => player.id !== games[gameIndex].turn)?.id

    if (nextTurn) {
        games[gameIndex].turn = nextTurn
    }

    return nextTurn
}