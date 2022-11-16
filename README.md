# Simple Firestore

**simple-firestore** is a simple module to easily interact with Firestore, with optional caching!

## Features

- Super **easy-to-use**
- **Optional caching** with Redis
- Very **customizable**
- Perfect for **Discord Bots**

## Requirements

- **[Firestore Database](https://firebase.google.com/products/firestore)** + App Credentials *(Web)*
- **[Redis](https://redis.io/download/)** installed on your device *(if cache is set to true)*

## Installation

```bash
npm install simple-firestore
```
```bash
yarn add simple-firestore
```

## Getting Started

### Example

```javascript
const SimpleFirestore = require("simple-firestore")

async function example() {

    const db = await SimpleFirestore({
        credentials: {
            apiKey: "<YOUR_API_KEY>",
            authDomain: "<YOUR_AUTH_DOMAIN>",
            projectId: "<YOUR_PROJECT_ID>",
            storageBucket: "<YOUR_STORAGE_BUCKET>",
            messagingSenderId: "<YOUR_MESSAGING_SENDER_ID>",
            appId: "<YOUR_APP_ID>"
        },
        useCache: true, 
        cacheTTL: 60*2, // seconds
        cachePrefix: "bot",
        logs: true
    })
}

example()
```

### What is that?

- **credentials**: these are the values you copy from your Firebase App
- **useCache**: enabling this option will use Redis to cache the data you're getting from Firebase, in order to avoid high amounts of reads on your database
- **cacheTTL**: the amount of time the data stays stored in cache (in seconds), this can be helpful for ensuring we don't waste resources on data that is not accessed often.
- **cachePrefix**: this is useful if you're running different projects in the same Redis server, and want each project to have their own cache prefix
- **logs**: receive logs on your terminal

## Methods

### .set(*path*, *field*, *value*, *customTTL?*)
This function adds/updates data in your database
```javascript
await db.set("users/12345", "test", { foo: "bar", simple: "example" })
```
*Using Dot Notation*
```javascript
await db.set("users/12345", "test.foo", "bar")

await db.set("users/12345", "test.simple", "example")
```

*Using Custom TTL (optional)*
```javascript
await db.set("users/12345", "test", { foo: "bar", simple: "example" }, 60*10)
```

### .get(*path*, *field*)
This function returns data from your database
```javascript
await db.get("users/12345", "test")
// -> { foo: "bar", simple: "example" }
```
*Using Dot Notation*
```javascript
await db.get("users/12345", "test.foo")
// -> "bar"

await db.get("users/12345", "test.simple")
// -> "example"
```

### .deleteField(*path*, *field*)
This function deletes a specific field from a document
```javascript
await db.deleteField("users/12345", "test")
```

### .deleteDoc(*path*)
This function deletes a specific document from a collection
```javascript
await db.deleteDoc("users/12345")