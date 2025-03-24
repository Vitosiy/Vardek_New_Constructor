export const Events = {
  C2D_MODIFY_WALL: 'C2D:modify-wall',
  C2D_REMOVE_WALL: 'C2D:remove-wall',
  C2D_SHOW_FORM_MODIFY_WALL: 'C2D:show-form-modify-wall',
  C2D_HIDE_FORM_MODIFY_WALL: 'C2D:hide-form-modify-wall',
  C2D_UPDATE_FORM_MODIFY_WALL: 'C2D:update-form-modify-wall',
  C2D_ADD_ROOM: 'C2D:add-room',
  C2D_REMOVE_ROOM: 'C2D:remove-room',
} as const;

export type EventsType = keyof typeof Events;