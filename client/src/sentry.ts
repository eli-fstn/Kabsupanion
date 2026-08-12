import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://2f4f9f2adc32b2282097d5c6ea6d8dce@o4511859020267520.ingest.us.sentry.io/4511898486767616",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  }
});