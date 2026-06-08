import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { splitWords, toCase } from '../src/server.js';

test('splits mixed-case identifiers', () => {
  assert.deepEqual(splitWords('someXMLParser'), ['some', 'xml', 'parser']);
  assert.deepEqual(splitWords('my-Mixed_thing'), ['my', 'mixed', 'thing']);
  assert.deepEqual(splitWords('HelloWorld'), ['hello', 'world']);
});

test('camelCase', () => {
  assert.equal(toCase('hello world', 'camel'), 'helloWorld');
  assert.equal(toCase('foo-bar-baz', 'camel'), 'fooBarBaz');
});

test('PascalCase', () => {
  assert.equal(toCase('hello world', 'pascal'), 'HelloWorld');
});

test('snake_case', () => {
  assert.equal(toCase('HelloWorld', 'snake'), 'hello_world');
});

test('CONSTANT_CASE', () => {
  assert.equal(toCase('helloWorld', 'constant'), 'HELLO_WORLD');
});

test('kebab-case', () => {
  assert.equal(toCase('HelloWorld', 'kebab'), 'hello-world');
});

test('Train-Case', () => {
  assert.equal(toCase('helloWorld', 'train'), 'Hello-World');
});

test('dot.case', () => {
  assert.equal(toCase('helloWorld', 'dot'), 'hello.world');
});

test('path/case', () => {
  assert.equal(toCase('helloWorld', 'path'), 'hello/world');
});

test('Title Case', () => {
  assert.equal(toCase('hello world', 'title'), 'Hello World');
});

test('Sentence case', () => {
  assert.equal(toCase('hello WORLD', 'sentence'), 'Hello world');
});

test('lower and upper styles', () => {
  assert.equal(toCase('helloWorld', 'lower'), 'hello world');
  assert.equal(toCase('helloWorld', 'upper'), 'HELLO WORLD');
});

test('preserves non-ASCII letters', () => {
  // Previously these accented/non-Latin characters were silently stripped.
  assert.deepEqual(splitWords('café résumé'), ['café', 'résumé']);
  assert.deepEqual(splitWords('naïveCase'), ['naïve', 'case']);
  assert.deepEqual(splitWords('δοκιμή Test'), ['δοκιμή', 'test']);
  assert.equal(toCase('café résumé', 'snake'), 'café_résumé');
  assert.equal(toCase('naïveCase', 'kebab'), 'naïve-case');
});

test('splits digit boundaries', () => {
  assert.deepEqual(splitWords('version2Point0'), ['version', '2', 'point', '0']);
});

test('empty input returns empty string', () => {
  assert.equal(toCase('', 'camel'), '');
});
