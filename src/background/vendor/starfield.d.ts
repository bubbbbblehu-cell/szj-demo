export function createStarfield(root:HTMLElement, options?:Record<string,unknown>): {
  destroy():void;
  update(options?:Record<string,unknown>):void;
  getState():Record<string,unknown>;
};
