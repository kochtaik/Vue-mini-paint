import { App, inject } from "vue";
import { TrackerModule } from "./trackerModule";
import { ITrackConfig, ITracker } from "./trackerTypes";

const TRACKER_SYMBOL = Symbol("tracker");

export default {
  install: (app: App, config: ITrackConfig): void => {
    const trackerModule = TrackerModule.getInstance(config);

    app.provide(TRACKER_SYMBOL, trackerModule);
    /* for accessing plugin from the global variable */
    app.config.globalProperties.$tracker = trackerModule;
  },
};

export function useTracker(): ITracker {
  const tracker: ITracker | undefined = inject(TRACKER_SYMBOL);
  if (!tracker) {
    throw new Error("'Tracker' plugin not provided");
  }
  return tracker;
}
/* for accessing plugin from the global variable */
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $tracker: ITracker;
  }
}
