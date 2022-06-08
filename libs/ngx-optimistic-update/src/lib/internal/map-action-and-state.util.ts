import { Observable, map } from 'rxjs';
import { ActionOrActionWithStates } from './model';
import { normalizeActionAndState } from './normalize-action-and-state.util';

/**
 * @whatItDoes maps Observable<Action | [Action, State]> to
 * Observable<[Action, State]>
 */
export function mapActionAndState<T extends Array<unknown>, A>() {
  return (source: Observable<ActionOrActionWithStates<T, A>>) => {
    return source.pipe(
      map((value) => normalizeActionAndState(value) as [A, ...T])
    );
  };
}
