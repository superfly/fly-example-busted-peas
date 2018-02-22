# Fly Edge App Example - Busted Peas

Busted is a toy example of caching content using Fly and implementing an app-wide cache purge.

## Installing

1. Install Node.js

2. Clone this git repo.
```
git clone https://github.com/superfly/fly-example-busted-peas.git
```

3. Install dependencies
```
cd fly-example-busted-peas && npm install
```

4. Start the local server
```
fly server
```

5. Browse to http://localhost:3000/ and you should see the App in action.

## Deploying

The best part is, there's nothing special about this app. You can grab it and
run it as your own on Fly's global edge infrastructure in a few simple steps:

1. Sign up for [Fly Edge Beta](https://fly.io/mix/edge-applications/) and create your account.

2. (Assuming you already installed this app locally) Create your own App on Fly:

```
# provide your login credentials
fly login

# create your app on Fly
# get your org name from `fly orgs`
fly apps create my-org/my-fly-app
```

3. Create `.fly.yml` file:

```
# .fly.yml

app_id: my-org/my-fly-app
```

4. Add your hostname to your Fly App:

```
fly hostnames add my-fly-app.hostname.com
```

5. Go to your DNS provider and add a CNAME for _my-fly-app.hostname.com_ to
point to **beta.edge.fly.io**


