/**
 * FIFO Queue utility for managing toast notifications and sequential items
 */

export interface QueueItem<T = unknown> {
  id: string;
  data: T;
  timestamp: number;
}

export interface UseQueueOptions {
  maxSize?: number;
  autoCleanup?: boolean;
  cleanupDelay?: number;
}

export interface UseQueueReturn<T> {
  items: QueueItem<T>[];
  size: number;
  enqueue: (_data: T, _id?: string) => string;
  dequeue: () => QueueItem<T> | null;
  remove: (_id: string) => boolean;
  clear: () => void;
  peek: () => QueueItem<T> | null;
  isEmpty: () => boolean;
  isFull: () => boolean;
  toArray: () => QueueItem<T>[];
}

let queueCounter = 0;

/**
 * Framework-agnostic FIFO queue implementation
 * Ideal for managing toast notifications, background tasks, or any sequential processing
 */
export function createQueue<T = unknown>(
  options: UseQueueOptions = {}
): UseQueueReturn<T> {
  const { maxSize = 10, autoCleanup = false, cleanupDelay = 5000 } = options;

  let items: QueueItem<T>[] = [];
  const listeners = new Set<() => void>();

  /**
   * Notify all listeners of queue changes
   */
  function notifyListeners() {
    listeners.forEach(listener => listener());
  }

  /**
   * Generate unique ID for queue items
   */
  function generateId(): string {
    return `queue-item-${++queueCounter}-${Date.now()}`;
  }

  /**
   * Add item to the end of the queue
   */
  function enqueue(data: T, id?: string): string {
    const itemId = id || generateId();
    const newItem: QueueItem<T> = {
      id: itemId,
      data,
      timestamp: Date.now(),
    };

    // Remove oldest item if queue is full
    if (items.length >= maxSize) {
      items.shift();
    }

    items.push(newItem);
    notifyListeners();

    // Auto cleanup if enabled
    if (autoCleanup) {
      setTimeout(() => {
        remove(itemId);
      }, cleanupDelay);
    }

    return itemId;
  }

  /**
   * Remove and return the first item from the queue
   */
  function dequeue(): QueueItem<T> | null {
    if (items.length === 0) return null;

    const item = items.shift()!;
    notifyListeners();
    return item;
  }

  /**
   * Remove specific item by ID
   */
  function remove(id: string): boolean {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    notifyListeners();
    return true;
  }

  /**
   * Clear all items from the queue
   */
  function clear(): void {
    items = [];
    notifyListeners();
  }

  /**
   * Peek at the first item without removing it
   */
  function peek(): QueueItem<T> | null {
    return items.length > 0 ? items[0] : null;
  }

  /**
   * Check if queue is empty
   */
  function isEmpty(): boolean {
    return items.length === 0;
  }

  /**
   * Check if queue is full
   */
  function isFull(): boolean {
    return items.length >= maxSize;
  }

  /**
   * Get copy of all items as array
   */
  function toArray(): QueueItem<T>[] {
    return [...items];
  }

  /**
   * Subscribe to queue changes
   */
  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    get items() {
      return [...items];
    },
    get size() {
      return items.length;
    },
    enqueue,
    dequeue,
    remove,
    clear,
    peek,
    isEmpty,
    isFull,
    toArray,
    // Internal method for framework integrations
    _subscribe: subscribe,
  } as UseQueueReturn<T> & { _subscribe: typeof subscribe };
}

/**
 * Vue 3 composable for reactive queue
 */
export function useQueue<T = unknown>(
  options: UseQueueOptions = {}
): UseQueueReturn<T> {
  // This will be implemented per framework
  return createQueue<T>(options);
}

/**
 * Utility types for common queue use cases
 */
export interface ToastData {
  message: string;
  variant?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface NotificationData {
  title: string;
  message?: string;
  icon?: string;
  urgent?: boolean;
  category?: string;
}

export interface TaskData {
  name: string;
  progress?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

/**
 * Pre-configured queue factories for common use cases
 */
export const createToastQueue = (options?: UseQueueOptions) =>
  createQueue<ToastData>({
    maxSize: 5,
    autoCleanup: true,
    cleanupDelay: 5000,
    ...options,
  });

export const createNotificationQueue = (options?: UseQueueOptions) =>
  createQueue<NotificationData>({
    maxSize: 20,
    autoCleanup: false,
    ...options,
  });

export const createTaskQueue = (options?: UseQueueOptions) =>
  createQueue<TaskData>({
    maxSize: 100,
    autoCleanup: false,
    ...options,
  });

/**
 * Queue utilities for common operations
 */
export const QueueUtils = {
  /**
   * Find item by predicate
   */
  find<T>(
    queue: UseQueueReturn<T>,
    predicate: (_item: QueueItem<T>) => boolean
  ): QueueItem<T> | null {
    return queue.items.find(predicate) || null;
  },

  /**
   * Filter items by predicate
   */
  filter<T>(
    queue: UseQueueReturn<T>,
    predicate: (_item: QueueItem<T>) => boolean
  ): QueueItem<T>[] {
    return queue.items.filter(predicate);
  },

  /**
   * Remove items older than specified time
   */
  removeOlderThan<T>(queue: UseQueueReturn<T>, maxAge: number): number {
    const cutoff = Date.now() - maxAge;
    const oldItems = queue.items.filter(item => item.timestamp < cutoff);

    oldItems.forEach(item => queue.remove(item.id));
    return oldItems.length;
  },

  /**
   * Get items newer than specified time
   */
  getRecent<T>(queue: UseQueueReturn<T>, maxAge: number): QueueItem<T>[] {
    const cutoff = Date.now() - maxAge;
    return queue.items.filter(item => item.timestamp >= cutoff);
  },
};
