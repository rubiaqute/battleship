import { AddShipsPayload, AttackResult, Game, Ship, SHOT_RESULT } from "./types"

interface ShipInfo {
    shipId: number,
    coords: CoordItem[]
}

interface CoordItem {
    x: number,
    y: number,
    isShotted: boolean
}

interface Attack {
    x: number,
    y: number,
    isShoted: boolean
}

export class Battleship {
    gameInfo
    ships: {
        id: number;
        ships: ShipInfo[];
    }[]
    attacks: {
        id: number;
        attacks: AttackResult[];
    }[]

    constructor(gameInfo: {
        id: number,
        ships: Ship[]
    }[]) {
        this.gameInfo = gameInfo
        this.ships = this.gameInfo.map((player) => ({
            id: player.id,
            ships: []
        }))
        this.attacks = this.gameInfo.map((player) => ({
            id: player.id,
            attacks: []
        }))
    }

    startGame() {
        this.createShipsCoords()
    }

    updateShipsInfo(payload: AddShipsPayload) {
        const playerForShipsUpdate = this.gameInfo.find((player)=> player.id === payload.indexPlayer)
        
        if (playerForShipsUpdate) {
            playerForShipsUpdate.ships = payload.ships
        }
        
    }

    createShipsCoords() {
        this.gameInfo.forEach((player)=> {
            const shipListIndex = this.ships.findIndex((shipsList) => shipsList.id === player.id)

            player.ships.forEach((ship, index)=> {
                const addX = ship.direction ? 0 : 1
                const addY = ship.direction ? 1 : 0

                const newShip: ShipInfo = {
                    shipId: index,
                    coords: [] 
                }

                for (let i = 0; i < ship.length; i++) {
                    newShip.coords.push({
                        x: ship.position.x + i * addX,
                        y: ship.position.y + i * addY,
                        isShotted: false
                    })
                }

                this.ships[shipListIndex].ships.push(newShip)              
            })
        })
    }

    isShipKilled(ship: ShipInfo) {
        return ship.coords.every((coordItem)=> Boolean(coordItem.isShotted))
    }

    isCoordItemShot(coordItem: CoordItem, {x,y}: {x:number, y: number}) {
        return coordItem.x === x && coordItem.y === y
    }

    attack(playerId: number, position: {x:number, y: number}) {
        const attackIndex = this.attacks.findIndex((attack)=> attack.id === playerId)
        const enemyIndex = this.ships.findIndex((shipList)=> shipList.id !== playerId)

        const possibleShip = this.ships[enemyIndex].ships.find((ship) => ship.coords.some((coordItem) => this.isCoordItemShot(coordItem, position)))
        let resultList: AttackResult[] = []

            if (!possibleShip) {
                resultList.push({
                    position,
                    status: SHOT_RESULT.miss
                })
            } else {
                const updatedCoords = possibleShip.coords.find((coordItem) => this.isCoordItemShot(coordItem, position))

                if (updatedCoords) {
                    updatedCoords.isShotted = true
                }

                if (this.isShipKilled(possibleShip)) {
                    resultList = [...possibleShip.coords.map((coordItem)=>({
                        position: {
                            x: coordItem.x,
                            y: coordItem.y,
                        },
                        status: SHOT_RESULT.killed
                    })), ...this.getAroundShipCells(possibleShip).map((coordItem)=>({
                        position: coordItem,
                        status: SHOT_RESULT.miss
                    }))]
                } else {
                    resultList.push({
                        position,
                        status: SHOT_RESULT.shot
                    })
                }
            }
        this.attacks[attackIndex].attacks.push(...resultList)
        return resultList
    }

    getAroundShipCells(ship: ShipInfo) {
        return ship.coords.reduce<{x: number, y: number}[]>((acc, coordItem) => {
            const possibleCoords = [
                {
                    x: coordItem.x - 1,
                    y: coordItem.y
                }, 
                {
                    x: coordItem.x -1,
                    y: coordItem.y -1,
                },
                {
                    x: coordItem.x - 1,
                    y: coordItem.y + 1,
                },
                {
                    x: coordItem.x,
                    y: coordItem.y - 1,
                }, 
                {
                    x: coordItem.x,
                    y: coordItem.y + 1,
                },
                {
                    x: coordItem.x + 1,
                    y: coordItem.y - 1,
                },
                {
                    x: coordItem.x + 1,
                    y: coordItem.y + 1,
                },
                {
                    x: coordItem.x + 1,
                    y: coordItem.y,
                }].filter((coords)=> coords.x >= 0 && coords.y >= 0 && !ship.coords.some((shipCoords)=> this.isCoordItemShot(shipCoords, coords)))
                acc.push(...possibleCoords)
            return acc
        }, [])

    }
}