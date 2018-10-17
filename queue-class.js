'use strict';

const dogs = require('./dogs.json');
const cats = require('./cats.json');

class _NodeQueues {
  constructor(value) {
    (this.value = value), (this.next = null), (this.prev = null);
  }
}

class Queue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  enqueue(data) {
    const node = new _NodeQueues(data);

    if (this.first === null) {
      this.first = node;
    }

    if (this.last) {
      node.next = this.last;
      this.last.prev = node;
    }
    this.last = node;
  }

  dequeue() {
    if (this.first === null) {
      return;
    }

    const node = this.first;
    this.first = node.prev;

    if (node === this.last) {
      this.last = null;
    }

    return node.value;
  }

  peek() {
    return this.first.value;
  }
}

const dogQ = new Queue();
const catQ = new Queue();

dogs.forEach(dog => dogQ.enqueue(dog));
cats.forEach(cat => catQ.enqueue(cat));

module.exports = { dogQ, catQ };
