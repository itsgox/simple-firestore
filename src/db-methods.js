const { collection: collection_, getDoc, setDoc, doc, deleteDoc: deleteDoc_ } = require('@firebase/firestore')
const objectPath = require("object-path")

function getMethods(db, redis, useCache, cacheTTL) {

    // --------------------- Set ---------------------

    async function set(path, field, value, customTTL) {

        customTTL = customTTL ? typeof customTTL === 'number' ? customTTL : 0 : 0

        try {
            // Settings

            const pathData = path ? path.includes('/') ? path.split('/') : null : null
            if (!pathData) throw new Error('Invalid path! Must include a "/"')

            const collection = pathData[0]
            const document = pathData[1]

            // Prepare Data (Database)

            let data = {}
            if (field && field !== '') objectPath.set(data, field, value)
            else data = value

            // Save

            await setDoc(doc(db, collection, document), data, { merge: field && field !== '' ? true : false })

            // Cache

            if (useCache) {

                // Save to Cache

                let cachedData = await redis.get(path) || '{}'
                cachedData = JSON.parse(cachedData)
                if (field && field !== '') {
                    objectPath.set(cachedData, field, value)
                    await redis.del(`${path}_${field}_status`)
                }
                else cachedData = value
                cachedData = JSON.stringify(cachedData)
                await redis.setEx(path, customTTL > 0 ? customTTL : cacheTTL, cachedData)
            }

            return true
        }
        catch (err) { console.log(err) }
    }

    // --------------------- Get ---------------------

    async function get(path, field) {

        try {
            let data = undefined
            let fieldStatus = false

            // Get From Cache

            if (useCache) {

                // Get Data

                data = await redis.get(path)
                data = JSON.parse(data)
                if (field && field !== '') data = objectPath.get(data, field)

                // Check Field Status

                if (field && field !== '') {
                    fieldStatus = await redis.get(`${path}_${field}_status`)
                    fieldStatus = JSON.parse(fieldStatus)
                }
            }
            
            // Get From Database

            if (!data && !fieldStatus) {
                
                // Settings

                const pathData = path ? path.includes('/') ? path.split('/') : null : null
                if (!pathData) throw new Error('Invalid path! Must include a "/"')

                const collection = pathData[0]
                const document = pathData[1]

                // Get Data

                data = (await getDoc(doc(db, collection, document))).data()

                if (data) {

                    // Save to Cache

                    if (useCache) await redis.setEx(path, cacheTTL, JSON.stringify(data))

                    // Field

                    if (field && field !== '') {

                        // Get Field

                        data = objectPath.get(data, field)

                        // Set Field Status

                        if (useCache) await redis.setEx(`${path}_${field}_status`, cacheTTL, JSON.stringify(true))
                    }
                }
            }

            return data ? data : undefined
        }
        catch (err) { console.log(err) }
    }

    // --------------------- Delete Field ---------------------

    async function deleteField(path, field) {

        try {
            // Get Current Data

            const data = await get(path, '')
            delete data[field]

            // Delete Field

            await set(path, '', data)
        }
        catch (err) { console.log(err) }
    }

    // --------------------- Delete Document ---------------------

    async function deleteDoc(path) {

        try {
            // Settings

            const pathData = path ? path.includes('/') ? path.split('/') : null : null
            if (!pathData) throw new Error('Invalid path! Must include a "/"')

            const collection = pathData[0]
            const document = pathData[1]

            // Delete Document

            await deleteDoc_(doc(db, collection, document))
        }
        catch (err) { console.log(err) }
    }

    // --------------------- Return Methods ---------------------

	return { set, get, deleteField, deleteDoc }
}

module.exports = getMethods