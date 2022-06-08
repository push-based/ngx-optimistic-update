import { Action } from '@ngrx/store';
// TODO: add tests
/**
 * Forked from @nrwl/angular#dataPersistence
 * @see https://github.com/nrwl/nx/blob/master/packages/angular/src/runtime/nx/data-persistence.ts
 *
 * tests not provided: disabled ~2yrs ago  (commit: d0cbc35efa0a69ba280a4fde36747abb25ce271d)
 * @see https://github.com/nrwl/nx/commit/d0cbc35efa0a69ba280a4fde36747abb25ce271d#diff-84d57e702f1b74b963b2f2d631a70e78e5db73c56483fd7b655b86b06f4136fb
 * */
import { concatMap, groupBy, Observable } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import { mapActionAndState } from './internal/map-action-and-state.util';
import { ActionStatesStream, OptimisticUpdateOpts } from './internal/model';
import { runWithErrorHandling } from './internal/run-with-error-handling.util';

export function optimisticUpdate<T extends Array<unknown>, A extends Action>(
  opts: OptimisticUpdateOpts<T, A>
) {
  return (source: ActionStatesStream<T, A>): Observable<Action> => {
    return source.pipe(
      mapActionAndState(),
      concatMap(runWithErrorHandling(opts.run, opts.undoAction))
    );
  };
}

/**
 * See {@link DataPersistence.fetch} for more information.
 */
export interface FetchOpts<T extends Array<unknown>, A> {
  id?(a: A, ...slices: [...T]): any;
  run(a: A, ...slices: [...T]): Action | Observable<Action> | void;
  onError?(a: A, e: any): Observable<any> | any;
}

export function fetch<T extends Array<unknown>, A extends Action>(
  opts: FetchOpts<T, A>
) {
  return (source: ActionStatesStream<T, A>): Observable<Action> => {
    if (opts.id) {
      const groupedFetches = source.pipe(
        mapActionAndState(),
        groupBy(([action, ...store]) => {
          return opts.id(action, ...store);
        })
      );

      return groupedFetches.pipe(
        mergeMap((pairs) =>
          pairs.pipe(switchMap(runWithErrorHandling(opts.run, opts.onError)))
        )
      );
    }

    return source.pipe(
      mapActionAndState(),
      concatMap(runWithErrorHandling(opts.run, opts.onError))
    );
  };
}
