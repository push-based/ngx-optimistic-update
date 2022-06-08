import { coerceObservable } from '@rx-angular/cdk/coercing';
import { Observable, catchError } from 'rxjs';

export function runWithErrorHandling<T extends Array<unknown>, A, R>(
  run: (a: A, ...slices: [...T]) => Observable<R> | R | void,
  onError: any
) {
  return ([action, ...slices]: [A, ...T]): Observable<R> => {
    try {
      const r = coerceObservable(
        run(action, ...slices) as R
      ) as unknown as Observable<R>;
      return r.pipe(
        catchError(
          (e) => coerceObservable(onError(action, e, ...slices) as any) as any
        )
      ) as Observable<R>;
    } catch (e) {
      return coerceObservable(onError(action, e, ...slices) as any) as any;
    }
  };
}
