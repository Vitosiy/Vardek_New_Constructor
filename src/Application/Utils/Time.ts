import * as THREE from "three"
import { EventEmitter } from "./EventEmitter";

export class Time extends EventEmitter {
    clock: THREE.Clock
    prev:number
    constructor() {

        super();

        this.clock = new THREE.Clock();
        this.prev = 0

        this.tick = this.tick.bind(this)

        window.requestAnimationFrame(this.tick)
    }

    tick(): void {

        const elapsedTime:number = this.clock.getElapsedTime();
        let delta = elapsedTime - this.prev;
        this.prev = delta;

        this.trigger('tick')

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }
}