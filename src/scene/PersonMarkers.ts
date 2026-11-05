import * as THREE from 'three'
import { latLonToVec3 } from './latLon'
import type { PersonPlace } from '../data/model'

/**
 * 人物活动地点标记（PHASE C1）：人物卡打开时在地球显示紫色八面体标记。
 * 与事件棱柱、历史航线用色区分（#f0abfc）；只标点、不连路径（非轨迹）。
 */
export class PersonMarkers {
  readonly root = new THREE.Group()
  private meshes: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this.root.visible = false
    scene.add(this.root)
  }

  setPlaces(places: PersonPlace[] | null): void {
    for (const m of this.meshes) {
      this.root.remove(m)
      m.geometry.dispose()
      ;(m.material as THREE.Material).dispose()
    }
    this.meshes = []
    if (!places || places.length === 0) {
      this.root.visible = false
      return
    }
    for (const pl of places) {
      const dot = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.011),
        new THREE.MeshBasicMaterial({ color: 0xf0abfc, transparent: true, opacity: 0.92, depthWrite: false }),
      )
      dot.position.copy(latLonToVec3(pl.lat, pl.lon, 1.006))
      this.root.add(dot)
      this.meshes.push(dot)
    }
    this.root.visible = true
  }
}
