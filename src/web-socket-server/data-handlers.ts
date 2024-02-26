import { Battleship } from "./game";
import { AddShipsPayload, Attack, CreatePlayerPayload, Game, Player, Room, Winner } from "./types";

const players: Player[] = []
const rooms: Room[] = []
export const winners: Winner[] = []
let games: Game[] = []

export const createPlayer = ({name, password}: CreatePlayerPayload)=> {
    if (!isPlayerLoggedIn(name, password)) {
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
    } else return null
   
}

const isPlayerLoggedIn = ( name: string, password: string)=> {
    return Boolean(players.find((player)=> player.name === name && player.password === password))
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

export const addUserToRoom = (currentPlayerId: number, { indexRoom }:{indexRoom: number}) => {
    const currentPlayer = getPlayer(currentPlayerId)
    const roomToIndex = getRoomIndex(indexRoom)
    const isUserAlreadyInRoom = rooms[roomToIndex].roomUsers.find((user) => user.index === currentPlayerId)

    if (currentPlayer && roomToIndex !== -1 && !isUserAlreadyInRoom) {
        rooms[roomToIndex].roomUsers.push({
            name: currentPlayer.name,
            index: currentPlayer.index
        })

        return rooms[roomToIndex].roomUsers.map((user)=> user.index)
    }
}

export const deleteGame = (gamId: number)=> {
    games = games.filter((game)=> game.idGame !== gamId)
}

export const createGame = (playersId: number[])=> {
    const newGame: Game = {
        turn: playersId[0],
        players: playersId.map((id)=>({
            id,
            ships: []
        })),
        battleShip: new Battleship(playersId.map((id) => ({
            id,
            ships: []
        }))),
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
            games[gameIndex].battleShip.updateShipsInfo(payload)
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

export const getEnemyId = (gameId: number) => {
    const gameIndex = getGameIndex(gameId)

   return games[gameIndex].players.find((player) => player.id !== games[gameIndex].turn)?.id
}

export const startGame = (gameId: number) => {
    const gameIndex = getGameIndex(gameId)

    games[gameIndex].battleShip.startGame()
}

export const attackShip = (attackInfo: Attack) => {
    const gameIndex = getGameIndex(attackInfo.gameId)

    return (attackInfo.indexPlayer === games[gameIndex].turn) ?
         games[gameIndex].battleShip.attack(attackInfo.indexPlayer, { x: attackInfo.x, y: attackInfo.y }) : []
    
}

export const randomAttackShip = (attackInfo: Pick<Attack, 'gameId' | 'indexPlayer'>) => {
    const gameIndex = getGameIndex(attackInfo.gameId)

    return (attackInfo.indexPlayer === games[gameIndex].turn) ?
        games[gameIndex].battleShip.randomAttack(attackInfo.indexPlayer) : []

}

export const isGameFinished = (playerId: number, gameId: number)=> {
    const gameIndex = getGameIndex(gameId)

    return games[gameIndex].battleShip.areAllShipsKilled(playerId)
}

export const updateWinners = (playerId: number)=> {
    const playerName = getPlayer(playerId)?.name || ''
    const winner = winners.find((winner) => winner.name === playerName)

    if (winner) {
        winner.wins = winner.wins + 1
    } else {
        winners.push({
            name: playerName,
            wins: 1
        })
    }
}