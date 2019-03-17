package com.manning.mss.ch05.sample01.gateway.filters;

import java.util.ArrayList;
import org.apache.commons.collections.MapIterator;
import org.apache.commons.collections.map.LRUMap;

public class CounterCache<K, T> {

    private long timeToLive;
    private LRUMap counterMap;

    protected class CounterObject {
        public long createdTime = System.currentTimeMillis();
        public T value;

        protected CounterObject(T value) {
            this.value = value;
        }
    }

    /**
     * Constructor of the LRU cache.
     * @param counterTimeToLive - Cache TTL (
     * @param counterTimerInterval - Cleanup Interval in seconds.
     * @param maxItems - maximum number of entries in cache.
     */
    public CounterCache(long counterTimeToLive, final long counterTimerInterval, int maxItems) {
        this.timeToLive = counterTimeToLive * 1000;

        counterMap = new LRUMap(maxItems);

        if (timeToLive > 0 && counterTimerInterval > 0) {

            Thread t = new Thread(new Runnable() {
                public void run() {
                    while (true) {
                        try {
                            Thread.sleep(counterTimerInterval * 1000);
                        } catch (InterruptedException ex) {
                        }
                        cleanup();
                    }
                }
            });

            t.setDaemon(true);
            t.start();
        }
    }

    public void put(K key, T value) {
        synchronized (counterMap) {
            counterMap.put(key, new CounterObject(value));
        }
    }

    @SuppressWarnings("unchecked")
    public T get(K key) {
        synchronized (counterMap) {
            CounterObject c = (CounterObject) counterMap.get(key);

            if (c == null)
                return null;
            else {
                return c.value;
            }
        }
    }

    public void remove(K key) {
        synchronized (counterMap) {
            counterMap.remove(key);
        }
    }

    public int size() {
        synchronized (counterMap) {
            return counterMap.size();
        }
    }

    @SuppressWarnings("unchecked")
    public void cleanup() {

        long now = System.currentTimeMillis();
        ArrayList<K> deleteKey = null;

        synchronized (counterMap) {
            MapIterator itr = counterMap.mapIterator();

            deleteKey = new ArrayList<K>((counterMap.size() / 2) + 1);
            K key = null;
            CounterObject c = null;

            while (itr.hasNext()) {
                key = (K) itr.next();
                c = (CounterObject) itr.getValue();

                if (c != null && (now > (timeToLive + c.createdTime))) {
                    deleteKey.add(key);
                }
            }
        }

        for (K key : deleteKey) {
            synchronized (counterMap) {
                counterMap.remove(key);
            }

            Thread.yield();
        }
    }
}
