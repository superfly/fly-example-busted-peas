fly.http.respondWith(function(request) {

  const respFn = async () => {
    return message()
  }

  const cacheKey = versionKey(new URL(request.url).pathname)
  return tryCache(cacheKey, respFn)
})

/*
 * Dynamic message example that adds timestamp so it's easy to see when there's a
 * cache hit vs cache miss.
 */
function message() {
  return `Hello! We only serve whirled peas. Generated: ${new Date().toString()}`
}

/*
 * The `fly.cache` is a volatile, k/v store for keeping data in each edge location.
 * It's useful for storing fully rendered versions of backend data, and can reduce request
 * times by an order of magnitude.
 *
 * For this application, a generic `tryCache` function is useful. It takes a cache key,
 * which is generated based on the requested file, and a function for generating content
 * when the cache has no data for a given request.
 */
async function tryCache(key, fillFn) {
  let cacheStatus = "MISS"

  /*
   * We may want to apply cache filling logic in multiple places, wrapping it in a
   * new async function is a convenient way to do that.
   */
  async function fillAndSet() {
    const body = await fillFn();
    if (!body) {
      /*
       * When the fillFn returns nothing, no caching.
       */
      return
    }
    const entry = {
      body: body,
      time: Date.now()
    }
    fly.cache.set(key, JSON.stringify(entry), 3600)
    return entry
  }

  let cached = await fly.cache.getString(key)

  if (!cached) {
    console.log("cache miss:", key)
    cached = await fillAndSet()
    cacheStatus = "MISS"
  } else {
    console.log("cache hit:", key)
    cacheStatus = "HIT"

    cached = JSON.parse(cached)
    /*
     * If the cached entry is more than 30 seconds old, refresh it in the background.
     *
     * Since `fillAndSet` is an async function, it returns a promise immediately
     * and doesn't affect response time.
     */
    if (cached.time < (Date.now() - 30000)) {
      fillAndSet().then(function(result) {
        console.log("cache refreshed:", key)
      }).catch(function(err) {
        console.log("error in refresh")
        console.error("cache refresh failed:", err)
      })
      cacheStatus = "HIT+REFRESH"
    }
  }

  if (!cached) {
    return new Response(message(), {
      headers: {
        'content-type': 'text/html',
        'x-cache': cacheStatus
      }
    })
  }
  /*
   * The response includes an X-cache headers, which is a pseudo standard way of indicating
   * whether the data comes from the cache, or was generated anew.
   */
  return new Response(cached.body, {
    headers: {
      'content-type': 'text/html',
      'x-cache': cacheStatus
    }
  })

}

/*
 * The best way to purge the entire cache for your app is to change the every single key
 * used for look up. Here, we can pair with the app config that can be committed to your
 * .fly.yml file and deployed to Fly Edge Servers
 */
function versionKey(key) {
  const cacheVersion = app.config.cache_version

  return `${cacheVersion}:${key}`
}