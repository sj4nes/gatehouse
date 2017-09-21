'use strict';
const common = require('../common');
const assert = require('assert');
const Stream = require('stream').Stream;

{
  const source = new Stream();
  const dest = new Stream();

  source.pipe(dest);

  let gotErr = null;
  source.on('error', function(err) {
    gotErr = err;
  });

  const err = new Error('This stream turned into bacon.');
  source.emit('error', err);
  assert.strictEqual(gotErr, err);
}

{
  const source = new Stream();
  const dest = new Stream();

  source.pipe(dest);

  const err = new Error('This stream turned into bacon.');

  let gotErr = null;
  try {
    source.emit('error', err);
  } catch (e) {
    gotErr = e;
  }

  assert.strictEqual(gotErr, err);
}

{
  const R = Stream.Readable;
  const W = Stream.Writable;

  const r = new R();
  const w = new W();
  let removed = false;

  r._read = common.mustCall(function() {
    setTimeout(common.mustCall(function() {
      assert(removed);
      assert.throws(function() {
        w.emit('error', new Error('fail'));
      }, /^Error: fail$/);
    }), 1);
  });

  w.on('error', myOnError);
  r.pipe(w);
  w.removeListener('error', myOnError);
  removed = true;

  function myOnError() {
    throw new Error('this should not happen');
  }
}

{
  const R = Stream.Readable;
  const W = Stream.Writable;

  const r = new R();
  const w = new W();
  let removed = false;

  r._read = common.mustCall(function() {
    setTimeout(common.mustCall(function() {
      assert(removed);
      w.emit('error', new Error('fail'));
    }), 1);
  });

  w.on('error', common.mustCall());
  w._write = () => {};

  r.pipe(w);
  // Removing some OTHER random listener should not do anything
  w.removeListener('error', () => {});
  removed = true;
}
