import * as THREE from 'three'

/**
 * 经纬度 → 球面坐标（three.js 默认 equirectangular 贴图约定）
 * 与主流 three.js 地球教程一致，保证贴图大陆与事件坐标对齐。
 */
export function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}
