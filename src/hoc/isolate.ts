import cycleIsolate from '@cycle/isolate';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';

export interface Isolate {
  (config: ((sources: any) => null | string | {})): HigherOrderComponent;
}

const isolate: Isolate = config => BaseComponent => sources =>
  config === undefined
    ? cycleIsolate(BaseComponent)(sources)
    : cycleIsolate(BaseComponent, config(sources))(sources);

export default isolate;
