/* eslint-disable no-empty-pattern */
import { normalizeActionAndState } from './internal/normalize-action-and-state.util';
import { mapActionAndState } from './internal/map-action-and-state.util';
import { marbles } from 'rxjs-marbles/jest';
import { runWithErrorHandling } from './internal/run-with-error-handling.util';
import { concatMap, of } from 'rxjs';
import { fakeAsync, flush } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { optimisticUpdate, fetch } from './optimistic-update';
describe('optimistic update', () => {
  describe('normalizeActionAndState', () => {
    it('should return array if args an array', () => {
      expect(normalizeActionAndState([1, 2, 3])).toEqual([1, 2, 3]);
    });
    it('should return array if args NOT an array', () => {
      expect(normalizeActionAndState(1)).toEqual([1]);
    });
  });

  describe('mapActionAndState', () => {
    it(
      'should return array if source not array',
      marbles((m) => {
        const a = m.hot('-a-b-c|', { a: 1, b: 2, c: 3 });
        const expected = m.cold('-a-b-c|', { a: [1], b: [2], c: [3] });
        const destination = a.pipe(mapActionAndState() as any);
        m.expect(destination).toBeObservable(expected);
      })
    );

    it(
      'should return array if source is array',
      marbles((m) => {
        const a = m.hot('-a-b-c|', { a: [1, 2, 3], b: [3, 4], c: [4] });
        const expected = m.cold('-a-b-c|', { a: [1, 2, 3], b: [3, 4], c: [4] });
        const destination = a.pipe(mapActionAndState() as any);
        m.expect(destination).toBeObservable(expected);
      })
    );
  });

  describe('runWithErrorHandling', () => {
    it(
      'should call run function if no error happening',
      marbles((m) => {
        const values = {
          a: ['a', { name: 'a', value: 1 }],
          b: ['b', { name: 'b', value: 2 }],
          c: ['c', { name: 'c', value: 3 }],
        };
        const run = (action, { value }) => `${action}: ${value}`;

        const a = m.hot('-a-b-c|', values);
        const expected = m.cold('-a-b-c|', { a: 'a: 1', b: 'b: 2', c: 'c: 3' });
        const destination = a.pipe(
          concatMap(runWithErrorHandling(run, () => null)) as any
        );
        m.expect(destination).toBeObservable(expected);
      })
    );

    it('should call error handler if run throws an error', fakeAsync(() => {
      const handlers = {
        run: () => {
          throw new Error('error');
        },
        onError: (_, __, payload) => payload,
      };

      const errorSpy = jest.spyOn(handlers, 'onError');

      of(['a', { value: 1, name: 'a' }])
        .pipe(
          concatMap(runWithErrorHandling(handlers.run, handlers.onError)) as any
        )
        .subscribe(() => expect(errorSpy).toBeCalled());

      flush();
    }));

    it('should call error handler if run returns throwError', fakeAsync(() => {
      const handlers = {
        run: () => throwError(() => new Error('ERROR')),
        onError: (_, __, payload) => payload,
      };

      const errorSpy = jest.spyOn(handlers, 'onError');

      of(['a', { value: 1, name: 'a' }])
        .pipe(
          concatMap(runWithErrorHandling(handlers.run, handlers.onError)) as any
        )
        .subscribe(() => expect(errorSpy).toBeCalled());

      flush();
    }));
  });

  describe('optimisticUpdate', () => {
    it('should call run and undoAction', fakeAsync(() => {
      const handlers = {
        run: () => throwError(() => new Error('ERROR')),
        onError: (_, __, payload) => payload,
      };
      const runSpy = jest.spyOn(handlers, 'run');
      const errorSpy = jest.spyOn(handlers, 'onError');
      of(null)
        .pipe(
          optimisticUpdate({
            run: handlers.run,
            undoAction: handlers.onError as any,
          })
        )
        .subscribe(() => {
          expect(runSpy).toBeCalled();
          expect(errorSpy).toBeCalled();
        });

      flush();
    }));
  });

  describe('fetch', () => {
    it('should call id, run and undoAction', fakeAsync(() => {
      const handlers = {
        id: () => null,
        run: () => throwError(() => new Error('ERROR')),
        onError: (_, __, payload) => payload,
      };
      const idSpy = jest.spyOn(handlers, 'id');
      const runSpy = jest.spyOn(handlers, 'run');
      const errorSpy = jest.spyOn(handlers, 'onError');
      of(null)
        .pipe(
          fetch({
            id: handlers.id,
            run: handlers.run,
            onError: handlers.onError as any,
          })
        )
        .subscribe(() => {
          expect(idSpy).toBeCalled();
          expect(runSpy).toBeCalled();
          expect(errorSpy).toBeCalled();
        });

      flush();
    }));
    it('should work without id', fakeAsync(() => {
      const handlers = {
        run: () => throwError(() => new Error('ERROR')),
        onError: (_, __, payload) => payload,
      };
      const runSpy = jest.spyOn(handlers, 'run');
      const errorSpy = jest.spyOn(handlers, 'onError');
      of(null)
        .pipe(
          fetch({
            run: handlers.run,
            onError: handlers.onError as any,
          })
        )
        .subscribe(() => {
          expect(runSpy).toBeCalled();
          expect(errorSpy).toBeCalled();
        });

      flush();
    }));

    it('should work with id undefined', fakeAsync(() => {
      const handlers = {
        run: () => throwError(() => new Error('ERROR')),
        onError: (_, __, payload) => payload,
      };
      const runSpy = jest.spyOn(handlers, 'run');
      const errorSpy = jest.spyOn(handlers, 'onError');
      of(null)
        .pipe(
          fetch({
            id: undefined,
            run: handlers.run,
            onError: handlers.onError as any,
          })
        )
        .subscribe(() => {
          expect(runSpy).toBeCalled();
          expect(errorSpy).toBeCalled();
        });

      flush();
    }));
  });
});
