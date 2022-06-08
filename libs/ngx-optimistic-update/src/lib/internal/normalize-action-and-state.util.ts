import { ActionOrActionWithStates } from './model';

/**
 * @whatItDoes Normalizes either a bare action or an array of action and slices
 * into an array of action and slices (or undefined)
 */
export function normalizeActionAndState<T extends Array<unknown>, A>(
  args: ActionOrActionWithStates<T, A>
): [A, ...T] {
  let action: A, slices: T;

  if (Array.isArray(args)) {
    [action, ...slices] = args;
  } else {
    slices = [] as unknown as T;
    action = args;
  }

  return [action, ...slices];
}
