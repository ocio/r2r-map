import * as THREE from 'three'
import { OWNER } from './const'
import BUILDING from './config/sprites/building'
import ARMY from './config/sprites/army'
import DECORATIVE from './config/sprites/decorative'
import { TILE_OWNER_CLASSES } from './config/ui'
import createTileFactory from './factories/createTileFactory'
import createArmyFactory from './factories/createArmyFactory'

export default function createApi({ tiles, armys, ui, camera, sceneSprites }) {
    const createTile = createTileFactory({
        ui,
        camera,
        scene: sceneSprites
    })
    const createArmy = createArmyFactory({
        ui,
        camera,
        scene: sceneSprites
    })
    return {
        createArmy: ({ id, fromTileId, toTileId }) => {
            return createArmyObject({
                createArmy,
                armys,
                tiles,
                id,
                fromTileId,
                toTileId
            })
        },
        createVillage: ({ id, col, row }) => {
            return createTileObject({
                id,
                createTile,
                col,
                row,
                spriteConf: BUILDING.VILLAGE,
                tiles
            })
        },
        createCottage: ({ id, col, row }) => {
            return createTileObject({
                id,
                createTile,
                col,
                row,
                spriteConf: BUILDING.COTTAGE,
                tiles
            })
        },
        changeRecruitmentPower: (idTile, power) => {
            const tile = getTileById({ tiles, idTile })
            tile.changeRecruitmentPower(power)
        },
        addOwnerAsPlayer: (idTile, idOwner, name = '', units = 0) => {
            const tile = getTileById({ tiles, idTile })
            tile.addOwner(idOwner)
            tile.changeOwner(idOwner, TILE_OWNER_CLASSES[OWNER.PLAYER])
            tile.changeName(idOwner, name)
            tile.changeUnits(idOwner, units)
        },
        addOwnerAsEnemy: (idTile, idOwner, name = '', units = 0) => {
            const tile = getTileById({ tiles, idTile })
            tile.addOwner(idOwner)
            tile.changeOwner(idOwner, TILE_OWNER_CLASSES[OWNER.ENEMY])
            tile.changeName(idOwner, name)
            tile.changeUnits(idOwner, units)
        },
        removeOwner: (idTile, idOwner) => {
            const tile = getTileById({ tiles, idTile })
            tile.removeOwner(idOwner)
        },
        changeUnits: (idTile, idOwner, units) => {
            const tile = getTileById({ tiles, idTile })
            tile.changeUnits(idOwner, units)
        },
        startHighlight: idTile => {
            const tile = getTileById({ tiles, idTile })
            tile.startHighlight()
        },
        stopHighlight: idTile => {
            const tile = getTileById({ tiles, idTile })
            tile.stopHighlight()
        },
        changeUnits: (idArmy, units) => {
            const army = getArmyById({ armys, idArmy })
            army.changeUnits(units)
        },
        changeDistance: (idArmy, distance) => {
            const army = getArmyById({ armys, idArmy })
            const x = (distance * army.diffX) / 100
            const z = (distance * army.diffZ) / 100
            const newX = x + army.fromX
            const newZ = z + army.fromZ
            army.changePosition({
                x: newX,
                z: newZ
            })
        }
    }
}

// Private
function getTileById({ tiles, idTile }) {
    return tiles.find(tile => tile.id === idTile)
}

function getArmyById({ armys, idArmy }) {
    return armys.find(army => army.id === idArmy)
}

function createTileObject({ id, createTile, col, row, spriteConf, tiles }) {
    const tile = createTile({
        x: col,
        z: row,
        spriteConf
    })
    tile.id = id
    tile.x = col
    tile.z = row
    tile.area = spriteConf.area
    tiles.push(tile)
    return tile
}

function createArmyObject({
    createArmy,
    armys,
    tiles,
    id,
    fromTileId,
    toTileId
}) {
    const from = getTileById({ tiles, idTile: fromTileId })
    const to = getTileById({ tiles, idTile: toTileId })
    const fromX = from.x
    const fromZ = from.z
    const toX = to.x
    const toZ = to.z
    const army = createArmy({
        x: fromX,
        z: fromZ,
        spriteConf: ARMY.ARMY
    })

    const fromVector = new THREE.Vector2(fromX, fromZ)
    const toVector = new THREE.Vector2(toX, toZ)
    const fromVectorReduced = fromVector
        .clone()
        .sub(toVector)
        .normalize()
        .multiplyScalar(-from.area)
        .add(fromVector)
    const toVectorReduced = toVector
        .clone()
        .sub(fromVector)
        .normalize()
        .multiplyScalar(-to.area)
        .add(toVector)
    const diffX = toVectorReduced.x - fromVectorReduced.x
    const diffZ = toVectorReduced.y - fromVectorReduced.y

    // const helper = new THREE.AxesHelper(10)
    // helper.position.x = fromVectorReduced.x
    // helper.position.z = fromVectorReduced.y
    // sceneSprites.add(helper)

    // const helper2 = new THREE.AxesHelper(10)
    // helper2.position.x = toVectorReduced.x
    // helper2.position.z = toVectorReduced.y
    // sceneSprites.add(helper2)

    army.id = id
    army.diffX = diffX
    army.diffZ = diffZ
    army.fromX = fromVectorReduced.x
    army.fromZ = fromVectorReduced.y
    armys.push(army)

    return army
}

// //
// canvas.addEventListener('click', e => {
//     console.log(e, tiles.map(tile => tile.div.element))
// })

// // Adding decorative sprites
// const spriteList = [
//     { id: 'tree1', frecuencyRatio: 8 },
//     { id: 'tree2', frecuencyRatio: 8 },
//     { id: 'tree3', frecuencyRatio: 40 },
//     { id: 'tree4', frecuencyRatio: 8 },
//     { id: 'bush1', frecuencyRatio: 5 },
//     // { id: 'rock1', frecuencyRatio: 2 },
//     { id: 'rock2', frecuencyRatio: 3 },
//     { id: 'trunk1', frecuencyRatio: 10 },
//     { id: 'trunk2', frecuencyRatio: 10 }
// ]
// const sprites = generateRandomDecorativeSprites({
//     quantity: 500,
//     sprites: spriteList,
//     point1: { x: -100, z: -100 },
//     point2: { x: 100, z: 100 },
//     ignoreAreas: [{ x: 0, z: 0, radius: 5 }, { x: 10, z: 5, radius: 3 }]
// })
// sprites.forEach(sprite => {
//     createDecorativeSprite({
//         scene: sceneSprites,
//         x: sprite.x,
//         z: sprite.z,
//         spriteConf: spritesConfig[sprite.id]
//     })
// })
