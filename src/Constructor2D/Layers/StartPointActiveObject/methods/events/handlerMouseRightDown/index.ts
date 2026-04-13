import * as PIXI from "pixi.js";
import { Events } from "@/store/constructor2d/events";
import { ObjectWall } from "@/Constructor2D/Layers/Planner/interfaces";
import { getAngleBetweenVectors } from "@/Constructor2D/utils/Math";

export function handlerMouseRightDown(this: any, e: PIXI.FederatedPointerEvent): void {
  const graphic = e.currentTarget as PIXI.Graphics & { indexPoint: number };
  const indexPoint = graphic.indexPoint;
  if (indexPoint !== 0) return;

  const activeWallId = this.parent.layers.planner.state.activeWall;
  if (!activeWallId) return;

  const wall: ObjectWall | undefined = this.parent.layers.planner.objectWalls.find(
    (el: ObjectWall) => el.id === activeWallId,
  );
  if (!wall?.mergeWalls?.wallPoint1) return;

  const mergeWall: ObjectWall | undefined = this.parent.layers.planner.objectWalls.find(
    (el: ObjectWall) => el.id === wall.mergeWalls.wallPoint1,
  );
  if (!mergeWall) return;

  const p0 = mergeWall.points[0];
  const p1 = wall.points[0];
  const p2 = wall.points[1];
  const vAngle = -getAngleBetweenVectors(p1, p0, p2);
  const currentAngle = vAngle < 0 ? 360 + vAngle : vAngle;

  const canvas = this.app.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const domX = rect.left + e.global.x;
  const domY = rect.top + e.global.y;

  this.parent.eventBus.emit(Events.C2D_SHOW_ANGLE_INPUT_MODAL, {
    x: domX,
    y: domY,
    angle: currentAngle,
    dragAngleStep: this.parent.layers.planner.state.dragAngleStepDeg,
    onApply: (value: number) => {
      this.parent.layers.planner.setActiveWallAngleByPoint0(value);
      this.drawAngleBetweenWalls();
    },
    onApplyDragAngleStep: (value: number) => {
      this.parent.layers.planner.setDragAngleStepDeg(value);
    },
  });

  try {
    e.preventDefault();
  } catch {
    // no-op
  }
  e.stopPropagation();
}
