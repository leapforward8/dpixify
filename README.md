
dpixify.com is an app running on the STEEM blockchain that offers royalty-free stock photos and graphics.

## Add Variables

1. process.env.clientID

2. process.env.clientSecret

## Connect To SteemConnect

```
  new Strategy(
    {
      authorizationURL: `https://steemconnect.com/oauth2/authorize`,
      tokenURL: `https://steemconnect.com/oauth2/token`,
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: `http://localhost:3000/auth/oauth/oauth2/callback`,
      scope: ["offline", "vote"]
    },```

3. Make sure your settings are the exactly the same as seen on your http://steemconnect.com/dashboard
