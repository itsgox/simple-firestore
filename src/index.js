const { initializeApp, getApps } = require('firebase/app')
const { getFirestore } = require('@firebase/firestore')
const { createClient } = require('redis')
const getMethods = require('./db-methods')

async function SimpleFirestore({ credentials, useCache, cacheTTL, cachePrefix, logs }) {

    // Check Values
    
    if (!credentials && typeof credentials !== 'object') throw new Error('Please provide your credentials!')
    useCache = useCache ? typeof useCache === 'boolean' ? useCache : false : false
    cacheTTL = cacheTTL ? typeof cacheTTL === 'number' ? cacheTTL : 60*60*2 : 60*60*2
    logs = logs ? typeof logs === 'boolean' ? logs : false : false

    // Connect to Firebase

    const apps = getApps();

    const app = apps.length >= 1 ? initializeApp(credentials, `NEW_${apps.length}`) : initializeApp(credentials)
    const firestore = getFirestore(app)

    if (logs) console.log('Connected to Firestore!')

    // Connect to Redis

    let redis

    if (useCache) {
        redis = createClient()
        await redis.connect()
        if (logs) console.log('Connected to Redis!')
    }

    // Start Database

    return getMethods(firestore, redis, useCache, cacheTTL, cachePrefix)
}

module.exports = SimpleFirestore