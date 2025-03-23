/** Based on https://github.com/datastructures-js/queue (MIT - Copyright (c) 2020 Eyas Ranjous) */

/**
 * A queue implementation with O(1) dequeue.
 * Keeps values in the array until half of the array is removed.
 */
export class Queue<T> implements Iterable<T> {
  constructor(private elements: T[] = []) {}
  private offset = 0

  /**
   * Adds an element to the back of the queue.
   * @param element the element to add
   * @returns the queue for chaining
   */
  enqueue(element: T) {
    this.elements.push(element)
    return this
  }
  /**
   * Adds an element to the back of the queue.
   * @param element the element to add
   * @returns the queue for chaining
   */
  push(element: T) {
    return this.enqueue(element)
  }

  /**
   * Dequeues the front element in the queue.
   * @returns the dequeued element or null if the queue is empty
   */
  dequeue() {
    if (this.isEmpty()) return null

    const first = this.front()
    this.offset += 1

    // NOTE: only remove dequeued elements when reaching half size to decrease latency of shifting elements.
    if (this.offset * 2 >= this.elements.length) this.shrink()
    return first
  }
  /**
   * Dequeues the front element in the queue.
   * @returns the dequeued element or null if the queue is empty
   */
  pop() {
    return this.dequeue()
  }

  /**
   * Shrinks the queue to the number of elements in the queue.
   */
  shrink() {
    this.elements = this.toArray()
    this.offset = 0
  }

  /**
   * Get an iterator for the queue.
   * @returns an iterator for the queue
   */
  [Symbol.iterator]() {
    this.shrink()
    return this.elements[Symbol.iterator]()
  }

  /**
   * Get the front element of the queue without removing it.
   * @returns the front element or null if the queue is empty
   */
  front() {
    return !this.isEmpty() ? this.elements[this.offset] : null
  }
  /**
   * Get the back element of the queue without removing it.
   * @returns the back element or null if the queue is empty
   */
  back() {
    return !this.isEmpty() ? this.elements[this.elements.length - 1] : null
  }
  /**
   * Get the element at the given index.
   * @param index the index of the element
   * @returns the element or undefined if the index is out of range
   */
  at(index: number) {
    return index >= 0 && index < this.size() ? this.elements[this.offset + index] : undefined
  }

  /**
   * Returns the number of elements in the queue.
   * @returns the number of elements in the queue
   */
  size() {
    return this.elements.length - this.offset
  }
  /**
   * Returns the number of elements in the queue.
   * @returns the number of elements in the queue
   */
  get length() {
    return this.size()
  }
  /**
   * Checks if the queue is empty.
   * @returns whether the queue is empty
   */
  isEmpty() {
    return this.offset >= this.elements.length
  }

  /**
   * Returns the remaining elements in the queue as an array.
   * @returns an array of the remaining elements in the queue
   */
  toArray() {
    return this.elements.slice(this.offset)
  }
  /**
   * Clears the queue.
   */
  clear() {
    this.elements = []
    this.offset = 0
  }

  /**
   * Creates a shallow copy of the queue.
   * @returns a new queue with the same elements
   */
  clone() {
    return new Queue(this.toArray())
  }
  /**
   * Creates a queue from an existing iterable.
   * @param iterable the array to create the queue from
   * @returns a new queue given elements
   */
  static from<T>(iterable: Iterable<T> | ArrayLike<T>) {
    return new Queue(Array.from(iterable))
  }
}
