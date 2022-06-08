import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

export interface OptimisticUpdateOpts<T extends Array<unknown>, A> {
  run(a: A, ...slices: [...T]): Action | Observable<Action> | void;
  undoAction(a: A, e: any, ...slices: [...T]): Action | Observable<Action>;
}

export type ActionOrActionWithStates<T extends Array<unknown>, A> =
  | A
  | [A, ...T];

export type ActionStatesStream<T extends Array<unknown>, A> = Observable<
  ActionOrActionWithStates<T, A>
>;
