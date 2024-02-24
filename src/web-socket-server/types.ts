import {WebSocket } from 'ws';
import { Battleship } from './game';

export interface CreatePlayerPayload  {
    name: string
    password: string
}

export interface AddUserToRoomPayload {
    indexRoom: number
}

export interface AddShipsPayload {
    gameId: number,
    ships: Ship[],
    indexPlayer: number
}

export interface Attack {
    gameId: number,
    x: number,
    y: number,
    indexPlayer: number
}

export interface AttackResult {
    position: {
        x: number,
        y: number
    }
    status: SHOT_RESULT
}

export interface Room {
    roomId: number
    roomUsers: {
        name: string,
        index: number
    }[]
}

export interface Player {
    name: string
    password: string
    index: number
}

export interface Game {
    idGame: number
    turn: number
    players: {
        id: number,
        ships: Ship[]
    }[]
    battleShip: Battleship
}

export interface Ship {
    position: {
        x: number,
        y: number,
    },
    direction: boolean,
    length: number,
    type: "small" | "medium" | "large" | "huge",
}

export enum SHOT_RESULT {
    miss='miss',
    shot='shot',
    killed='killed'
}

export type Winner = Pick<Player, 'name' | 'index'>

export enum COMMAND {
    reg='reg',
    createRoom= 'create_room',
    updateRoom ='update_room',
    addUserToRoom = "add_user_to_room",
    createGame = "create_game",
    addShips = 'add_ships',
    startGame = "start_game",
    turn = "turn",
    attack = 'attack'
}

export interface Socket {
    id: number
    socket: WebSocket
    currentPlayer?: number
}