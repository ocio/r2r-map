import * as THREE from 'three'
import { OWNER, ELEMENT_TYPE } from '../const'
import { VILLAGE, COTTAGE, TROOPS } from '../config/sprites/animated'
// import { LINE } from '../config/sprites/svg'
import { DECORATIVE_ITEMS } from '../config/parameters'
import DECORATIVE from '../config/sprites/decorative'
import { screenToWorld } from '../three/utils'
import TileFactory from '../three/TileFactory'
import TroopsFactory from '../three/TroopsFactory'
import LineFactory from '../three/LineFactory'
import SpriteDecorative from '../three/SpriteDecorative'
import { generateRandomDecorativeSprites } from '../three/utils'
import createTroops from './createTroops'
import { getTileById, getTroopsById, getLineById } from './getters'
import { getPositionByCordinate } from '../utils/hexagons'

export const TILE_OWNER_CLASSES = {
    [OWNER.PLAYER]: 'tileOwner player',
    [OWNER.ENEMY]: 'tileOwner enemy'
}

export default function createApi({
    ui,
    camera,
    sceneSprites,
    sceneTerrain,
    hexagonSize,
    initialZoom
}) {
    // STATE
    const state = { currentZoom: initialZoom }
    const tiles = []
    const troopss = []
    const lines = []
    const createTileSprite = TileFactory({
        ui,
        camera,
        scene: sceneSprites
    })
    const createTroopsSprite = TroopsFactory({
        ui,
        camera,
        sceneSprites,
        sceneTerrain
    })
    const createLineSprite = LineFactory({
        ui,
        camera,
        scene: sceneTerrain
    })

    return {
        getTiles: () => {
            return tiles
        },
        updateZoom: ({ zoom }) => {
            state.currentZoom = zoom
            tiles.forEach(tile => tile.updateScaleDiv(zoom, initialZoom))
            troopss.forEach(troops => troops.updateScaleDiv(zoom, initialZoom))
        },
        updatePan: ({ canvasWidth, canvasHeight }) => {
            tiles.forEach(tile =>
                tile.updatePositionDiv({
                    canvasWidth,
                    canvasHeight
                })
            )
            troopss.forEach(troops =>
                troops.updatePositionDiv({
                    canvasWidth,
                    canvasHeight
                })
            )
        },
        createVillage: ({ id, col, row }) => {
            const [x, z] = getPositionByCordinate({
                col,
                row,
                size: hexagonSize
            })
            const tile = createTileSprite({
                id,
                x,
                z,
                area: VILLAGE.area,
                spriteConf: VILLAGE,
                type: ELEMENT_TYPE.VILLAGE
            })
            tile.updateScaleDiv(state.currentZoom, initialZoom)
            tiles.push(tile)
            return tile
        },
        createCottage: ({ id, col, row }) => {
            const [x, z] = getPositionByCordinate({
                col,
                row,
                size: hexagonSize
            })
            const tile = createTileSprite({
                id,
                x,
                z,
                area: COTTAGE.area,
                spriteConf: COTTAGE,
                type: ELEMENT_TYPE.COTTAGE
            })
            tile.updateScaleDiv(state.currentZoom, initialZoom)
            tiles.push(tile)
            return tile
        },
        createTroops: ({ id, fromTileId, toTileId }) => {
            return createTroops({
                createTroopsSprite,
                troopss,
                tiles,
                id,
                fromTileId,
                toTileId,
                currentZoom: state.currentZoom,
                initialZoom
            })
        },
        createLine: ({ id, idTileFrom }) => {
            const tile = getTileById({ tiles, idTile: idTileFrom })
            const line = createLineSprite({
                id,
                fromX: tile.x,
                fromZ: tile.z
            })
            lines.push(line)
            return line
        },
        changeLineDirection: ({ idLine, x, z, status }) => {
            const line = getLineById({ lines, idLine })
            line.changeDirection({ toX: x, toZ: z, status })
        },
        removeLine: ({ idLine }) => {
            const line = getLineById({ lines, idLine })
            const index = lines.indexOf(line)
            lines.splice(index, 1)
            line.destroy()
        },
        changeRecruitmentPower: ({ idTile, power }) => {
            const tile = getTileById({ tiles, idTile })
            tile.changeRecruitmentPower(power)
        },
        addOwnerAsPlayer: ({ idTile, idOwner, name = '', units = 0 }) => {
            const tile = getTileById({ tiles, idTile })
            tile.addOwner(idOwner)
            tile.changeOwner(idOwner, TILE_OWNER_CLASSES[OWNER.PLAYER])
            tile.changeName(idOwner, name)
            tile.changeUnits(idOwner, units)
        },
        addOwnerAsEnemy: ({ idTile, idOwner, name = '', units = 0 }) => {
            const tile = getTileById({ tiles, idTile })
            tile.addOwner(idOwner)
            tile.changeOwner(idOwner, TILE_OWNER_CLASSES[OWNER.ENEMY])
            tile.changeName(idOwner, name)
            tile.changeUnits(idOwner, units)
        },
        removeOwner: ({ idTile, idOwner }) => {
            const tile = getTileById({ tiles, idTile })
            tile.removeOwner(idOwner)
        },
        changeUnits: ({ idTile, idOwner, units }) => {
            const tile = getTileById({ tiles, idTile })
            tile.changeUnits(idOwner, units)
        },
        startHighlight: ({ idTile }) => {
            const tile = getTileById({ tiles, idTile })
            tile.startHighlight()
        },
        stopHighlight: ({ idTile }) => {
            const tile = getTileById({ tiles, idTile })
            tile.stopHighlight()
        },
        highLightRed: ({ idTile }) => {
            const tile = getTileById({ tiles, idTile })
            tile.highLightRed()
        },
        removeTroops: ({ idTroops }) => {
            const troops = getTroopsById({ troopss, idTroops })
            const index = troopss.indexOf(troops)
            troopss.splice(index, 1)
            troops.destroy()
        },
        changeTroopsUnits: ({ idTroops, units }) => {
            const troops = getTroopsById({ troopss, idTroops })
            troops.changeUnits(units)
        },
        changeTroopsDistance: ({ idTroops, distance }) => {
            const troops = getTroopsById({ troopss, idTroops })
            const x = (distance * troops.diffX) / 100
            const z = (distance * troops.diffZ) / 100
            const newX = x + troops.fromX
            const newZ = z + troops.fromZ
            troops.changePosition({
                x: newX,
                z: newZ
            })
        },
        getWorldPositionFromMouse: ({
            mouseX,
            mouseY,
            camera,
            canvasWidth,
            canvasHeight,
            objects
        }) => {
            const intersections = screenToWorld({
                x: mouseX,
                y: mouseY,
                camera,
                canvasWidth,
                canvasHeight,
                objects
            })
            return intersections[0].point
        },
        selectInteractiveSprite: ({ x, z }) => {
            const vectorClick = new THREE.Vector2(x, z)
            const mapper = troopOrTile => {
                const vector = new THREE.Vector2(
                    troopOrTile.sprite.position.x,
                    troopOrTile.sprite.position.z
                )
                return {
                    type: troopOrTile.type,
                    distance: vectorClick.distanceTo(vector),
                    troopOrTile
                }
            }
            const filterer = item => item.distance < item.troopOrTile.area
            const sorter = (a, b) => a.distance - b.distance

            // Finding troops
            const troopsFound = troopss.map(mapper).filter(filterer)
            // Finding tiles
            const tilesFound = tiles.map(mapper).filter(filterer)
            return troopsFound.concat(tilesFound).sort(sorter)[0]
        },
        addDecorativeElements: () => {
            const ignoreAreas = tiles.map(tile => ({
                x: Math.round(tile.x),
                z: Math.round(tile.z),
                radius: tile.area
            }))
            const options = Object.assign({}, { ignoreAreas }, DECORATIVE_ITEMS)
            const spritesConfigs = generateRandomDecorativeSprites(options)
            spritesConfigs.forEach(spriteConfig => {
                const sprite = SpriteDecorative(DECORATIVE[spriteConfig.id])
                sprite.position.x = spriteConfig.x
                sprite.position.z = spriteConfig.z
                sceneSprites.add(sprite)
            })
        }
    }
}
